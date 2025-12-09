import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, MapPin, Users, Ticket, Star } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../App';

// Track which events have been viewed in this browser session
const viewedEventsThisSession = new Set();

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const getAvailabilityStatus = (registered, capacity) => {
    if (!capacity) {
      return { text: 'Capacity TBA', color: 'bg-blue-600/20 text-blue-400' };
    }

    const reg = Number(registered) || 0;
    const cap = Number(capacity);
    const percentage = Math.min((reg / cap) * 100, 100);

    if (percentage >= 100) return { text: 'Sold Out', color: 'bg-gray-600/20 text-gray-400' };
    if (percentage >= 95) return { text: 'Almost Full', color: 'bg-red-600/20 text-red-400' };
    if (percentage >= 75) return { text: 'Filling Fast', color: 'bg-yellow-600/20 text-yellow-400' };
    return { text: 'Available', color: 'bg-green-600/20 text-green-400' };
  };

  const availability = getAvailabilityStatus(event.ticketsSold, event.capacity);

  // Status badge color and text
  const statusBadge = (() => {
    switch (event.status) {
      case 'ENDED': return { text: 'Ended', color: 'bg-gray-600/20 text-gray-400' };
      case 'CANCELLED': return { text: 'Cancelled', color: 'bg-red-600/20 text-red-400' };
      case 'ARCHIVED': return { text: 'Archived', color: 'bg-yellow-600/20 text-yellow-400' };
      default: return null;
    }
  })();
  

  return (
    <Card className="event-card overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-gray-900 border-orange-600/20">
      <div className="relative">
        {event.image ? (
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-orange-600/40 via-orange-700/40 to-orange-800/40 flex items-center justify-center">
            <span className="text-orange-300 font-semibold">Add an event image to highlight this listing</span>
          </div>
        )}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Badge className={availability.color}>
            {availability.text}
          </Badge>
          {statusBadge && (
            <Badge className={statusBadge.color}>{statusBadge.text}</Badge>
          )}
        </div>
        {event.rating && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-black/80 text-gray-200">
              <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
              {event.rating}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Event Title */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {event.name}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2">
              {event.description}
            </p>
          </div>

          {/* Event Details */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-400">
              <Calendar className="w-4 h-4 mr-2 text-orange-500" />
              <span>{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <MapPin className="w-4 h-4 mr-2 text-orange-500" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Users className="w-4 h-4 mr-2 text-orange-500" />
              <span>{event.ticketsSold} / {event.capacity} registered</span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-orange-600/20">
            <div>
              <span className="text-2xl font-bold text-white">
                {event.ticketPrice === 0 ? 'Free' : `₱${event.ticketPrice}`}
              </span>
              {event.ticketPrice > 0 && (
                <span className="text-sm text-gray-500 ml-1">per ticket</span>
              )}
            </div>
            <Button 
              className="gradient-orange text-black hover:opacity-90"
              onClick={() => {
                const eventKey = `${event.eventID}-${user?.id || 'anonymous'}`;
                if (!viewedEventsThisSession.has(eventKey)) {
                  viewedEventsThisSession.add(eventKey);
                  apiService.trackEventView(event.eventID, {
                    userId: user?.id || null,
                    userRole: user?.role || null
                  }).catch(() => {
                    viewedEventsThisSession.delete(eventKey);
                  });
                }
                navigate(`/events/${event.eventID}`);
              }}
              disabled={event.status !== 'AVAILABLE'}
              title={event.status === 'AVAILABLE' ? undefined : 'Purchasing disabled for this event'}
            >
              <Ticket className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>

          {/* Organizer */}
          <div className="text-xs text-gray-500">
            Organized by {event.organizer}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;

EventCard.propTypes = {
  event: PropTypes.shape({
    eventID: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    location: PropTypes.string,
    registered: PropTypes.number,
    capacity: PropTypes.number,
    ticketPrice: PropTypes.number,
    organizer: PropTypes.string,
    rating: PropTypes.number,
    image: PropTypes.string,
    status: PropTypes.string,
    ticketsSold: PropTypes.number,
  }).isRequired,
};
