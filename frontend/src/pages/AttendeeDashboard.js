/* global globalThis */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  QrCode,
  Clock,
  Star,
  ChevronRight,
  Download,
  Share,
  History
} from 'lucide-react';
import { apiService } from '../services/api';
import { toast } from 'sonner';

const AttendeeDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleRefresh = () => {
    if (typeof globalThis !== 'undefined' && globalThis.location &&
        typeof globalThis.location.reload === 'function') {
      globalThis.location.reload();
      return;
    }
    toast.error('Refresh is not supported in this environment.');
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.id) {
        return;
      }
      try {
        setLoading(true);
        const data = await apiService.getAttendeeDashboard(user.id);
        setDashboard(data);
      } catch (err) {
        console.error('Failed to load attendee dashboard', err);
        setError(err.message);
        toast.error('Unable to load attendee dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user?.id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const isEventSoon = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const timeDiff = eventDate - now;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff <= 7 && daysDiff > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard unavailable</h2>
          <p className="text-gray-600 mb-4">{error || 'We could not load your ticket information right now.'}</p>
          <Button onClick={handleRefresh} className="gradient-orange text-white">
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const totalSpent = dashboard.totalSpent ?? 0;
  const upcomingTickets = dashboard.upcomingTickets ?? [];
  const pastEvents = dashboard.pastEvents ?? [];

  const qrFromTicket = (ticket) => {
    const data = ticket.qrCode || ticket.ticketNumber || `ticket-${ticket.ticketId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xl text-gray-600">
            Manage your tickets and explore upcoming events
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Tickets</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboard.activeTickets}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Events Attended</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboard.eventsAttended}</p>
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₱{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="events">Browse Events</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* My Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">My Tickets</h2>
              <Link to="/events">
                <Button className="gradient-orange text-white">
                  <Ticket className="w-4 h-4 mr-2" />
                  Browse More Events
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {upcomingTickets.map((ticket) => (
                <Card key={ticket.ticketId} className="event-card">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Event Info */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {ticket.eventTitle}
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                              <span>{formatDate(ticket.eventStart)} </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                              <span>{ticket.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        {isEventSoon(ticket.eventStart) && (
                          <Badge className="bg-red-100 text-red-700">
                            <Clock className="w-3 h-3 mr-1" />
                            Soon
                          </Badge>
                        )}
                      </div>

                      {/* QR Code */}
                      <div className="qr-container bg-gray-50 rounded-xl p-4 text-center">
                        <img 
                          src={qrFromTicket(ticket)}
                          alt="QR Code"
                          className="w-24 h-24 mx-auto mb-3 rounded-lg"
                        />
                        <p className="text-sm font-mono text-gray-600">
                          {ticket.ticketNumber}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-4 border-t border-gray-100">
                        <Link to={`/ticket/${ticket.ticketId}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <QrCode className="w-4 h-4 mr-2" />
                            View Full Ticket
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {upcomingTickets.length === 0 && (
              <div className="text-center py-16">
                <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No tickets yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start by browsing and purchasing tickets for amazing events
                </p>
                <Link to="/events">
                  <Button className="gradient-orange text-white">
                    Browse Events
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Browse Events Tab */}
          <TabsContent value="events">
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Discover Amazing Events
              </h3>
              <p className="text-gray-600 mb-4">
                Browse all available events and find your next adventure
              </p>
              <Link to="/events">
                <Button className="gradient-orange text-white">
                  View All Events
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Event History</h2>
            
            <div className="space-y-4">
              {pastEvents.map((event) => (
                <Card key={event.eventId} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <History className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {event.eventTitle}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{formatDate(event.eventDate)}</span>
                            <span>•</span>
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {event.attended ? (
                          <Badge className="bg-green-100 text-green-700">
                            Attended
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700">
                            Missed
                          </Badge>
                        )}
                        
                        {event.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{event.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {pastEvents.length === 0 && (
              <div className="text-center py-16">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No event history
                </h3>
                <p className="text-gray-600">
                  Your attended events will appear here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AttendeeDashboard;