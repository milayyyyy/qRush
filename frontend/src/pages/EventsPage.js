import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Clock, 
  Users,
  Filter,
  Ticket,
  Star,
  Zap,
  Music,
  Users2,
  Palette,
  UtensilsCrossed
} from 'lucide-react';

const EventsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [events, setEvents] = useState([]);

  // Mock events data
  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        title: "Tech Conference 2024",
        description: "Annual technology conference featuring the latest innovations in AI, blockchain, and web development.",
        date: "2024-03-15",
        time: "09:00 AM",
        location: "San Francisco Convention Center",
        category: "technology",
        price: 299,
        capacity: 500,
        registered: 387,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1699862731387-d40f6908ca4e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxldmVudCUyMHRpY2tldGluZ3xlbnwwfHx8fDE3NTg0NjM0MDd8MA&ixlib=rb-4.1.0&q=85",
        organizer: "TechEvents Inc."
      },
      {
        id: 2,
        title: "Summer Music Festival",
        description: "Three days of amazing music featuring top artists from around the world.",
        date: "2024-06-20",
        time: "12:00 PM",
        location: "Golden Gate Park",
        category: "music",
        price: 150,
        capacity: 2000,
        registered: 1650,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1699862731387-d40f6908ca4e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxldmVudCUyMHRpY2tldGluZ3xlbnwwfHx8fDE3NTg0NjM0MDd8MA&ixlib=rb-4.1.0&q=85",
        organizer: "Music Lovers Co."
      },
      {
        id: 3,
        title: "Business Networking Event",
        description: "Connect with industry professionals and grow your network.",
        date: "2024-04-10",
        time: "06:00 PM",
        location: "Downtown Business Center",
        category: "business",
        price: 50,
        capacity: 150,
        registered: 89,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1699862731387-d40f6908ca4e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxldmVudCUyMHRpY2tldGluZ3xlbnwwfHx8fDE3NTg0NjM0MDd8MA&ixlib=rb-4.1.0&q=85",
        organizer: "Business Network Pro"
      },
      {
        id: 4,
        title: "Art Gallery Opening",
        description: "Grand opening of contemporary art exhibition featuring local artists.",
        date: "2024-05-05",
        time: "07:00 PM",
        location: "Modern Art Gallery",
        category: "art",
        price: 0,
        capacity: 100,
        registered: 67,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1699862731387-d40f6908ca4e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxldmVudCUyMHRpY2tldGluZ3xlbnwwfHx8fDE3NTg0NjM0MDd8MA&ixlib=rb-4.1.0&q=85",
        organizer: "Art Collective"
      },
      {
        id: 5,
        title: "Food & Wine Tasting",
        description: "Experience exquisite cuisine paired with premium wines from local vineyards.",
        date: "2024-04-25",
        time: "05:00 PM",
        location: "Riverside Restaurant",
        category: "food",
        price: 120,
        capacity: 80,
        registered: 73,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1699862731387-d40f6908ca4e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxldmVudCUyMHRpY2tldGluZ3xlbnwwfHx8fDE3NTg0NjM0MDd8MA&ixlib=rb-4.1.0&q=85",
        organizer: "Culinary Experts"
      },
      {
        id: 6,
        title: "Startup Pitch Competition",
        description: "Watch promising startups pitch their ideas to top investors.",
        date: "2024-03-30",
        time: "10:00 AM",
        location: "Innovation Hub",
        category: "business",
        price: 25,
        capacity: 200,
        registered: 156,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1699862731387-d40f6908ca4e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxldmVudCUyMHRpY2tldGluZ3xlbnwwfHx8fDE3NTg0NjM0MDd8MA&ixlib=rb-4.1.0&q=85",
        organizer: "Startup Alliance"
      }
    ];
    setEvents(mockEvents);
  }, []);

  const categories = [
    { id: 'all', name: 'All Events', icon: Filter, color: 'bg-gray-100 text-gray-700' },
    { id: 'technology', name: 'Technology', icon: Zap, color: 'bg-blue-100 text-blue-700' },
    { id: 'music', name: 'Music', icon: Music, color: 'bg-purple-100 text-purple-700' },
    { id: 'business', name: 'Business', icon: Users2, color: 'bg-green-100 text-green-700' },
    { id: 'art', name: 'Visual Arts', icon: Palette, color: 'bg-pink-100 text-pink-700' },
    { id: 'food', name: 'Food & Drink', icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-700' }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getAvailabilityStatus = (registered, capacity) => {
    const percentage = (registered / capacity) * 100;
    if (percentage >= 95) return { text: 'Almost Full', color: 'bg-red-100 text-red-700' };
    if (percentage >= 75) return { text: 'Filling Fast', color: 'bg-yellow-100 text-yellow-700' };
    return { text: 'Available', color: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-gray-600">
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
              className="pl-10 h-12 text-lg"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                  selectedCategory === category.id 
                    ? category.id === 'all'
                      ? 'bg-black text-white'
                      : 'bg-white text-black border-2 border-gray-800'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-400'
                }`}
              >
                <category.icon className="w-5 h-5" />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const availability = getAvailabilityStatus(event.registered, event.capacity);
            
            return (
              <Card key={event.id} className="event-card overflow-hidden">
                <div className="relative">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={availability.color}>
                      {availability.text}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-gray-700">
                      <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                      {event.rating}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Event Title */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                        <span>{formatDate(event.date)} at {event.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-orange-500" />
                        <span>{event.registered} / {event.capacity} registered</span>
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          {event.price === 0 ? 'Free' : `₱${event.price}`}
                        </span>
                        {event.price > 0 && (
                          <span className="text-sm text-gray-500 ml-1">per ticket</span>
                        )}
                      </div>
                      <Link to={`/events/${event.id}`}>
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
          })}
        </div>

        {/* No Results */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all events
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Event Count */}
        {filteredEvents.length > 0 && (
          <div className="text-center mt-8 text-gray-600">
            Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;