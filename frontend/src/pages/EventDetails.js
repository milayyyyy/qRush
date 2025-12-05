/* global globalThis */
import React, { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  Share,
  ArrowLeft,
  Star,
  CheckCircle,
  User,
  AlertCircle,
  CreditCard,
  Smartphone,
  Wallet,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../services/api';

const formatDate = (dateString) => {
  if (!dateString) {
    return 'Date to be announced';
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Date to be announced';
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getAvailabilityStatus = (registered, capacity) => {
  if (!capacity) {
    return { text: 'Capacity TBA', color: 'bg-blue-900/50 text-blue-400' };
  }

  const reg = Number(registered) || 0; 
  const cap = Number(capacity);
  const percentage = Math.min((reg / cap) * 100, 100);

  if (percentage >= 100) return { text: 'Sold Out', color: 'bg-gray-800 text-gray-400' };
  if (percentage >= 95) return { text: 'Almost Full', color: 'bg-red-900/50 text-red-400' };
  if (percentage >= 75) return { text: 'Filling Fast', color: 'bg-yellow-900/50 text-yellow-400' };
  return { text: 'Available', color: 'bg-green-900/50 text-green-400' };
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

const formatPrice = (value) => {
  if (!Number.isFinite(value) || value <= 0) {
    return 'Free';
  }
  return formatCurrency(value);
};

const parseEventFeatures = (rawFeatures) => {
  if (!rawFeatures) {
    return [];
  }
  if (Array.isArray(rawFeatures)) {
    return rawFeatures
      .map((item) => (typeof item === 'string' ? item : String(item ?? '')))
      .filter((item) => item.trim().length > 0);
  }
  if (typeof rawFeatures === 'string') {
    const trimmed = rawFeatures.trim();
    if (!trimmed) {
      return [];
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === 'string' ? item : String(item ?? '')))
          .filter((item) => item.trim().length > 0);
      }
      if (parsed && Array.isArray(parsed.features)) {
        return parsed.features
          .map((item) => (typeof item === 'string' ? item : String(item ?? '')))
          .filter((item) => item.trim().length > 0);
      }
    } catch (err) {
      console.warn('Unable to parse feature data', err);
    }
  }
  return [];
};

const parseEventAgenda = (rawAgenda) => {
  if (!rawAgenda) {
    return [];
  }
  const normalizeItem = (item) => ({
    time: typeof item?.time === 'string' ? item.time : '',
    title: typeof item?.title === 'string' ? item.title : '',
    speaker: typeof item?.speaker === 'string' ? item.speaker : '',
  });

  if (Array.isArray(rawAgenda)) {
    return rawAgenda
      .map(normalizeItem)
      .filter((item) => item.time || item.title || item.speaker);
  }

  if (typeof rawAgenda === 'string') {
    const trimmed = rawAgenda.trim();
    if (!trimmed) {
      return [];
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map(normalizeItem)
          .filter((item) => item.time || item.title || item.speaker);
      }
      if (parsed && Array.isArray(parsed.agenda)) {
        return parsed.agenda
          .map(normalizeItem)
          .filter((item) => item.time || item.title || item.speaker);
      }
    } catch (err) {
      console.warn('Unable to parse agenda data', err);
    }
  }

  return [];
};

const parseEventTicketTypes = (rawTicketTypes) => {
  if (!rawTicketTypes) {
    return [];
  }

  const normalizeItem = (item) => ({
    name: typeof item?.name === 'string' ? item.name : 'Regular',
    price: typeof item?.price === 'number' ? item.price : 0,
    description: typeof item?.description === 'string' ? item.description : '',
    features: Array.isArray(item?.features) ? item.features.filter(f => typeof f === 'string' && f.trim()) : [],
  });

  if (Array.isArray(rawTicketTypes)) {
    return rawTicketTypes
      .map(normalizeItem)
      .filter((item) => item.name);
  }

  if (typeof rawTicketTypes === 'string') {
    const trimmed = rawTicketTypes.trim();
    if (!trimmed) {
      return [];
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map(normalizeItem)
          .filter((item) => item.name);
      }
    } catch (err) {
      console.warn('Unable to parse ticket types data', err);
    }
  }

  return [];
};

