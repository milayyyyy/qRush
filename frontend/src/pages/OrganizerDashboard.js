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
  Download,
  XCircle,
  AlertTriangle
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
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [eventToCancel, setEventToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
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
      case 'published': return 'bg-green-900/30 text-green-400';
      case 'draft': return 'bg-gray-800 text-gray-400';
      case 'cancelled': return 'bg-red-900/30 text-red-400';
      default: return 'bg-gray-800 text-gray-400';
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

  const revenueSeries = useMemo(() => {
    const events = dashboard?.events ?? [];
    if (events.length === 0) {
      return [];
    }

    const totals = new Map();

    for (const event of events) {
      const rawRevenue = Number(event.revenue ?? 0);
      if (Number.isNaN(rawRevenue) || rawRevenue <= 0) {
        continue;
      }

      const start = event.eventStart ? new Date(event.eventStart) : null;
      if (!start || Number.isNaN(start.getTime())) {
        const existing = totals.get('unscheduled') ?? {
          label: 'Unscheduled',
          value: 0,
          order: Number.POSITIVE_INFINITY
        };
        existing.value += rawRevenue;
        totals.set('unscheduled', existing);
        continue;
      }

      const order = start.getFullYear() * 12 + start.getMonth();
      const key = `${start.getFullYear()}-${start.getMonth()}`;
      const label = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const existing = totals.get(key) ?? { label, value: 0, order };
      existing.value += rawRevenue;
      totals.set(key, existing);
    }

    return Array.from(totals.values())
      .sort((a, b) => a.order - b.order)
      .slice(-6);
  }, [dashboard?.events]);

  const maxRevenueValue = useMemo(() => {
    if (revenueSeries.length === 0) {
      return 0;
    }
    return Math.max(...revenueSeries.map((entry) => entry.value));
  }, [revenueSeries]);

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

  const handleCancelEventClick = (event) => {
    setEventToCancel(event);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancelEvent = async () => {
    if (!eventToCancel) return;
    
    try {
      setCancelLoading(true);
      const response = await apiService.cancelEvent(eventToCancel.eventId, cancelReason || 'Unforeseen circumstances');
      
      if (response.success) {
        toast.success(
          `"${eventToCancel.title}" has been cancelled. ${response.ticketsRefunded} tickets refunded (₱${response.totalRefundAmount.toLocaleString()}).`
        );
      } else {
        toast.error(response.message || 'Failed to cancel event.');
      }
      
      setCancelModalOpen(false);
      setEventToCancel(null);
      setCancelReason('');
      // Refresh the dashboard
      await fetchDashboard();
    } catch (err) {
      console.error('Failed to cancel event:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel event. Please try again.');
    } finally {
      setCancelLoading(false);
    }
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading organizer overview...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Dashboard unavailable</h2>
          <p className="text-gray-400 mb-4">{error || 'We could not retrieve your event metrics right now.'}</p>
          <Button onClick={reloadPage} className="gradient-orange text-black">
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
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Organizer Dashboard
            </h1>
            <p className="text-xl text-gray-400">
              Welcome back, {profileForm.organizationName || user.name}. Manage your events and track performance.
            </p>
          </div>
          <Link to="/create-event">
            <Button className="gradient-orange text-black mt-4 sm:mt-0">
              <Plus className="w-5 h-5 mr-2" />
              Create New Event
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Total Events</p>
                    <p className="text-3xl font-bold text-white">{stats.totalEvents}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Tickets Sold</p>
                    <p className="text-3xl font-bold text-white">{stats.totalTicketsSold}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-orange-500">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Avg. Attendance</p>
                    <p className="text-3xl font-bold text-white">{stats.averageAttendance}%</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
              <h2 className="text-2xl font-semibold text-white">My Events</h2>
              <Link to="/create-event">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Event
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.eventId} className="bg-gray-900 border-orange-600/20 hover:border-orange-500/40 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-semibold text-white">
                            {event.title}
                          </h3>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-4 gap-6">
                          <div>
                            <p className="text-sm font-medium text-gray-400">Date</p>
                            <p className="text-lg font-semibold text-white">
                              {formatDate(event.eventStart)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-400">Tickets Sold</p>
                            <p className="text-lg font-semibold text-white">
                              {event.ticketsSold} / {event.capacity}
                            </p>
                            <div className="w-full bg-gray-800 rounded-full h-2 mt-1">
                              <div 
                                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getAttendancePercentage(event.ticketsSold, event.capacity)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-400">Revenue</p>
                            <p className="text-lg font-semibold text-orange-500">
                              {formatCurrency(event.revenue)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-400">Views</p>
                            <p className="text-lg font-semibold text-white">
                              {(event.views ?? 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-6">
                        <Button variant="outline" size="sm" onClick={() => handleViewEvent(event.eventId)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {event.status !== 'cancelled' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleEditEvent(event.eventId)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEventSettings(event)}>
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleCancelEventClick(event)}
                              className="text-red-500 hover:text-red-400 hover:bg-red-900/20 border-red-500/50"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Show cancellation reason if cancelled */}
                    {event.status === 'cancelled' && event.cancellationReason && (
                      <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-400">
                          <span className="font-medium">Cancellation Reason:</span> {event.cancellationReason}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {events.length === 0 && (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                  No events yet
                </h3>
                <p className="text-gray-400 mb-4">
                  Create your first event and start selling tickets
                </p>
                <Link to="/create-event">
                  <Button className="gradient-orange text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Event
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Analytics Overview</h2>
            
            <Card className="p-6 bg-gray-900 border-orange-600/20">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-white">Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                {revenueSeries.length === 0 ? (
                  <div className="h-64 bg-gray-800 rounded-lg flex flex-col items-center justify-center text-center">
                    <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-300 font-medium">No revenue recorded yet</p>
                    <p className="text-sm text-gray-500 mt-2">Ticket sales will appear here once events generate revenue.</p>
                  </div>
                ) : (
                  <div className="h-72 flex flex-col justify-between">
                    <div className="flex items-end gap-4 h-56">
                      {revenueSeries.map((entry) => {
                        const heightPercent = maxRevenueValue === 0
                          ? 0
                          : Math.min(Math.max((entry.value / maxRevenueValue) * 100, 6), 100);
                        return (
                          <div
                            key={`${entry.label}-${entry.order}`}
                            className="flex-1 min-w-[56px] flex flex-col items-center justify-end h-full"
                          >
                            <div className="w-full max-w-[3.5rem] bg-orange-900/40 rounded-t-lg overflow-hidden flex items-end" style={{ height: '100%' }}>
                              <div
                                className="w-full bg-gradient-to-t from-orange-600 via-orange-500 to-orange-400 rounded-t-lg transition-all duration-300"
                                style={{ height: `${heightPercent}%` }}
                              />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-gray-300">{entry.label}</p>
                            <p className="text-xs text-gray-500">{formatCurrency(entry.value)}</p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-6">
                      <span>Last {revenueSeries.length} period{revenueSeries.length > 1 ? 's' : ''}</span>
                      <span>Peak revenue {formatCurrency(maxRevenueValue)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event Performance */}
            <Card className="p-6 bg-gray-900 border-orange-600/20">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-white">Event Performance</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-4">
                  {publishedEvents.map((event) => (
                    <div key={event.eventId} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-white">{event.title}</h4>
                        <p className="text-sm text-gray-400">
                          {getAttendancePercentage(event.ticketsSold, event.capacity)}% sold
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-orange-500">
                          {formatCurrency(event.revenue)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {event.ticketsSold} tickets
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card className="p-6 bg-gray-900 border-orange-600/20">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-white">Export Reports</CardTitle>
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
            <h2 className="text-2xl font-semibold text-white">Account Settings</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gray-900 border-orange-600/20">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-white">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <form className="space-y-4" onSubmit={handleProfileSubmit}>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor={organizationNameId}>
                        Organization Name
                      </label>
                      <input
                        id={organizationNameId}
                        type="text"
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                        value={profileForm.organizationName}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, organizationName: event.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor={profileEmailId}>
                        Email
                      </label>
                      <input
                        id={profileEmailId}
                        type="email"
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                        value={profileForm.email}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor={contactNumberId}>
                        Contact Number
                      </label>
                      <input
                        id={contactNumberId}
                        type="tel"
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
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

              <Card className="p-6 bg-gray-900 border-orange-600/20">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-white">Event Defaults</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <form className="space-y-4" onSubmit={handleDefaultsSubmit}>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor={defaultLocationId}>
                        Default Event Location
                      </label>
                      <input
                        id={defaultLocationId}
                        type="text"
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                        value={defaultsForm.location}
                        onChange={(event) => setDefaultsForm((prev) => ({ ...prev, location: event.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor={defaultPriceId}>
                        Default Ticket Price
                      </label>
                      <input
                        id={defaultPriceId}
                        type="number"
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
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

      {/* Cancel Event Confirmation Modal */}
      {cancelModalOpen && eventToCancel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-white">Cancel Event</h3>
            </div>
            
            <p className="text-gray-300 mb-2">
              Are you sure you want to cancel this event?
            </p>
            <p className="text-white font-medium mb-4 p-3 bg-zinc-800 rounded-lg">
              "{eventToCancel.title}"
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-2">
                Reason for cancellation <span className="text-gray-500">(will be shared with attendees)</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Venue unavailable, Weather conditions, Artist illness..."
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                rows={3}
              />
            </div>
            
            <p className="text-gray-400 text-sm mb-6">
              This action cannot be undone. All attendees will be notified and their tickets will be refunded automatically.
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-zinc-700 hover:bg-zinc-800"
                onClick={() => { setCancelModalOpen(false); setEventToCancel(null); setCancelReason(''); }}
                disabled={cancelLoading}
              >
                Keep Event
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirmCancelEvent}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel Event & Refund'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;