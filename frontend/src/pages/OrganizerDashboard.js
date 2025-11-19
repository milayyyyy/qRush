/* global globalThis */
import React, { useState, useEffect, useMemo, useCallback, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Plus,
  Calendar,
  BarChart3,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Settings,
  Download
} from 'lucide-react';
import { apiService } from '../services/api';
import { toast } from 'sonner';

const ORGANIZER_PROFILE_STORAGE_KEY = 'qrush_organizer_profile';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('events');
  const [profileForm, setProfileForm] = useState({
    organizationName: '',
    email: '',
    contactNumber: '',
  });
  const [defaultsForm, setDefaultsForm] = useState({
    location: '',
    price: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [defaultsSaving, setDefaultsSaving] = useState(false);
  const navigate = useNavigate();
  const organizationNameId = useId();
  const profileEmailId = useId();
  const contactNumberId = useId();
  const defaultLocationId = useId();
  const defaultPriceId = useId();

  const reloadPage = useCallback(() => {
    if (typeof globalThis !== 'undefined' && globalThis.location?.reload) {
      globalThis.location.reload();
    }
  }, []);

  const deriveEventPrice = useCallback((event, fallbackPrice) => {
    if (event.ticketPrice != null) {
      return String(event.ticketPrice);
    }
    if (event.price != null) {
      return String(event.price);
    }
    return fallbackPrice || '';
  }, []);

  const loadStoredProfile = useCallback(() => {
    try {
      const raw = localStorage.getItem(ORGANIZER_PROFILE_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (parsed?.userId && user?.id && parsed.userId !== user.id) {
        return null;
      }
      return parsed;
    } catch (parseError) {
      console.warn('Unable to parse stored profile settings', parseError);
      return null;
    }
  }, [user?.id]);

  const loadStoredDefaults = useCallback(() => {
    try {
      const raw = localStorage.getItem('qrush_organizer_defaults');
      return raw ? JSON.parse(raw) : null;
    } catch (parseError) {
      console.warn('Unable to parse stored organizer defaults', parseError);
      return null;
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    if (!user?.id) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getOrganizerDashboard(user.id);
      setDashboard(data);

      const storedProfile = loadStoredProfile();
      const storedDefaults = loadStoredDefaults();

      setProfileForm({
        organizationName: (storedProfile?.organizationName ?? user.name ?? '').trim(),
        email: (storedProfile?.email ?? user.email ?? '').trim(),
        contactNumber: typeof storedProfile?.contactNumber === 'string'
          ? storedProfile.contactNumber.trim()
          : '',
      });

      setDefaultsForm({
        location: storedDefaults?.location ?? '',
        price: storedDefaults?.price ?? '',
      });
    } catch (err) {
      console.error('Failed to load organizer dashboard', err);
      setError(err.message);
      toast.error('Unable to load organizer insights.');
    } finally {
      setLoading(false);
    }
  }, [loadStoredDefaults, loadStoredProfile, user?.email, user?.id, user?.name]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'TBD';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAttendancePercentage = (sold, capacity) => {
    if (!capacity) {
      return 0;
    }
    const ratio = Math.min(Math.max(sold / capacity, 0), 1);
    return Math.round(ratio * 100);
  };

  const publishedEvents = useMemo(
    () => (dashboard?.events ?? []).filter((event) => event.status === 'published'),
    [dashboard?.events]
  );

  const handleViewEvent = (eventId) => {
    if (eventId) {
      navigate(`/events/${eventId}`);
    }
  };

  const handleEditEvent = (eventId) => {
    if (eventId) {
      navigate(`/create-event/${eventId}`);
    }
  };

  const handleEventSettings = (event) => {
    if (!event) {
      return;
    }

    setDefaultsForm((prev) => ({
      location: event.location || prev.location,
      price: deriveEventPrice(event, prev.price),
    }));
    setActiveTab('settings');
    toast.info(`Settings prefilled with details from ${event.title}.`);
  };

  const handleDownloadReport = (type) => {
    const rows = (dashboard?.events ?? []).map((event) => ({
      Title: event.title,
      Status: event.status,
      Date: formatDate(event.eventStart),
      Capacity: event.capacity ?? 0,
      TicketsSold: event.ticketsSold ?? 0,
      Revenue: formatCurrency(event.revenue ?? 0),
      Views: (event.views ?? 0).toLocaleString(),
    }));

    const csvHeader = Object.keys(rows[0] || { Title: '', Status: '', Date: '', Capacity: '', TicketsSold: '', Revenue: '', Views: '' });
    const csvBody = [csvHeader.join(','), ...rows.map((row) => csvHeader.map((key) => JSON.stringify(row[key] ?? '')).join(','))].join('\n');

    const blob = new Blob([csvBody], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}_report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(`${type.replace('-', ' ')} exported.`);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    const trimmedProfile = {
      organizationName: profileForm.organizationName?.trim() || user.name || '',
      email: profileForm.email?.trim() || user.email || '',
      contactNumber: profileForm.contactNumber?.trim() || '',
    };
    try {
      setProfileSaving(true);
      const storedPayload = {
        ...trimmedProfile,
        userId: user?.id ?? null,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(ORGANIZER_PROFILE_STORAGE_KEY, JSON.stringify(storedPayload));
      setProfileForm({
        organizationName: trimmedProfile.organizationName,
        email: trimmedProfile.email,
        contactNumber: trimmedProfile.contactNumber,
      });
      const eventsToUpdate = (dashboard?.events ?? [])
        .map((eventSummary) => eventSummary.eventId)
        .filter(Boolean);

      let failedUpdates = 0;

      if (eventsToUpdate.length > 0) {
        const updateResults = await Promise.all(eventsToUpdate.map(async (eventId) => {
          try {
            const existing = await apiService.getEvent(eventId, { trackView: false });
            if (!existing) {
              return false;
            }

            await apiService.updateEvent(eventId, {
              name: existing.name,
              location: existing.location,
              category: existing.category,
              startDate: existing.startDate,
              endDate: existing.endDate,
              ticketPrice: existing.ticketPrice,
              capacity: existing.capacity,
              organizer: existing.organizer ?? trimmedProfile.organizationName,
              organizerDisplayName: trimmedProfile.organizationName,
              organizerEmail: trimmedProfile.email,
              organizerPhone: trimmedProfile.contactNumber,
              description: existing.description ?? '',
            });

            return true;
          } catch (updateError) {
            console.error(`Failed to propagate organizer profile to event ${eventId}`, updateError);
            return false;
          }
        }));

        failedUpdates = updateResults.filter((result) => !result).length;
      }

      if (failedUpdates > 0) {
        toast.warning('Profile saved, but some events could not be updated. Please retry later.');
      } else {
        toast.success('Profile and event details updated.');
      }

      await fetchDashboard();
    } catch (err) {
      console.error('Failed to store profile settings', err);
      toast.error('Unable to update profile right now.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDefaultsSubmit = async (event) => {
    event.preventDefault();
    try {
      setDefaultsSaving(true);
      localStorage.setItem('qrush_organizer_defaults', JSON.stringify(defaultsForm));
      toast.success('Default event settings saved.');
    } catch (err) {
      console.error('Failed to store default settings', err);
      toast.error('Unable to save defaults right now.');
    } finally {
      setDefaultsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organizer overview...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard unavailable</h2>
          <p className="text-gray-600 mb-4">{error || 'We could not retrieve your event metrics right now.'}</p>
          <Button onClick={reloadPage} className="gradient-orange text-white">
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const events = dashboard.events ?? [];
  const stats = {
    totalEvents: dashboard.totalEvents ?? 0,
    totalTicketsSold: dashboard.totalTicketsSold ?? 0,
    totalRevenue: dashboard.totalRevenue ?? 0,
    averageAttendance: dashboard.averageAttendance ?? 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Organizer Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Welcome back, {profileForm.organizationName || user.name}. Manage your events and track performance.
            </p>
          </div>
          <Link to="/create-event">
            <Button className="gradient-orange text-white mt-4 sm:mt-0">
              <Plus className="w-5 h-5 mr-2" />
              Create New Event
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Events</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Tickets Sold</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalTicketsSold}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Avg. Attendance</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.averageAttendance}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="events">My Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">My Events</h2>
              <Link to="/create-event">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Event
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.eventId} className="event-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {event.title}
                          </h3>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-4 gap-6">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Date</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatDate(event.eventStart)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {event.ticketsSold} / {event.capacity}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getAttendancePercentage(event.ticketsSold, event.capacity)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-600">Revenue</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(event.revenue)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-600">Views</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {(event.views ?? 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-6">
                        <Button variant="outline" size="sm" onClick={() => handleViewEvent(event.eventId)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditEvent(event.eventId)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEventSettings(event)}>
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {events.length === 0 && (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No events yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first event and start selling tickets
                </p>
                <Link to="/create-event">
                  <Button className="gradient-orange text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Event
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Analytics Overview</h2>
            
            {/* Revenue Chart Placeholder */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Revenue analytics chart would appear here</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Integration with charting library needed for full functionality
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Performance */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Event Performance</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-4">
                  {publishedEvents.map((event) => (
                    <div key={event.eventId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600">
                          {getAttendancePercentage(event.ticketsSold, event.capacity)}% sold
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(event.revenue)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {event.ticketsSold} tickets
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Export Reports</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => handleDownloadReport('sales')}>
                    <Download className="w-4 h-4 mr-2" />
                    Sales Report
                  </Button>
                  <Button variant="outline" onClick={() => handleDownloadReport('attendee-list')}>
                    <Download className="w-4 h-4 mr-2" />
                    Attendee List
                  </Button>
                  <Button variant="outline" onClick={() => handleDownloadReport('analytics-summary')}>
                    <Download className="w-4 h-4 mr-2" />
                    Analytics Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Account Settings</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <form className="space-y-4" onSubmit={handleProfileSubmit}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={organizationNameId}>
                        Organization Name
                      </label>
                      <input
                        id={organizationNameId}
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        value={profileForm.organizationName}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, organizationName: event.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={profileEmailId}>
                        Email
                      </label>
                      <input
                        id={profileEmailId}
                        type="email"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        value={profileForm.email}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={contactNumberId}>
                        Contact Number
                      </label>
                      <input
                        id={contactNumberId}
                        type="tel"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        value={profileForm.contactNumber}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, contactNumber: event.target.value }))}
                      />
                    </div>
                    <Button className="gradient-orange text-white" type="submit" disabled={profileSaving}>
                      {profileSaving ? 'Saving...' : 'Update Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Event Defaults</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <form className="space-y-4" onSubmit={handleDefaultsSubmit}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={defaultLocationId}>
                        Default Event Location
                      </label>
                      <input
                        id={defaultLocationId}
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        value={defaultsForm.location}
                        onChange={(event) => setDefaultsForm((prev) => ({ ...prev, location: event.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={defaultPriceId}>
                        Default Ticket Price
                      </label>
                      <input
                        id={defaultPriceId}
                        type="number"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        value={defaultsForm.price}
                        onChange={(event) => setDefaultsForm((prev) => ({ ...prev, price: event.target.value }))}
                      />
                    </div>
                    <Button className="gradient-orange text-white" type="submit" disabled={defaultsSaving}>
                      {defaultsSaving ? 'Saving...' : 'Save Defaults'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OrganizerDashboard;