const mapEventResponse = (data, storedProfile, user) => {
  if (!data) {
    return null;
  }

  const descriptionSegments = (data.description || '')
    .split('\n\n')
    .map(segment => segment.trim())
    .filter(Boolean);

  const summary = descriptionSegments[0] || 'Event details will be available soon.';
  const remainingSegments = descriptionSegments.slice(1);
  const inferredAddress = remainingSegments.length > 0
    ? remainingSegments[remainingSegments.length - 1]
    : '';
  const detailedDescription = remainingSegments.length > 1
    ? remainingSegments.slice(0, -1).join('\n\n')
    : '';
  const parsedFeatures = parseEventFeatures(data.features);
  const parsedAgenda = parseEventAgenda(data.agenda);
  const parsedTicketTypes = parseEventTicketTypes(data.ticketTypes);

  const mappedEvent = {
    eventID: data.eventID,
    title: data.name || 'Untitled Event',
    description: summary,
    fullDescription: detailedDescription,
    address: inferredAddress,
    category: data.category || 'event',
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    location: data.location || 'Venue to be announced',
    ticketPrice: Number(data.ticketPrice ?? 0),
    capacity: Number(data.capacity ?? 0),
    registered: Number(data.registered ?? data.ticketsSold ?? 0),
    organizerName: data.organizerDisplayName || data.organizer || 'Organizer details pending',
    organizerEmail: data.organizerEmail || '',
    organizerPhone: data.organizerPhone || '',
    image: data.image || null,
    rating: data.rating ?? null,
    reviews: data.reviews ?? null,
    features: parsedFeatures,
    agenda: parsedAgenda,
    ticketTypes: parsedTicketTypes.length > 0 ? parsedTicketTypes : [{ name: 'Regular', price: Number(data.ticketPrice ?? 0), description: '' }],
    status: data.status || 'active',
    cancellationReason: data.cancellationReason || null,
    cancelledAt: data.cancelledAt || null,
  };

  if (storedProfile) {
    const normalizedStoredName = (storedProfile.organizationName || '').trim().toLowerCase();
    const normalizedEventName = (mappedEvent.organizerName || '').trim().toLowerCase();
    const normalizedUserName = (user?.name || '').trim().toLowerCase();
    const matchesStoredName = normalizedStoredName && normalizedStoredName === normalizedEventName;
    const matchesUserName = normalizedStoredName && normalizedStoredName === normalizedUserName;
    const matchesUserId = storedProfile?.userId && user?.id && storedProfile.userId === user.id;

    if (matchesStoredName || matchesUserName || matchesUserId) {
      mappedEvent.organizerName = storedProfile.organizationName || mappedEvent.organizerName;
      mappedEvent.organizerEmail = storedProfile.email || mappedEvent.organizerEmail;
      mappedEvent.organizerPhone = storedProfile.contactNumber || mappedEvent.organizerPhone;
    }
  }

  return mappedEvent;
};

const shareEventLink = (eventTitle, toastInstance) => {
  const url = typeof globalThis !== 'undefined' && globalThis.location ? globalThis.location.href : '';
  if (!url) {
    toastInstance.error('Unable to determine the current link.');
    return;
  }

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    navigator.share({
      title: eventTitle,
      text: `Check out this amazing event: ${eventTitle}`,
      url,
    });
    return;
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url);
    toastInstance.success('Event link copied to clipboard!');
    return;
  }

  toastInstance.error('Sharing is not supported in this browser.');
};

