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
  Users,
  Ticket,
  Share,
  ArrowLeft,
  Star,
  DollarSign,
  CheckCircle,
  User,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

const EventDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ticketQuantity, setTicketQuantity] = useState(1);

  useEffect(() => {
    // Mock event data - in real app, this would fetch from API
    const mockEvent = {
      id: parseInt(id),
      title: "Tech Conference 2024",
      description: "Join us for the most anticipated technology conference of the year! This comprehensive event brings together industry leaders, innovative startups, and tech enthusiasts to explore the latest trends in artificial intelligence, blockchain technology, and web development.",
      fullDescription: "The Tech Conference 2024 is a two-day immersive experience featuring keynote speeches from renowned tech leaders, hands-on workshops, networking opportunities, and product demonstrations. Whether you're a developer, entrepreneur, or tech enthusiast, this conference offers valuable insights into the future of technology.\n\nHighlights include:\n• Keynote speeches from industry pioneers\n• Interactive workshops and coding sessions\n• Startup pitch competitions\n• Networking lunch and evening reception\n• Exhibition showcase with latest tech products\n• Career fair and recruitment opportunities",
      date: "2024-03-15",
      time: "09:00 AM",
      endTime: "06:00 PM",
      location: "San Francisco Convention Center",
      address: "747 Howard Street, San Francisco, CA 94103",
      category: "technology",
      price: 299,
      capacity: 500,
      registered: 387,
      rating: 4.8,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1699862731387-d40f6908ca4e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxldmVudCUyMHRpY2tldGluZ3xlbnwwfHx8fDE3NTg0NjM0MDd8MA&ixlib=rb-4.1.0&q=85",
      organizer: {
        name: "TechEvents Inc.",
        email: "contact@techevents.com",
        phone: "+1 (555) 123-4567",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=organizer"
      },
      features: [
        "Live streaming available",
        "Recording provided",
        "Networking opportunities",
        "Refreshments included",
        "Certificate of attendance",
        "Swag bag included"
      ],
      agenda: [
        { time: "09:00 AM", title: "Registration & Welcome Coffee", speaker: "" },
        { time: "10:00 AM", title: "Opening Keynote: Future of AI", speaker: "Dr. Sarah Chen" },
        { time: "11:00 AM", title: "Panel: Blockchain Revolution", speaker: "Industry Leaders" },
        { time: "12:00 PM", title: "Networking Lunch", speaker: "" },
        { time: "01:30 PM", title: "Workshop: Building React Apps", speaker: "Dev Team" },
        { time: "03:00 PM", title: "Startup Pitch Competition", speaker: "Various Founders" },
        { time: "04:30 PM", title: "Closing Remarks & Networking", speaker: "" }
      ]
    };

    setTimeout(() => {
      setEvent(mockEvent);
      setIsLoading(false);
    }, 500);
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const getAvailabilityStatus = (registered, capacity) => {
    const percentage = (registered / capacity) * 100;
    if (percentage >= 95) return { text: 'Almost Full', color: 'bg-red-100 text-red-700' };
    if (percentage >= 75) return { text: 'Filling Fast', color: 'bg-yellow-100 text-yellow-700' };
    return { text: 'Available', color: 'bg-green-100 text-green-700' };
  };

  const handlePurchase = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to purchase tickets');
      navigate('/auth');
      return;
    }

    // Simulate ticket purchase
    toast.success(`Successfully purchased ${ticketQuantity} ticket(s) for ${event.title}!`);
    
    // In real app, this would process payment and generate tickets
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this amazing event: ${event.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/events')}>
            Browse Events
          </Button>
        </div>
      </div>
    );
  }

  const availability = getAvailabilityStatus(event.registered, event.capacity);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center space-x-2 text-white hover:text-orange-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Share Button */}
        <Button
          onClick={handleShare}
          variant="secondary"
          size="sm"
          className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm text-white border-white/30"
        >
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>

        {/* Event Info Overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Badge className={`${availability.color} mb-3`}>
                {availability.text}
              </Badge>
              <h1 className="text-4xl font-bold text-white mb-2">
                {event.title}
              </h1>
              <div className="flex items-center space-x-4 text-white/90">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{event.rating}</span>
                  <span className="text-sm">({event.reviews} reviews)</span>
                </div>
                <span>•</span>
                <span>{event.registered} registered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Details */}
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-semibold text-gray-900">Date & Time</p>
                        <p className="text-gray-600">{formatDate(event.date)}</p>
                        <p className="text-gray-600">{event.time} - {event.endTime}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-semibold text-gray-900">Location</p>
                        <p className="text-gray-600">{event.location}</p>
                        <p className="text-sm text-gray-500">{event.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-semibold text-gray-900">Attendance</p>
                        <p className="text-gray-600">{event.registered} / {event.capacity} people</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-semibold text-gray-900">Organizer</p>
                        <p className="text-gray-600">{event.organizer.name}</p>
                        <p className="text-sm text-gray-500">{event.organizer.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">About This Event</h3>
                  <div className="text-gray-600 space-y-4">
                    <p>{event.description}</p>
                    <div className="whitespace-pre-line">{event.fullDescription}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Features */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Included</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {event.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Event Agenda */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Event Agenda</h3>
                <div className="space-y-4">
                  {event.agenda.map((item, index) => (
                    <div key={index} className="flex space-x-4 pb-4 border-b border-gray-100 last:border-0">
                      <div className="w-20 flex-shrink-0">
                        <span className="text-sm font-medium text-orange-600">{item.time}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        {item.speaker && (
                          <p className="text-sm text-gray-600">by {item.speaker}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Ticket Purchase */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Price */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        ₱{event.price}
                      </div>
                      <p className="text-gray-600">per ticket</p>
                    </div>

                    {/* Quantity Selector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Tickets
                      </label>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                          disabled={ticketQuantity <= 1}
                        >
                          -
                        </Button>
                        <span className="text-lg font-semibold w-12 text-center">
                          {ticketQuantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))}
                          disabled={ticketQuantity >= 10}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-gray-900">
                          ₱{event.price * ticketQuantity}
                        </span>
                      </div>
                    </div>

                    {/* Purchase Button */}
                    <Button
                      onClick={handlePurchase}
                      className="w-full gradient-orange text-white text-lg py-3 h-auto"
                      disabled={event.registered >= event.capacity}
                    >
                      <Ticket className="w-5 h-5 mr-2" />
                      {event.registered >= event.capacity ? 'Sold Out' : 'Buy Tickets'}
                    </Button>

                    {/* Info */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600 flex items-center justify-center">
                        <Info className="w-4 h-4 mr-1" />
                        Secure checkout with instant confirmation
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Organizer Info */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Event Organizer</h4>
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={event.organizer.avatar}
                      alt={event.organizer.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{event.organizer.name}</p>
                      <p className="text-sm text-gray-600">Event Organizer</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>{event.organizer.email}</p>
                    <p>{event.organizer.phone}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;