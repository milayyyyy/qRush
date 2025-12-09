import React, { useState, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import EventCard from '../components/EventCard';
import { useEvents } from '../hooks/useEvents';
import { 
  Search, 
  Calendar, 
  Filter,
  Zap,
  Music,
  Users2,
  Palette,
  UtensilsCrossed,
  Dumbbell,
  GraduationCap,
  HeartPulse
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'All Events', icon: Filter, color: 'bg-orange-600/20 text-orange-500' },
  { id: 'technology', name: 'Technology', icon: Zap, color: 'bg-orange-600/20 text-orange-500' },
  { id: 'business', name: 'Business', icon: Users2, color: 'bg-orange-600/20 text-orange-500' },
  { id: 'music', name: 'Music', icon: Music, color: 'bg-orange-600/20 text-orange-500' },
  { id: 'art', name: 'Art & Culture', icon: Palette, color: 'bg-orange-600/20 text-orange-500' },
  { id: 'food', name: 'Food & Drink', icon: UtensilsCrossed, color: 'bg-orange-600/20 text-orange-500' },
  { id: 'sports', name: 'Sports', icon: Dumbbell, color: 'bg-orange-600/20 text-orange-500' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'bg-orange-600/20 text-orange-500' },
  { id: 'health', name: 'Health & Wellness', icon: HeartPulse, color: 'bg-orange-600/20 text-orange-500' }
];

const EventsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { loading, error, filterEvents, getPastEvents } = useEvents();

  const filteredEvents = useMemo(() => 
    filterEvents(searchTerm, selectedCategory),
    [filterEvents, searchTerm, selectedCategory]
  );
  const pastEvents = useMemo(() => 
    getPastEvents(searchTerm, selectedCategory),
    [getPastEvents, searchTerm, selectedCategory]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-gray-400">
            Find and book tickets for the most exciting events in your area
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg bg-gray-900 border-orange-600/20 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id 
                    ? 'bg-orange-600 text-black shadow-sm'
                    : 'bg-gray-900 text-gray-300 border border-orange-600/20 hover:border-orange-500/50'
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.eventID} event={event} />
          ))}
        </div>

        {/* No Results */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              No events found
            </h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search criteria or browse all events
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              variant="outline"
              className="border-orange-600/30 text-orange-500 hover:bg-orange-600/10"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Past Events Section */}
        {pastEvents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-4">Past Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <EventCard key={event.eventID} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Event Count */}
        {filteredEvents.length > 0 && (
          <div className="text-center mt-8 text-gray-400">
            Showing {filteredEvents.length} event{filteredEvents.length === 1 ? '' : 's'}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;