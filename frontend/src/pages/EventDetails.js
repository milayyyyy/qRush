/* global globalThis */
import React, { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
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
  Info,
  AlertCircle
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
    return { text: 'Capacity TBA', color: 'bg-blue-100 text-blue-700' };
  }
  const percentage = Math.min((registered / capacity) * 100, 100);
  if (percentage >= 95) return { text: 'Almost Full', color: 'bg-red-100 text-red-700' };
  if (percentage >= 75) return { text: 'Filling Fast', color: 'bg-yellow-100 text-yellow-700' };
  return { text: 'Available', color: 'bg-green-100 text-green-700' };
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

const processTicketPurchase = ({
  isAuthenticated,
  user,
  event,
  ticketQuantity,
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

  toastInstance.promise(
    apiService.bookTickets({
      userId: user.id,
      eventId: event.eventID,
      quantity: ticketQuantity,
      ticketType: 'REGULAR',
    }),
    {
      loading: 'Processing your tickets...',
      success: () => {
        navigate('/dashboard');
        return `Successfully booked ${ticketQuantity} ticket${ticketQuantity > 1 ? 's' : ''}!`;
      },
      error: 'Unable to complete the booking. Please try again.',
    }
  );
};

const renderFallbackState = ({ isLoading, error, event, navigate }) => {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event unavailable</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/events')}>
            Browse Events
          </Button>
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


  const handlePurchase = () => processTicketPurchase({
    isAuthenticated,
    user,
    event,
    ticketQuantity,
    toastInstance: toast,
    navigate,
  });

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
  const totalCost = (event.ticketPrice ?? 0) * ticketQuantity;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600 flex items-center justify-center px-6 text-center">
            <span className="text-white text-3xl font-semibold leading-tight">
              {event.title}
            </span>
          </div>
        )}
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
                {ratingSummary}
                {ratingSummary && <span>•</span>}
                <span>{attendeeSummary}</span>
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
                        <p className="text-gray-600">{formatDate(event.startDate)}</p>
                        <p className="text-gray-600">{timeRangeLabel}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-semibold text-gray-900">Location</p>
                        <p className="text-gray-600">{event.location}</p>
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
                        <p className="font-semibold text-gray-900">Attendance</p>
                        <p className="text-gray-600">{event.capacity ? `${event.registered} / ${event.capacity} people` : attendeeSummary}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
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
                        <p className="font-semibold text-gray-900">Organizer</p>
                        <p className="text-gray-600">{event.organizerName}</p>
                        <p className="text-sm text-gray-500">{organizerEmailLabel}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">About This Event</h3>
                  <div className="text-gray-600 space-y-4">
                    <p>{event.description}</p>
                    {event.fullDescription && (
                      <div className="whitespace-pre-line">{event.fullDescription}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Features */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Included</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {featureList.map((feature) => {
                    const featureKey = typeof feature === 'string' && feature.trim().length > 0
                      ? feature
                      : JSON.stringify(feature);
                    return (
                      <div key={featureKey} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Event Agenda */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Event Agenda</h3>
                <div className="space-y-4">
                  {agendaItems.map((item) => {
                    const agendaKey = [item.time, item.title, item.speaker]
                      .filter(Boolean)
                      .join('::') || item.title || item.time;
                    return (
                      <div key={agendaKey} className="flex space-x-4 pb-4 border-b border-gray-100 last:border-0">
                        <div className="w-20 flex-shrink-0">
                          <span className="text-sm font-medium text-orange-600">{item.time || 'TBD'}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                          {item.speaker && (
                            <p className="text-sm text-gray-600">by {item.speaker}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                        {formatPrice(event.ticketPrice)}
                      </div>
                      <p className="text-gray-600">per ticket</p>
                    </div>

                    {/* Quantity Selector */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Number of Tickets
                      </p>
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
                          {formatCurrency(totalCost)}
                        </span>
                      </div>
                    </div>

                    {/* Purchase Button */}
                    <Button
                      onClick={handlePurchase}
                      className="w-full gradient-orange text-white text-lg py-3 h-auto"
                      disabled={isSoldOut}
                    >
                      <Ticket className="w-5 h-5 mr-2" />
                      {isSoldOut ? 'Sold Out' : 'Buy Tickets'}
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
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(event.organizerName)}`}
                      alt={event.organizerName}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{event.organizerName}</p>
                      <p className="text-sm text-gray-600">Event Organizer</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>{organizerEmailLabel}</p>
                    <p>{organizerPhoneLabel}</p>
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