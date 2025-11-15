import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Settings,
  Download
} from 'lucide-react';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Mock data for organizer dashboard
    const mockEvents = [
      {
        id: 1,
        title: "Tech Conference 2024",
        date: "2024-03-15",
        status: "published",
        ticketsSold: 387,
        capacity: 500,
        revenue: 115413,
        views: 2450
      },
      {
        id: 2,
        title: "Summer Music Festival",
        date: "2024-06-20",
        status: "published",
        ticketsSold: 1650,
        capacity: 2000,
        revenue: 247500,
        views: 8920
      },
      {
        id: 3,
        title: "Business Workshop",
        date: "2024-04-10",
        status: "draft",
        ticketsSold: 0,
        capacity: 100,
        revenue: 0,
        views: 0
      }
    ];

    const mockStats = {
      totalEvents: mockEvents.length,
      totalTicketsSold: mockEvents.reduce((sum, event) => sum + event.ticketsSold, 0),
      totalRevenue: mockEvents.reduce((sum, event) => sum + event.revenue, 0),
      averageAttendance: Math.round(mockEvents.reduce((sum, event) => sum + (event.ticketsSold / event.capacity * 100), 0) / mockEvents.length)
    };

    setEvents(mockEvents);
    setStats(mockStats);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
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
    return Math.round((sold / capacity) * 100);
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
              Welcome back, {user.name}. Manage your events and track performance.
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
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-orange-600" />
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
        <Tabs defaultValue="events" className="space-y-6">
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
                <Card key={event.id} className="event-card">
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
                              {formatDate(event.date)}
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
                              {event.views.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-6">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
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
                  {events.filter(e => e.status === 'published').map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Sales Report
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Attendee List
                  </Button>
                  <Button variant="outline">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Name
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder={user.name}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input 
                      type="email" 
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder={user.email}
                    />
                  </div>
                  <Button className="gradient-orange text-white">
                    Update Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Event Defaults</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Event Location
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Enter default location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Ticket Price
                    </label>
                    <input 
                      type="number" 
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="0"
                    />
                  </div>
                  <Button className="gradient-orange text-white">
                    Save Defaults
                  </Button>
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