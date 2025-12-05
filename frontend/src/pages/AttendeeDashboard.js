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
  History,
  AlertCircle,
  RefreshCw
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Dashboard unavailable</h2>
          <p className="text-gray-400 mb-4">{error || 'We could not load your ticket information right now.'}</p>
          <Button onClick={handleRefresh} className="gradient-orange text-black">
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

  const handleDownloadTicket = async (ticket) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 600;
      canvas.height = 400;
      
      // Background
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Orange header
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#f97316');
      gradient.addColorStop(1, '#ea580c');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, 80);
      
      // Event title
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 22px Arial';
      ctx.fillText(ticket.eventName || 'Event', 20, 35);
      
      // Ticket number
      ctx.font = '14px Arial';
      ctx.fillText(`Ticket: ${ticket.ticketNumber || `TCK-${String(ticket.ticketId).padStart(6, '0')}`}`, 20, 60);
      
      // Load QR code
      const qrImage = new Image();
      qrImage.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = qrFromTicket(ticket);
      });
      
      // Draw QR code
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 100, 160, 160);
      ctx.drawImage(qrImage, 30, 110, 140, 140);
      
      // Details on the right
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Event Details', 210, 120);
      
      ctx.font = '14px Arial';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(`📅 ${formatDate(ticket.eventDate)}`, 210, 150);
      ctx.fillText(`📍 ${ticket.location || 'TBA'}`, 210, 175);
      ctx.fillText(`🎫 ${ticket.ticketType || 'General'}`, 210, 200);
      
      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(`PHP ${(ticket.price || 0).toLocaleString()}`, 210, 235);
      
      // Footer
      ctx.fillStyle = '#4b5563';
      ctx.font = '11px Arial';
      ctx.fillText('Show this QR code at the entrance • Powered by QRush', 20, canvas.height - 20);
      
      // Download
      const link = document.createElement('a');
      const ticketNum = ticket.ticketNumber || `TCK-${String(ticket.ticketId).padStart(6, '0')}`;
      link.download = `${ticketNum}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Ticket downloaded!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download ticket');
    }
  };

  const handleShareTicket = async (ticket) => {
    const ticketUrl = `${globalThis?.location?.origin || ''}/ticket/${ticket.ticketId}`;
    const nav = globalThis?.navigator;
    
    if (typeof nav?.share === 'function') {
      try {
        await nav.share({
          title: ticket.eventName || 'My Ticket',
          text: `Check out my ticket for ${ticket.eventName || 'this event'}!`,
          url: ticketUrl,
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
    
    if (typeof nav?.clipboard?.writeText === 'function') {
      await nav.clipboard.writeText(ticketUrl);
      toast.success('Ticket link copied to clipboard!');
      return;
    }
    
    toast.error('Sharing is not supported on this device');
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xl text-gray-400">
            Manage your tickets and explore upcoming events
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Active Tickets</p>
                    <p className="text-3xl font-bold text-white">{dashboard.activeTickets}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-orange-500" />
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
                    <p className="text-sm font-medium text-gray-400 mb-1">Events Attended</p>
                    <p className="text-3xl font-bold text-white">{dashboard.eventsAttended}</p>
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
                    <p className="text-sm font-medium text-gray-400 mb-1">Total Spent</p>
                    <p className="text-3xl font-bold text-white">
                      ₱{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
              <h2 className="text-2xl font-semibold text-white">My Tickets</h2>
              <Link to="/events">
                <Button className="gradient-orange text-black">
                  <Ticket className="w-4 h-4 mr-2" />
                  Browse More Events
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {upcomingTickets.map((ticket) => (
                <Card 
                  key={ticket.ticketId} 
                  className={`bg-gray-900 ${
                    ticket.status === 'refunded' || ticket.eventStatus === 'cancelled' 
                      ? 'border-red-500/30' 
                      : 'border-orange-600/20'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Refund/Cancelled Banner */}
                      {(ticket.status === 'refunded' || ticket.eventStatus === 'cancelled') && (
                        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-red-400 mb-1">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-medium">
                              {ticket.status === 'refunded' ? 'Ticket Refunded' : 'Event Cancelled'}
                            </span>
                          </div>
                          {ticket.eventCancellationReason && (
                            <p className="text-sm text-gray-400">
                              Reason: {ticket.eventCancellationReason}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-sm text-green-400">
                            <RefreshCw className="w-3 h-3" />
                            <span>₱{ticket.price?.toLocaleString()} refunded to your payment method</span>
                          </div>
                        </div>
                      )}

                      {/* Event Info */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-xl font-semibold mb-2 ${
                            ticket.status === 'refunded' || ticket.eventStatus === 'cancelled'
                              ? 'text-gray-500 line-through'
                              : 'text-white'
                          }`}>
                            {ticket.eventTitle}
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-400">
                              <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                              <span>{formatDate(ticket.eventStart)} </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-400">
                              <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                              <span>{ticket.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        {ticket.status === 'refunded' || ticket.eventStatus === 'cancelled' ? (
                          <Badge className="bg-red-900/50 text-red-400 border-red-600/30">
                            Cancelled
                          </Badge>
                        ) : isEventSoon(ticket.eventStart) ? (
                          <Badge className="bg-red-900/50 text-red-400 border-red-600/30">
                            <Clock className="w-3 h-3 mr-1" />
                            Soon
                          </Badge>
                        ) : null}
                      </div>

                      {/* QR Code - Only show if not refunded */}
                      {ticket.status !== 'refunded' && ticket.eventStatus !== 'cancelled' && (
                        <div className="qr-container bg-gray-800 rounded-xl p-4 text-center">
                          <img 
                            src={qrFromTicket(ticket)}
                            alt="QR Code"
                            className="w-24 h-24 mx-auto mb-3 rounded-lg"
                          />
                          <p className="text-sm font-mono text-gray-400">
                            {ticket.ticketNumber}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2 pt-4 border-t border-gray-700">
                        <Link to={`/ticket/${ticket.ticketId}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <QrCode className="w-4 h-4 mr-2" />
                            {ticket.status === 'refunded' || ticket.eventStatus === 'cancelled' 
                              ? 'View Details' 
                              : 'View Full Ticket'}
                          </Button>
                        </Link>
                        {ticket.status !== 'refunded' && ticket.eventStatus !== 'cancelled' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleDownloadTicket(ticket)}>
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleShareTicket(ticket)}>
                              <Share className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {upcomingTickets.length === 0 && (
              <div className="text-center py-16">
                <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                  No tickets yet
                </h3>
                <p className="text-gray-400 mb-4">
                  Start by browsing and purchasing tickets for amazing events
                </p>
                <Link to="/events">
                  <Button className="gradient-orange text-black">
                    Browse Events
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Browse Events Tab */}
          <TabsContent value="events">
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">
                Discover Amazing Events
              </h3>
              <p className="text-gray-400 mb-4">
                Browse all available events and find your next adventure
              </p>
              <Link to="/events">
                <Button className="gradient-orange text-black">
                  View All Events
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Event History</h2>
            
            <div className="space-y-4">
              {pastEvents.map((event) => (
                <Card key={event.eventId} className="bg-gray-900 border-orange-600/20 hover:border-orange-500/40 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                          <History className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {event.eventTitle}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>{formatDate(event.eventDate)}</span>
                            <span>•</span>
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {event.attended ? (
                          <Badge className="bg-green-900/50 text-green-400 border-green-600/30">
                            Attended
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-800 text-gray-400 border-gray-600/30">
                            Missed
                          </Badge>
                        )}
                        
                        {event.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                            <span className="text-sm font-medium text-white">{event.rating}</span>
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
                <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                  No event history
                </h3>
                <p className="text-gray-400">
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