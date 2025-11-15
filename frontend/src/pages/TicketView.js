import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  QrCode,
  Calendar,
  MapPin,
  Clock,
  User,
  Download,
  Share,
  ArrowLeft,
  Ticket,
  CheckCircle,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

const TicketView = () => {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock ticket data - in real app, this would fetch from API
    const mockTicket = {
      id: ticketId,
      ticketNumber: "TC2024-001234",
      eventTitle: "Tech Conference 2024",
      eventDescription: "Annual technology conference featuring the latest innovations in AI, blockchain, and web development.",
      date: "2024-03-15",
      time: "09:00 AM",
      endTime: "06:00 PM",
      location: "San Francisco Convention Center",
      address: "747 Howard Street, San Francisco, CA 94103",
      organizer: "TechEvents Inc.",
      attendeeName: user.name,
      attendeeEmail: user.email,
      price: 299,
      seat: "A-15",
      gate: "Main Entrance",
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${ticketId}`,
      purchaseDate: "2024-02-20",
      status: "confirmed",
      category: "Technology Conference",
      instructions: [
        "Arrive 30 minutes before the event start time",
        "Bring a valid photo ID for verification",
        "Keep your QR code ready for scanning at the entrance",
        "Check-in opens at 8:30 AM"
      ]
    };

    setTimeout(() => {
      setTicket(mockTicket);
      setIsLoading(false);
    }, 500);
  }, [ticketId, user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    toast.success('Ticket downloaded successfully!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: ticket.eventTitle,
        text: `Check out my ticket for ${ticket.eventTitle}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Ticket link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ticket Not Found</h2>
          <p className="text-gray-600 mb-4">The ticket you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors"
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
        <Card className="overflow-hidden shadow-xl border-0 mb-8">
          {/* Header Section */}
          <div className="gradient-orange p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge className="bg-white/20 text-white border-white/30 mb-3">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {ticket.status.toUpperCase()}
                </Badge>
                <h1 className="text-2xl font-bold mb-2">{ticket.eventTitle}</h1>
                <p className="text-orange-100 opacity-90">{ticket.category}</p>
              </div>
              <div className="text-right">
                <p className="text-orange-100 text-sm">Ticket #</p>
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
              <p className="text-sm text-gray-600 mt-4 flex items-center justify-center">
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
                    <p className="font-semibold text-gray-900">Date & Time</p>
                    <p className="text-gray-600">{formatDate(ticket.date)}</p>
                    <p className="text-gray-600">{ticket.time} - {ticket.endTime}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Venue</p>
                    <p className="text-gray-600">{ticket.location}</p>
                    <p className="text-sm text-gray-500">{ticket.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Attendee</p>
                    <p className="text-gray-600">{ticket.attendeeName}</p>
                    <p className="text-sm text-gray-500">{ticket.attendeeEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Ticket className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Seat & Gate</p>
                    <p className="text-gray-600">Seat: {ticket.seat}</p>
                    <p className="text-gray-600">Gate: {ticket.gate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Purchase Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(ticket.purchaseDate).toLocaleDateString('en-US')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount Paid</p>
                  <p className="font-semibold text-gray-900">₱{ticket.price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Organized by</p>
                  <p className="font-semibold text-gray-900">{ticket.organizer}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Instructions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 text-orange-500 mr-2" />
              Important Instructions
            </h3>
            <ul className="space-y-2">
              {ticket.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-600">{instruction}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Event Description */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Event</h3>
            <p className="text-gray-600 leading-relaxed">{ticket.eventDescription}</p>
          </CardContent>
        </Card>

        {/* Bottom Actions */}
        <div className="flex space-x-4 mt-8">
          <Button 
            onClick={handleDownload}
            className="gradient-orange text-white flex-1"
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