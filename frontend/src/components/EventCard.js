import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, MapPin, Users, Ticket, Star } from 'lucide-react';

const EventCard = ({ event }) => {
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
      return { text: 'Capacity TBA', color: 'bg-blue-100 text-blue-700' };
    }

    const reg = Number(registered) || 0;
    const cap = Number(capacity);
    const percentage = Math.min((reg / cap) * 100, 100);

    if (percentage >= 100) return { text: 'Sold Out', color: 'bg-gray-100 text-gray-700' };
    if (percentage >= 95) return { text: 'Almost Full', color: 'bg-red-100 text-red-700' };
    if (percentage >= 75) return { text: 'Filling Fast', color: 'bg-yellow-100 text-yellow-700' };
    return { text: 'Available', color: 'bg-green-100 text-green-700' };
  };

  const availability = getAvailabilityStatus(event.ticketsSold, event.capacity);
  

  return (
    <Card className="event-card overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        {event.image ? (
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 flex items-center justify-center">
            <span className="text-orange-900 font-semibold">Add an event image to highlight this listing</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Badge className={availability.color}>
            {availability.text}
          </Badge>
        </div>
        {event.rating && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-white/90 text-gray-700">
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {event.name}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {event.description}
            </p>
          </div>

          {/* Event Details */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-orange-500" />
              <span>{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-orange-500" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2 text-orange-500" />
              <span>{event.ticketsSold} / {event.capacity} registered</span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {event.ticketPrice === 0 ? 'Free' : `₱${event.ticketPrice}`}
              </span>
              {event.ticketPrice > 0 && (
                <span className="text-sm text-gray-500 ml-1">per ticket</span>
              )}
            </div>
            <Link to={`/events/${event.eventID}`}>
              <Button className="gradient-orange text-white hover:opacity-90">
                <Ticket className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </Link>
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
  }).isRequired,
};
