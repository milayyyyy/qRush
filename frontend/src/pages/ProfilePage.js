import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Camera,
  Save,
  Calendar,
  Ticket,
  Users,
  CheckCircle,
  Cake
} from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    contact: user?.contact || '',
    gender: user?.gender || '',
    birthdate: user?.birthdate || '',
  });

  // Calculate age from birthdate
  const calculateAge = (birthdate) => {
    if (!birthdate) return null;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(formData.birthdate);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'attendee':
        return <Ticket className="w-5 h-5" />;
      case 'organizer':
        return <Calendar className="w-5 h-5" />;
      case 'staff':
        return <Users className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'attendee':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'organizer':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'staff':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update user data
    const updatedUser = {
      ...user,
      name: formData.name,
      email: formData.email,
      contact: formData.contact,
      gender: formData.gender,
      birthdate: formData.birthdate,
    };
    
    login(updatedUser);
    setIsEditing(false);
    setIsSaving(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      contact: user?.contact || '',
      gender: user?.gender || '',
      birthdate: user?.birthdate || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Not logged in</h2>
          <p className="text-gray-400 mb-4">Please sign in to view your profile.</p>
          <Button onClick={() => navigate('/auth')} className="gradient-orange text-black">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
          </div>
        </div>

        {/* Profile Card */}
        <div className="relative group mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
          <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl overflow-hidden">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-orange-600 to-orange-400"></div>
            
            {/* Avatar Section */}
            <div className="px-6 pb-6">
              <div className="relative -mt-16 mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-gray-900 bg-gray-800 overflow-hidden">
                  <img 
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-2 right-2 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
                  <p className="text-gray-400 mb-3">{user.email}</p>
                  <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    <span className="capitalize font-medium">{user.role}</span>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
                
                {!isEditing && (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="gradient-orange text-black"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <User className="w-5 h-5 text-orange-500" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10 bg-gray-800 border-gray-700 text-white disabled:opacity-70"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10 bg-gray-800 border-gray-700 text-white disabled:opacity-70"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-gray-300">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="contact"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your contact number"
                      className="pl-10 bg-gray-800 border-gray-700 text-white disabled:opacity-70"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthdate" className="text-gray-300">Birthdate</Label>
                    <div className="relative">
                      <Cake className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="birthdate"
                        name="birthdate"
                        type="date"
                        value={formData.birthdate}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="pl-10 bg-gray-800 border-gray-700 text-white disabled:opacity-70"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-gray-300">Age</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="age"
                        name="age"
                        value={age !== null ? `${age} years old` : 'Not set'}
                        disabled
                        className="pl-10 bg-gray-800 border-gray-700 text-white disabled:opacity-70"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-gray-300">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full h-10 px-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-70"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                {isEditing && (
                  <div className="flex space-x-3 pt-4">
                    <Button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 gradient-orange text-black"
                    >
                      {isSaving ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Information */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-orange-500" />
                  <span>Account Information</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your account details and status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div>
                    <p className="text-sm text-gray-400">User ID</p>
                    <p className="text-white font-mono">{user.id || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div>
                    <p className="text-sm text-gray-400">Account Type</p>
                    <p className="text-white capitalize">{user.role}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${getRoleColor(user.role)}`}>
                    Active
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div>
                    <p className="text-sm text-gray-400">Email Verified</p>
                    <p className="text-white">Yes</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-gray-400">Account Created</p>
                    <p className="text-white">Recently</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/settings')}
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-orange-500"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Manage Account Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Stats based on role */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Stats</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {user.role === 'attendee' && (
              <>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Events Attended</p>
                        <p className="text-3xl font-bold text-white">0</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-orange-500" />
                      </div>
                    </div>
                  </Card>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Active Tickets</p>
                        <p className="text-3xl font-bold text-white">0</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                        <Ticket className="w-6 h-6 text-orange-500" />
                      </div>
                    </div>
                  </Card>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Member Since</p>
                        <p className="text-xl font-bold text-white">2024</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-orange-500" />
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            )}
            {user.role === 'organizer' && (
              <>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Events Created</p>
                        <p className="text-3xl font-bold text-white">0</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-orange-500" />
                      </div>
                    </div>
                  </Card>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Attendees</p>
                        <p className="text-3xl font-bold text-white">0</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-orange-500" />
                      </div>
                    </div>
                  </Card>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Revenue</p>
                        <p className="text-2xl font-bold text-orange-500">₱0.00</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                        <Ticket className="w-6 h-6 text-orange-500" />
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            )}
            {user.role === 'staff' && (
              <>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Tickets Scanned</p>
                        <p className="text-3xl font-bold text-white">0</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                        <Ticket className="w-6 h-6 text-orange-500" />
                      </div>
                    </div>
                  </Card>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Events Assigned</p>
                        <p className="text-3xl font-bold text-white">0</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-orange-500" />
                      </div>
                    </div>
                  </Card>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Success Rate</p>
                        <p className="text-3xl font-bold text-green-500">100%</p>
                      </div>
                      <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
