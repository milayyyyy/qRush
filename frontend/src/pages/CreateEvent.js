import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Image,
  Save,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../App';
import { apiService } from '../services/api';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { user } = useAuth();
  const isEditMode = Boolean(eventId);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(isEditMode);
  const [organizerProfile, setOrganizerProfile] = useState({
    organizationName: user?.name || '',
    email: user?.email || '',
    contactNumber: '',
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fullDescription: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    address: '',
    category: 'technology',
    price: 0,
    capacity: 100,
    image: ''
  });
  const fileInputRef = useRef(null);

  const parseStoredOrganizerProfile = useCallback(() => {
    try {
      const rawValue = localStorage.getItem('qrush_organizer_profile');
      if (!rawValue) {
        return null;
      }
      const parsed = JSON.parse(rawValue);
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
    if (isEditMode) {
      return;
    }
    const storedProfile = parseStoredOrganizerProfile();
    if (storedProfile) {
      setOrganizerProfile({
        organizationName: storedProfile.organizationName ?? user?.name ?? '',
        email: storedProfile.email ?? user?.email ?? '',
        contactNumber: storedProfile.contactNumber ?? '',
      });
    }

    try {
      const storedDefaults = localStorage.getItem('qrush_organizer_defaults');
      if (storedDefaults) {
        const parsedDefaults = JSON.parse(storedDefaults);
        setFormData((prev) => ({
          ...prev,
          location: parsedDefaults.location ?? prev.location,
          price: parsedDefaults.price ?? prev.price,
        }));
      }
    } catch (err) {
      console.warn('Unable to load organizer default event settings', err);
    }
  }, [isEditMode, parseStoredOrganizerProfile, user?.email, user?.id, user?.name]);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const toDateInput = (value) => {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      const pad = (num) => String(num).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    };

    const toTimeInput = (value) => {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      const pad = (num) => String(num).padStart(2, '0');
      return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const storedProfile = parseStoredOrganizerProfile();

    const loadEvent = async () => {
      try {
        setIsInitializing(true);
        const data = await apiService.getEvent(eventId);
        if (!data) {
          toast.error('We could not find the event you want to edit.');
          navigate('/dashboard');
          return;
        }

        const segments = (data.description || '')
          .split('\n\n')
          .map((segment) => segment.trim())
          .filter(Boolean);

        const shortDescription = segments[0] || '';
        const address = segments.length > 1 ? segments[segments.length - 1] : '';
        const detailedSegments = segments.length > 2 ? segments.slice(1, -1) : [];
        const detailedDescription = detailedSegments.join('\n\n');

        setFormData((prev) => ({
          ...prev,
          title: data.name || '',
          description: shortDescription,
          fullDescription: detailedDescription,
          date: toDateInput(data.startDate),
          time: toTimeInput(data.startDate),
          endTime: toTimeInput(data.endDate),
          location: data.location || '',
          address,
          category: data.category || prev.category,
          price: data.ticketPrice !== null && data.ticketPrice !== undefined ? String(data.ticketPrice) : prev.price,
          capacity: data.capacity !== null && data.capacity !== undefined ? String(data.capacity) : prev.capacity,
          image: data.image || '',
        }));

        setOrganizerProfile({
          organizationName: storedProfile?.organizationName ?? data.organizerDisplayName ?? data.organizer ?? user?.name ?? '',
          email: storedProfile?.email ?? data.organizerEmail ?? user?.email ?? '',
          contactNumber: storedProfile?.contactNumber ?? data.organizerPhone ?? '',
        });
      } catch (err) {
        console.error('Failed to load event for editing', err);
        toast.error('Failed to load event details.');
        navigate('/dashboard');
      } finally {
        setIsInitializing(false);
      }
    };

    loadEvent();
  }, [eventId, isEditMode, navigate, parseStoredOrganizerProfile, user?.email, user?.id, user?.name]);

  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'business', label: 'Business' },
    { value: 'music', label: 'Music' },
    { value: 'art', label: 'Art & Culture' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'sports', label: 'Sports' },
    { value: 'education', label: 'Education' },
    { value: 'health', label: 'Health & Wellness' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number.parseFloat(value) || 0 : value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      event.target.value = '';
      return;
    }

    const fiveMegabytes = 5 * 1024 * 1024;
    if (file.size > fiveMegabytes) {
      toast.error('Image must be 5MB or smaller.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      }
    };

    reader.onerror = () => {
      toast.error('We could not read that image. Please try another file.');
    };

    reader.readAsDataURL(file);
    // Reset the file input so users can pick the same file again if needed.
    event.target.value = '';
  };

  const handleClearImage = () => {
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
  };

  const handleSubmit = async (e, saveAsDraft = false) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!formData.title || !formData.date || !formData.time || !formData.location || !formData.capacity) {
      toast.error('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (!user) {
      toast.error('You must be signed in to create an event');
      setIsLoading(false);
      return;
    }

    if (saveAsDraft) {
      toast.info(isEditMode ? 'Draft saving is not available while editing an event.' : 'Draft saving is not available yet. Publish the event to store it.');
      setIsLoading(false);
      return;
    }

    const startDateTime = `${formData.date}T${formData.time}:00`;
    const endTimeValue = formData.endTime || formData.time;
    const endDateTime = `${formData.date}T${endTimeValue}:00`;
    const combinedDescription = [formData.description, formData.fullDescription, formData.address]
      .filter(Boolean)
      .join('\n\n');

    const payload = {
      name: formData.title,
      location: formData.location,
      category: formData.category,
      startDate: startDateTime,
      endDate: endDateTime,
      ticketPrice: Number.isFinite(Number(formData.price)) ? Number(formData.price) : 0,
      capacity: Number.isFinite(Number(formData.capacity)) ? Number(formData.capacity) : 0,
      organizer: user.name,
      organizerDisplayName: (organizerProfile.organizationName || user.name || '').trim(),
      organizerEmail: (organizerProfile.email || user.email || '').trim(),
      organizerPhone: (organizerProfile.contactNumber || '').trim(),
      description: combinedDescription || '',
      image: formData.image || null,
    };

    try {
      if (isEditMode) {
        await apiService.updateEvent(eventId, payload);
        toast.success('Event updated successfully!');
      } else {
        await apiService.createEvent(payload);
        toast.success('Event published successfully!');
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to create event', err);
      toast.error(isEditMode ? 'Failed to update event. Please try again.' : 'Failed to publish event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pageTitle = isEditMode ? 'Edit Event' : 'Create New Event';
  const submitLabel = isEditMode ? 'Save Changes' : 'Publish Event';

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          <div></div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter event title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of your event (max 200 characters)"
                  maxLength={200}
                  rows={3}
                  required
                />
                <p className="text-sm text-gray-500">
                  {formData.description.length}/200 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullDescription">Full Description</Label>
                <Textarea
                  id="fullDescription"
                  name="fullDescription"
                  value={formData.fullDescription}
                  onChange={handleInputChange}
                  placeholder="Detailed description of your event, agenda, speakers, etc."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Event Image</Label>
                <div className="flex flex-wrap gap-2">
                  <Input
                    id="image"
                    name="image"
                    type="text"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Paste an image URL or upload below"
                    className="flex-1 min-w-[220px]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                  {formData.image && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearImage}
                    >
                      Remove
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Use a direct image link or upload a JPG/PNG (max 5MB).
                </p>
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Event preview"
                    className="w-full h-48 object-cover rounded-lg mt-2"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      toast.error('We could not load the provided image.');
                      handleClearImage();
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span>Date & Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Event Date *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Start Time *</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span>Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location">Venue Name *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Convention Center, Community Hall"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Complete address with street, city, state, zip code"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Capacity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-orange-500" />
                <span>Pricing & Capacity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Ticket Price (₱)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                  <p className="text-sm text-gray-500">
                    Set to 0 for free events
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="capacity">Maximum Capacity *</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="100"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Maximum number of attendees
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {formData.title && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-900">
                  <Eye className="w-5 h-5" />
                  <span>Event Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Event"
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {formData.title}
                  </h3>
                  {formData.description && (
                    <p className="text-gray-600 mb-4">{formData.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    {formData.date && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span>{new Date(formData.date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {formData.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span>{formData.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-orange-500" />
                      <span>{formData.price === 0 ? 'Free' : `₱${formData.price}`}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-orange-500" />
                      <span>{formData.capacity} capacity</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isLoading || isEditMode}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </>
              )}
            </Button>
            
            <Button
              type="submit"
              className="gradient-orange text-white flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isEditMode ? 'Saving...' : 'Publishing...'}</span>
                </div>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  {submitLabel}
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>
              By publishing this event, you agree to our{' '}
              <button type="button" className="text-orange-600 hover:underline">Terms of Service</button>
              {' '}and{' '}
              <button type="button" className="text-orange-600 hover:underline">Event Guidelines</button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;