const PAYMENT_METHODS = [
  { id: 'GCASH', name: 'GCash', icon: Smartphone, description: 'Pay with GCash e-wallet' },
  { id: 'MAYA', name: 'Maya', icon: Wallet, description: 'Pay with Maya e-wallet' },
  { id: 'CREDIT_CARD', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, etc.' },
  { id: 'BANK_TRANSFER', name: 'Bank Transfer', icon: Building2, description: 'Direct bank transfer' },
];

const processTicketPurchase = ({
  isAuthenticated,
  user,
  event,
  ticketQuantity,
  ticketType,
  paymentMethod,
  toastInstance,
  navigate,
}) => {
  if (!isAuthenticated) {
    toastInstance.error('Please sign in to purchase tickets');
    navigate('/auth');
    return;
  }

  if (!user?.id) {
    toastInstance.error('Your profile is missing an identifier. Please sign out and sign back in.');
    return;
  }

  if (!event?.eventID) {
    toastInstance.error('We could not determine which event to book.');
    return;
  }

  if (!ticketType) {
    toastInstance.error('Please select a ticket type.');
    return;
  }

  if (!paymentMethod) {
    toastInstance.error('Please select a payment method.');
    return;
  }

  toastInstance.promise(
    apiService.bookTickets({
      userId: user.id,
      eventId: event.eventID,
      quantity: ticketQuantity,
      ticketType: ticketType.name,
      ticketPrice: ticketType.price,
      paymentMethod: paymentMethod,
    }),
    {
      loading: 'Processing your payment...',
      success: () => {
        navigate('/dashboard');
        return `Successfully booked ${ticketQuantity} ${ticketType.name} ticket${ticketQuantity > 1 ? 's' : ''}!`;
      },
      error: 'Unable to complete the booking. Please try again.',
    }
  );
};

const renderFallbackState = ({ isLoading, error, event, navigate }) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Event unavailable</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => navigate('/events')}>
            Browse Events
          </Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Event Not Found</h2>
          <p className="text-gray-400 mb-4">The event you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/events')}>
            Browse Events
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

const EventDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedTicketType, setSelectedTicketType] = useState(null);

  const getStoredOrganizerProfile = useCallback(() => {
    try {
      const raw = localStorage.getItem('qrush_organizer_profile');
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (parsed?.userId && user?.id && parsed.userId !== user.id) {
        return null;
      }
      return parsed;
    } catch (storageError) {
      console.warn('Unable to parse stored organizer profile', storageError);
      return null;
    }
  }, [user?.id]);

  // Effect for loading event data only - view tracking is done in EventCard on click
  useEffect(() => {
    const loadEvent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiService.getEvent(id);
        
        const storedProfile = getStoredOrganizerProfile();
        const mapped = mapEventResponse(response, storedProfile, user);
        if (!mapped) {
          setError('We could not find details for this event.');
        }
        setEvent(mapped);
      } catch (err) {
        console.error('Failed to load event details', err);
        setError('Unable to load event details right now.');
        toast.error('Unable to load event details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [getStoredOrganizerProfile, id, user]);

  // Opens the payment dialog when user clicks "Buy Tickets"
  const handleBuyTicketsClick = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to purchase tickets');
      navigate('/auth');
      return;
    }
    setSelectedPaymentMethod(null);
    setSelectedTicketType(event?.ticketTypes?.[0] || null);
    setShowPaymentDialog(true);
  };

  // Confirms the purchase after selecting a payment method
  const handleConfirmPurchase = () => {
    if (!selectedTicketType) {
      toast.error('Please select a ticket type');
      return;
    }
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    setShowPaymentDialog(false);
    processTicketPurchase({
      isAuthenticated,
      user,
      event,
      ticketQuantity,
      ticketType: selectedTicketType,
      paymentMethod: selectedPaymentMethod,
      toastInstance: toast,
      navigate,
    });
  };

  const handleShare = () => shareEventLink(event.title, toast);

  const fallbackState = renderFallbackState({ isLoading, error, event, navigate });
  if (fallbackState) {
    return fallbackState;
  }

  const availability = getAvailabilityStatus(event.registered, event.capacity);
  const heroImage = event.image || '';
  const timeRangeLabel = formatTimeRange(event.startDate, event.endDate);
  const attendeeSummary = event.registered && event.capacity
    ? `${event.registered} registered`
    : 'Registrations opening soon';
  const ratingSummary = event.rating
    ? (
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>{event.rating}</span>
          {event.reviews ? (
            <span className="text-sm">({event.reviews} reviews)</span>
          ) : null}
        </div>
      )
    : null;

  const featureList = event.features.length > 0
    ? event.features
    : [
        'Instant QR ticket confirmation',
        'Organizer support contact available',
        'Entry management powered by QRush',
        'Secure checkout with payment receipts',
      ];

  const [rangeStart, rangeEnd] = timeRangeLabel.includes(' - ')
    ? timeRangeLabel.split(' - ')
    : [timeRangeLabel, ''];

  const agendaItems = event.agenda.length > 0
    ? event.agenda
    : [
        { time: rangeStart || 'TBD', title: 'Doors open & registration', speaker: '' },
        { time: rangeEnd || 'TBD', title: 'Event wrap-up', speaker: '' },
      ];

  const isSoldOut = Boolean(event.capacity) && event.registered >= event.capacity;
  const organizerEmailLabel = event.organizerEmail || 'Email unavailable';
  const organizerPhoneLabel = event.organizerPhone || 'Contact number unavailable';
  
  // Check if user can book tickets (only attendees can book, not staff or organizers)
  const userRole = user?.role?.toLowerCase();
  const canBookTickets = !userRole || userRole === 'attendee';

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-600 via-orange-700 to-gray-900 flex items-center justify-center px-6 text-center">
            <span className="text-white text-3xl font-semibold leading-tight">
              {event.title}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center space-x-2 text-white hover:text-orange-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Share Button */}
        <Button
          onClick={handleShare}
          variant="secondary"
          size="sm"
          className="absolute top-6 right-6 bg-gray-900/50 backdrop-blur-sm text-white border-orange-600/30"
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
                {ratingSummary}
                {ratingSummary && <span>•</span>}
                <span>{attendeeSummary}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cancelled Event Banner */}
        {event.status === 'cancelled' && (
          <div className="mb-8 bg-red-900/30 border border-red-500/50 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-400 mb-2">Event Cancelled</h3>
                <p className="text-gray-300 mb-2">
                  This event has been cancelled by the organizer.
                </p>
                {event.cancellationReason && (
                  <p className="text-gray-400">
                    <span className="font-medium">Reason:</span> {event.cancellationReason}
                  </p>
                )}
                <p className="text-gray-400 mt-2 text-sm">
                  If you had purchased tickets, a refund has been automatically issued to your original payment method.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Details */}
            <Card className="bg-gray-900 border-orange-600/20">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-semibold text-white">Date & Time</p>
                        <p className="text-gray-400">{formatDate(event.startDate)}</p>
                        <p className="text-gray-400">{timeRangeLabel}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-semibold text-white">Location</p>
                        <p className="text-gray-400">{event.location}</p>
                        {event.address && (
                          <p className="text-sm text-gray-500 whitespace-pre-line">{event.address}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-semibold text-white">Registered</p>
                        <p className="text-gray-400">{event.capacity ? `${event.registered} / ${event.capacity} people` : attendeeSummary}</p>
                        <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${Math.min(event.capacity ? (event.registered / event.capacity) * 100 : 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-semibold text-white">Organizer</p>
                        <p className="text-gray-400">{event.organizerName}</p>
                        <p className="text-sm text-gray-500">{organizerEmailLabel}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">About This Event</h3>
                  <div className="text-gray-400 space-y-4">
                    <p>{event.description}</p>
                    {event.fullDescription && (
                      <div className="whitespace-pre-line">{event.fullDescription}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Agenda */}
            <Card className="bg-gray-900 border-orange-600/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Event Agenda</h3>
                <div className="space-y-4">
                  {agendaItems.map((item) => {
                    const agendaKey = [item.time, item.title, item.speaker]
                      .filter(Boolean)
                      .join('::') || item.title || item.time;
                    return (
                      <div key={agendaKey} className="flex space-x-4 pb-4 border-b border-gray-700 last:border-0">
                        <div className="w-20 flex-shrink-0">
                          <span className="text-sm font-medium text-orange-500">{item.time || 'TBD'}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{item.title}</h4>
                          {item.speaker && (
                            <p className="text-sm text-gray-400">by {item.speaker}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Ticket Purchase (only for attendees) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="shadow-xl bg-gray-900 border-orange-600/20">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Ticket Types */}
                    <div className="text-center">
                      {event.ticketTypes && event.ticketTypes.length > 1 ? (
                        <>
                          <div className="text-lg font-medium text-gray-400 mb-2">Starting from</div>
                          <div className="text-3xl font-bold text-white mb-1">
                            {formatPrice(Math.min(...event.ticketTypes.map(t => t.price)))}
                          </div>
                          <p className="text-sm text-gray-500">{event.ticketTypes.length} ticket types available</p>
                        </>
                      ) : (
                        <>
                          <div className="text-3xl font-bold text-white mb-1">
                            {formatPrice(event.ticketTypes?.[0]?.price || event.ticketPrice)}
                          </div>
                          <p className="text-gray-400">per ticket</p>
                        </>
                      )}
                    </div>

                    {/* Ticket Types Preview */}
                    {event.ticketTypes && event.ticketTypes.length > 1 && (
                      <div className="space-y-2">
                        {event.ticketTypes.map((ticketType) => (
                          <div key={ticketType.name} className="flex justify-between items-center text-sm p-2 bg-gray-800/50 rounded">
                            <span className="text-gray-300">{ticketType.name}</span>
                            <span className="text-orange-500 font-medium">{formatCurrency(ticketType.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {canBookTickets ? (
                      <>
                        {/* Purchase Button */}
                        {event.status === 'cancelled' ? (
                          <div className="text-center py-4">
                            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4">
                              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                              <p className="text-red-400 font-medium">Event Cancelled</p>
                              <p className="text-sm text-gray-400 mt-1">
                                Tickets are no longer available for this event.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <Button
                            onClick={handleBuyTicketsClick}
                            className="w-full gradient-orange text-black text-lg py-3 h-auto"
                            disabled={isSoldOut}
                          >
                            <Ticket className="w-5 h-5 mr-2" />
                            {isSoldOut ? 'Sold Out' : 'Buy Tickets'}
                          </Button>
                        )}
                      </>
                    ) : (
                      /* Staff/Organizer View - No booking allowed */
                      <div className="text-center py-4">
                        <div className="bg-gray-800 rounded-lg p-4 mb-4">
                          <p className="text-gray-300 font-medium">
                            {userRole === 'organizer' ? 'Organizer View' : 'Staff View'}
                          </p>
                          <p className="text-sm text-gray-400 mt-2">
                            You are viewing this event as {userRole === 'organizer' ? 'an organizer' : 'staff'}. 
                            Ticket booking is only available for attendees.
                          </p>
                        </div>
                        <div className="flex items-center justify-center text-gray-400">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm">Booking not available for your role</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Organizer Info */}
              <Card className="mt-6 bg-gray-900 border-orange-600/20">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-white mb-4">Event Organizer</h4>
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(event.organizerName)}`}
                      alt={event.organizerName}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-white">{event.organizerName}</p>
                      <p className="text-sm text-gray-400">Event Organizer</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>{organizerEmailLabel}</p>
                    <p>{organizerPhoneLabel}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Selection Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent onClose={() => setShowPaymentDialog(false)}>
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              Select your ticket type and payment method
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 pt-2 space-y-6">
            {/* Ticket Type Selection */}
            {event?.ticketTypes && event.ticketTypes.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-300">Select Ticket Type</p>
                {event.ticketTypes.map((ticketType) => {
                  const isSelected = selectedTicketType?.name === ticketType.name;
                  const ticketFeatures = ticketType.features || [];
                  return (
                    <button
                      key={ticketType.name}
                      onClick={() => setSelectedTicketType(ticketType)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        isSelected 
                          ? 'border-orange-500 bg-orange-500/10' 
                          : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                          {ticketType.name}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className={`font-semibold ${isSelected ? 'text-orange-500' : 'text-gray-300'}`}>
                            {formatCurrency(ticketType.price)}
                          </span>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-orange-500" />
                          )}
                        </div>
                      </div>
                      {ticketType.description && (
                        <p className="text-sm text-gray-500 mb-2">{ticketType.description}</p>
                      )}
                      {ticketFeatures.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-gray-400">What's Included:</p>
                          <div className="flex flex-wrap gap-1">
                            {ticketFeatures.map((feature, idx) => (
                              <span 
                                key={idx} 
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  isSelected 
                                    ? 'bg-orange-500/20 text-orange-400' 
                                    : 'bg-gray-700 text-gray-400'
                                }`}
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-300">Quantity</p>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                  disabled={ticketQuantity <= 1}
                >
                  -
                </Button>
                <span className="text-lg font-semibold w-12 text-center text-white">
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

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-300">Payment Method</p>
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedPaymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-500/10' 
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${isSelected ? 'bg-orange-500/20' : 'bg-gray-700'}`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-orange-500' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {method.name}
                      </p>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-orange-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>{selectedTicketType?.name || 'Ticket'} × {ticketQuantity}</span>
                <span>{formatCurrency((selectedTicketType?.price || 0) * ticketQuantity)}</span>
              </div>
              <div className="flex justify-between font-semibold text-white">
                <span>Total</span>
                <span className="text-orange-500">{formatCurrency((selectedTicketType?.price || 0) * ticketQuantity)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPurchase}
              disabled={!selectedTicketType || !selectedPaymentMethod}
              className="gradient-orange text-black"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetails;