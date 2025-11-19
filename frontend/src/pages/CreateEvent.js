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
  Eye,
  CheckCircle,
  List
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../App';
import { apiService } from '../services/api';

let uniqueIdCounter = 0;

const generateUniqueId = (prefix = 'id') => {
  uniqueIdCounter += 1;
  const timePart = Date.now().toString(36);
  const counterPart = uniqueIdCounter.toString(36);
  return `${prefix}-${timePart}-${counterPart}`;
};

const createFeatureItem = (value = '') => ({
  id: generateUniqueId('feature'),
  value,
});

const createAgendaItem = (overrides = {}) => ({
  id: generateUniqueId('agenda'),
  time: typeof overrides.time === 'string' ? overrides.time : '',
  title: typeof overrides.title === 'string' ? overrides.title : '',
  speaker: typeof overrides.speaker === 'string' ? overrides.speaker : '',
});

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
    image: '',
    features: [createFeatureItem()],
    agenda: [createAgendaItem()]
  });
  const fileInputRef = useRef(null);

  const parseResponseFeatures = useCallback((rawFeatures) => {
    if (!rawFeatures) {
      return [];
    }

    const toFeatureItems = (values) => {
      return values
        .map((item) => (typeof item === 'string' ? item : String(item ?? '')))
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
        .map((value) => createFeatureItem(value));
    };

    if (Array.isArray(rawFeatures)) {
      return toFeatureItems(rawFeatures);
    }

    if (typeof rawFeatures === 'string') {
      const trimmed = rawFeatures.trim();
      if (!trimmed) {
        return [];
      }
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return toFeatureItems(parsed);
        }
        if (parsed && Array.isArray(parsed.features)) {
          return toFeatureItems(parsed.features);
        }
      } catch (err) {
        console.warn('Unable to parse event features', err);
      }
    }

    return [];
  }, []);

  const parseResponseAgenda = useCallback((rawAgenda) => {
    if (!rawAgenda) {
      return [];
    }

    const toAgendaItems = (items) => {
      return items
        .map((item) => ({
          time: typeof item?.time === 'string' ? item.time : '',
          title: typeof item?.title === 'string' ? item.title : '',
          speaker: typeof item?.speaker === 'string' ? item.speaker : '',
        }))
        .filter((item) => item.time || item.title || item.speaker)
        .map((item) => createAgendaItem(item));
    };

    if (Array.isArray(rawAgenda)) {
      return toAgendaItems(rawAgenda);
    }

    if (typeof rawAgenda === 'string') {
      const trimmed = rawAgenda.trim();
      if (!trimmed) {
        return [];
      }
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return toAgendaItems(parsed);
        }
        if (parsed && Array.isArray(parsed.agenda)) {
          return toAgendaItems(parsed.agenda);
        }
      } catch (err) {
        console.warn('Unable to parse event agenda', err);
      }
    }

    return [];
  }, []);

  const sanitizeFeatures = useCallback((features) => {
    return (features || [])
      .map((feature) => {
        if (typeof feature === 'string') {
          return feature.trim();
        }
        if (feature && typeof feature.value === 'string') {
          return feature.value.trim();
        }
        return '';
      })
      .filter((feature) => feature.length > 0);
  }, []);

  const sanitizeAgenda = useCallback((agenda) => {
    return (agenda || [])
      .map((item) => {
        const source = item && typeof item === 'object' ? item : {};
        return {
          time: typeof source.time === 'string' ? source.time.trim() : '',
          title: typeof source.title === 'string' ? source.title.trim() : '',
          speaker: typeof source.speaker === 'string' ? source.speaker.trim() : '',
        };
      })
      .filter((item) => item.time || item.title || item.speaker);
  }, []);

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
        const data = await apiService.getEvent(eventId, { trackView: false });
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
        const parsedFeatures = parseResponseFeatures(data.features);
        const parsedAgenda = parseResponseAgenda(data.agenda);

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
          features: parsedFeatures.length > 0 ? parsedFeatures : [createFeatureItem()],
          agenda: parsedAgenda.length > 0 ? parsedAgenda : [createAgendaItem()],
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
  }, [
    eventId,
    isEditMode,
    navigate,
    parseResponseAgenda,
    parseResponseFeatures,
    parseStoredOrganizerProfile,
    user?.email,
    user?.id,
    user?.name
  ]);

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

  useEffect(() => {
    setFormData((prev) => {
      const needsFeatureNormalization = prev.features.some(
        (feature) => !feature || typeof feature !== 'object' || !feature.id
      );
      const needsAgendaNormalization = prev.agenda.some(
        (item) => !item || typeof item !== 'object' || !item.id
      );

      if (!needsFeatureNormalization && !needsAgendaNormalization) {
        return prev;
      }

      const normalizedFeatures = needsFeatureNormalization
        ? prev.features.map((feature) => {
            if (feature && typeof feature === 'object' && feature.id) {
              return feature;
            }

            let rawValue = '';
            if (typeof feature === 'string') {
              rawValue = feature;
            } else if (feature && typeof feature.value === 'string') {
              rawValue = feature.value;
            }

            return createFeatureItem(rawValue);
          })
        : prev.features;

      const normalizedAgenda = needsAgendaNormalization
        ? prev.agenda.map((item) => {
            if (item && typeof item === 'object' && item.id) {
              return item;
            }
            return createAgendaItem({
              time: typeof item?.time === 'string' ? item.time : '',
              title: typeof item?.title === 'string' ? item.title : '',
              speaker: typeof item?.speaker === 'string' ? item.speaker : '',
            });
          })
        : prev.agenda;

      return {
        ...prev,
        features: normalizedFeatures,
        agenda: normalizedAgenda,
      };
    });
  }, []);

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

  const handleFeatureChange = (id, value) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((feature) => (
        feature?.id === id ? { ...feature, value } : feature
      )),
    }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, createFeatureItem()],
    }));
  };

  const removeFeature = (id) => {
    setFormData((prev) => {
      const remaining = prev.features.filter((feature) => feature?.id !== id);
      return {
        ...prev,
        features: remaining.length > 0 ? remaining : [createFeatureItem()],
      };
    });
  };

  const handleAgendaChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      agenda: prev.agenda.map((item) => (
        item?.id === id ? { ...item, [field]: value } : item
      )),
    }));
  };

  const addAgendaItem = () => {
    setFormData((prev) => ({
      ...prev,
      agenda: [...prev.agenda, createAgendaItem()],
    }));
  };

  const removeAgendaItem = (id) => {
    setFormData((prev) => {
      const remaining = prev.agenda.filter((item) => item?.id !== id);
      return {
        ...prev,
        agenda: remaining.length > 0 ? remaining : [createAgendaItem()],
      };
    });
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
    const normalizedFeatures = sanitizeFeatures(formData.features);
    const normalizedAgenda = sanitizeAgenda(formData.agenda);

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
      features: JSON.stringify(normalizedFeatures),
      agenda: JSON.stringify(normalizedAgenda),
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
  const previewFeatureItems = (formData.features || [])
    .filter((feature) => feature && typeof feature === 'object' && feature.id)
    .map((feature) => ({
      id: feature.id,
      value: typeof feature.value === 'string' ? feature.value.trim() : '',
    }))
    .filter((item) => item.value.length > 0);

  const previewAgendaItems = (formData.agenda || [])
    .filter((item) => item && typeof item === 'object' && item.id)
    .map((item) => ({
      id: item.id,
      time: typeof item.time === 'string' ? item.time.trim() : '',
      title: typeof item.title === 'string' ? item.title.trim() : '',
      speaker: typeof item.speaker === 'string' ? item.speaker.trim() : '',
    }))
    .filter((item) => item.time || item.title || item.speaker);

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

          {/* What's Included */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-orange-500" />
                <span>What's Included</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.features.map((featureItem) => (
                <div
                  key={featureItem.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <Input
                    value={featureItem?.value ?? ''}
                    onChange={(event) => handleFeatureChange(featureItem.id, event.target.value)}
                    placeholder="Add a highlight or inclusion"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(featureItem.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  Add Feature
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Event Agenda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <List className="w-5 h-5 text-orange-500" />
                <span>Event Agenda</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.agenda.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`agenda-time-${item.id}`}>Time</Label>
                      <Input
                        id={`agenda-time-${item.id}`}
                        value={item?.time ?? ''}
                        onChange={(event) => handleAgendaChange(item.id, 'time', event.target.value)}
                        placeholder="09:30 AM"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor={`agenda-title-${item.id}`}>Title</Label>
                      <Input
                        id={`agenda-title-${item.id}`}
                        value={item?.title ?? ''}
                        onChange={(event) => handleAgendaChange(item.id, 'title', event.target.value)}
                        placeholder="Session title or activity"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`agenda-speaker-${item.id}`}>Speaker / Notes</Label>
                    <Input
                      id={`agenda-speaker-${item.id}`}
                      value={item?.speaker ?? ''}
                      onChange={(event) => handleAgendaChange(item.id, 'speaker', event.target.value)}
                      placeholder="Optional speaker or facilitator"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAgendaItem(item.id)}
                    >
                      Remove Item
                    </Button>
                  </div>
                </div>
              ))}
              <div>
                <Button type="button" variant="outline" size="sm" onClick={addAgendaItem}>
                  Add Agenda Item
                </Button>
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
                  {previewFeatureItems.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">What's Included</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {previewFeatureItems.map((feature) => (
                          <li key={feature.id}>{feature.value}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {previewAgendaItems.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Event Agenda</h4>
                      <div className="space-y-2 text-gray-600">
                        {previewAgendaItems.map((item) => (
                          <div key={item.id}>
                            <span className="text-sm font-medium text-orange-600 block">
                              {item.time || 'TBD'}
                            </span>
                            <span className="block">{item.title || 'Agenda item'}</span>
                            {item.speaker && (
                              <span className="text-sm text-gray-500 block">
                                Speaker: {item.speaker}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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