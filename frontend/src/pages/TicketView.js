/* global globalThis */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Download,
  Share,
  ArrowLeft,
  Ticket,
  CheckCircle,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../services/api';

const TicketView = () => {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const mapTicketResponse = (data) => {
      if (!data) {
        return null;
      }

      const event = data.event || {};
      const attendee = data.user || {};
      const descriptionSegments = (event.description || '')
        .split('\n\n')
        .map(segment => segment.trim())
        .filter(Boolean);

      const primaryDescription = descriptionSegments[0] || 'No event description available yet.';
      const remainingSegments = descriptionSegments.slice(1);
      const address = remainingSegments.length > 0
        ? remainingSegments[remainingSegments.length - 1]
        : '';
      const supplementalDetails = remainingSegments.length > 1
        ? remainingSegments.slice(0, -1).join('\n\n')
        : '';

      const startDate = event.startDate || null;
      const endDate = event.endDate || null;
      const qrCodeValue = data.qrCode || `ticket-${data.ticketID ?? ticketId}`;

      return {
        id: data.ticketID,
        ticketNumber: data.ticketID ? `TCK-${String(data.ticketID).padStart(6, '0')}` : qrCodeValue,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeValue)}`,
        eventTitle: event.name || 'Event Details',
        eventDescription: primaryDescription,
        supplementalDetails,
        category: event.category || 'Event',
        startDate,
        endDate,
        location: event.location || 'Location to be announced',
        address,
        organizer: event.organizer || 'Organizer details pending',
        attendeeName: attendee.name || user?.name || 'Attendee',
        attendeeEmail: attendee.email || user?.email || 'Email unavailable',
        price: data.price ?? event.ticketPrice ?? 0,
        purchaseDate: data.purchaseDate || null,
        status: (data.status || 'PENDING').toUpperCase(),
        seat: 'General Admission',
        gate: 'Main Entrance',
        instructions: [
          'Arrive 30 minutes before the start time.',
          'Bring a valid photo ID and this QR code for check-in.',
          'Contact the organizer if you have any special requirements.',
        ],
      };
    };

    const fetchTicket = async () => {
      if (!ticketId) {
        setTicket(null);
        setIsLoading(false);
        setError('Ticket reference is missing.');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getTicket(ticketId);
        setTicket(mapTicketResponse(response));
      } catch (err) {
        console.error('Failed to load ticket details', err);
        setTicket(null);
        setError('We could not load your ticket details right now.');
        toast.error('Unable to load ticket details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId, user]);

  const formatDate = (value) => {
    if (!value) {
      return 'Date to be announced';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Date to be announced';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeRange = (start, end) => {
    if (!start) {
      return 'Schedule to be announced';
    }
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;
    if (Number.isNaN(startDate.getTime())) {
      return 'Schedule to be announced';
    }
    const startLabel = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const endLabel = endDate && !Number.isNaN(endDate.getTime())
      ? endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : 'TBD';
    return `${startLabel} - ${endLabel}`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(value ?? 0);
  };

  const handleDownload = async () => {
    try {
      // Create a canvas to draw the ticket
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      canvas.width = 600;
      canvas.height = 800;
      
      // Background
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Orange header
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#f97316');
      gradient.addColorStop(1, '#ea580c');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, 120);
      
      // Event title
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(ticket.eventTitle, 30, 50);
      
      // Ticket number
      ctx.font = '16px Arial';
      ctx.fillText(`Ticket: ${ticket.ticketNumber}`, 30, 85);
      
      // Status badge
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(ticket.status, 30, 110);
      
      // Load and draw QR code
      const qrImage = new Image();
      qrImage.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = ticket.qrCode;
      });
      
      // Draw QR code centered
      const qrSize = 200;
      const qrX = (canvas.width - qrSize) / 2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX - 20, 150, qrSize + 40, qrSize + 40);
      ctx.drawImage(qrImage, qrX, 170, qrSize, qrSize);
      
      // Ticket details
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      let yPos = 420;
      
      ctx.fillText('Event Details', 30, yPos);
      yPos += 35;
      
      ctx.font = '14px Arial';
      ctx.fillStyle = '#9ca3af';
      
      // Date
      ctx.fillText(`📅 ${formatDate(ticket.startDate)}`, 30, yPos);
      yPos += 25;
      
      // Time
      ctx.fillText(`🕐 ${formatTime(ticket.startDate)}`, 30, yPos);
      yPos += 25;
      
      // Location
      ctx.fillText(`📍 ${ticket.location}`, 30, yPos);
      yPos += 35;
      
      // Attendee info
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Attendee', 30, yPos);
      yPos += 30;
      
      ctx.font = '14px Arial';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(`👤 ${ticket.attendeeName}`, 30, yPos);
      yPos += 25;
      ctx.fillText(`✉️ ${ticket.attendeeEmail}`, 30, yPos);
      yPos += 35;
      
      // Price
      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(`${formatCurrency(ticket.price)}`, 30, yPos);
      
      // Footer
      ctx.fillStyle = '#4b5563';
      ctx.font = '12px Arial';
      ctx.fillText('Powered by QRush Ticketing', 30, canvas.height - 30);
      ctx.fillText('Show this QR code at the entrance', 30, canvas.height - 50);
      
      // Download
      const link = document.createElement('a');
      link.download = `${ticket.ticketNumber}_${ticket.eventTitle.replace(/[^a-z0-9]/gi, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Ticket downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download ticket. Please try again.');
    }
  };

  const handleShare = () => {
    const nav = globalThis?.navigator;
    const shareUrl = globalThis?.location?.href ?? '';

    if (shareUrl && typeof nav?.share === 'function') {
      nav.share({
        title: ticket.eventTitle,
        text: `Check out my ticket for ${ticket.eventTitle}`,
        url: shareUrl,
      });
      return;
    }

    if (shareUrl && typeof nav?.clipboard?.writeText === 'function') {
      nav.clipboard.writeText(shareUrl);
      toast.success('Ticket link copied to clipboard!');
      return;
    }

    toast.error('Sharing is not supported on this device.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading your ticket...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Ticket unavailable</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Ticket Not Found</h2>
          <p className="text-gray-400 mb-4">The ticket you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-400 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Ticket Card */}
        <Card className="overflow-hidden shadow-xl border-orange-600/20 bg-gray-900 mb-8">
          {/* Header Section */}
          <div className="gradient-orange p-6 text-black">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge className="bg-black/20 text-black border-black/30 mb-3">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {ticket.status.toUpperCase()}
                </Badge>
                <h1 className="text-2xl font-bold mb-2">{ticket.eventTitle}</h1>
                <p className="text-gray-800 opacity-90">{ticket.category}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-800 text-sm">Ticket #</p>
                <p className="font-mono font-bold">{ticket.ticketNumber}</p>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* QR Code Section */}
            <div className="text-center">
              <div className="qr-container inline-block bg-white p-6 rounded-2xl shadow-lg border-4 border-orange-500">
                <img 
                  src={ticket.qrCode} 
                  alt="Ticket QR Code"
                  className="w-48 h-48 mx-auto rounded-lg"
                />
              </div>
              <p className="text-sm text-gray-400 mt-4 flex items-center justify-center">
                <Smartphone className="w-4 h-4 mr-2" />
                Show this QR code at the entrance
              </p>
            </div>

            {/* Event Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Date & Time</p>
                    <p className="text-gray-400">{formatDate(ticket.startDate)}</p>
                    <p className="text-gray-400">{formatTimeRange(ticket.startDate, ticket.endDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Venue</p>
                    <p className="text-gray-400">{ticket.location}</p>
                    {ticket.address && (
                      <p className="text-sm text-gray-500 whitespace-pre-line">{ticket.address}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Attendee</p>
                    <p className="text-gray-400">{ticket.attendeeName}</p>
                    <p className="text-sm text-gray-500">{ticket.attendeeEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Ticket className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Seat & Gate</p>
                    <p className="text-gray-400">Seat: {ticket.seat}</p>
                    <p className="text-gray-400">Gate: {ticket.gate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Info */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Purchase Date</p>
                  <p className="font-semibold text-white">
                    {ticket.purchaseDate
                      ? new Date(ticket.purchaseDate).toLocaleDateString('en-US')
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Amount Paid</p>
                  <p className="font-semibold text-orange-500">{formatCurrency(ticket.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Organized by</p>
                  <p className="font-semibold text-white">{ticket.organizer}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Instructions */}
        <Card className="mb-6 bg-gray-900 border-orange-600/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 text-orange-500 mr-2" />
              Important Instructions
            </h3>
            <ul className="space-y-2">
              {ticket.instructions.map((instruction) => (
                <li key={instruction} className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-400">{instruction}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Event Description */}
        <Card className="bg-gray-900 border-orange-600/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-3">About This Event</h3>
            <p className="text-gray-400 leading-relaxed">{ticket.eventDescription}</p>
            {ticket.supplementalDetails && (
              <p className="text-gray-400 leading-relaxed mt-4 whitespace-pre-line">
                {ticket.supplementalDetails}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Bottom Actions */}
        <div className="flex space-x-4 mt-8">
          <Button 
            onClick={handleDownload}
            className="gradient-orange text-black flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Ticket
          </Button>
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="flex-1"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketView;