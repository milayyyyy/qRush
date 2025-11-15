import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { apiService } from '../services/api';
import { validateEmail, validatePassword, validateName, validateRole } from '../utils/validators'; 
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Users, 
  Calendar, 
  Smartphone, 
  Mail, 
  Lock, 
  User,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const AuthPage = () => {
  // Authentication state management
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form validation state tracking
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');

  // Available user roles with display configurations
  const userRoles = [
    {
      id: 'attendee',
      title: 'Attendee',
      description: 'Browse events and purchase tickets',
      icon: Users,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'organizer',
      title: 'Event Organizer',
      description: 'Create and manage events',
      icon: Calendar,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'staff',
      title: 'Event Staff',
      description: 'Scan tickets and manage entry',
      icon: Smartphone,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  // Real-time email validation triggered on field interaction
  useEffect(() => {
    if (touchedFields.email) {
      const validation = validateEmail(email);
      setEmailError(validation.message);
    }
  }, [email, touchedFields.email]);

  // Real-time password validation with strength checking
  useEffect(() => {
    if (touchedFields.password) {
      const validation = validatePassword(password);
      setPasswordError(validation.message);
    }
  }, [password, touchedFields.password]);

  // Real-time name validation for proper formatting
  useEffect(() => {
    if (touchedFields.name) {
      const validation = validateName(name);
      setNameError(validation.message);
    }
  }, [name, touchedFields.name]);

  // Tracks field interaction for validation timing
  const handleFieldBlur = (fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  // Authentication submission handler for both login and registration
  const handleSubmit = async (e, isLogin = true) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');

    try {
      let response;
      
      if (isLogin) {
        // Existing user authentication flow
        response = await apiService.login({
          email: email,
          password: password
        });
      } else {
        // New user registration with comprehensive validation
        if (!selectedRole) {
          toast.error('Please select your role');
          setIsLoading(false);
          return;
        }

        // Pre-submission form validation
        setTouchedFields({
          name: true,
          email: true,
          password: true,
          role: true
        });

        const nameValidation = validateName(name);
        const emailValidation = validateEmail(email);
        const passwordValidation = validatePassword(password);
        const roleValidation = validateRole(selectedRole);

        if (!nameValidation.isValid || !emailValidation.isValid || 
            !passwordValidation.isValid || !roleValidation.isValid) {
          setNameError(nameValidation.message);
          setEmailError(emailValidation.message);
          setPasswordError(passwordValidation.message);
          setIsLoading(false);
          return;
        }

        // Registration data payload
        response = await apiService.signup({
          name: name,
          email: email,
          password: password,
          role: selectedRole.toUpperCase(),
          contact: email
        });
      }

      // User data transformation from backend to frontend format
      const userData = {
        id: response.userID,
        email: response.email,
        name: response.name,
        role: response.role.toLowerCase(),
        contact: response.contact,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.email}`
      };

      // Global authentication state update
      login(userData);
      toast.success(`Welcome ${isLogin ? 'back' : 'to QRush'}, ${userData.name}!`);
      
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(error.message || `Failed to ${isLogin ? 'sign in' : 'sign up'}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Visual password strength indicator component
  const PasswordStrengthIndicator = ({ password }) => {
    if (!password) return null;

    const getStrength = (pwd) => {
      let score = 0;
      if (pwd.length >= 8) score++;
      if (/[a-z]/.test(pwd)) score++;
      if (/[A-Z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[@$!%*?&]/.test(pwd)) score++;
      
      return score;
    };

    const strength = getStrength(password);
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500', 'bg-green-600'];

    return (
      <div className="mt-2">
        <div className="flex space-x-1 mb-1">
          {[1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index <= strength ? strengthColors[strength - 1] : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-600">
          Password strength: <span className={`font-medium ${
            strength <= 2 ? 'text-red-600' : 
            strength <= 3 ? 'text-orange-600' : 
            strength <= 4 ? 'text-blue-600' : 'text-green-600'
          }`}>
            {strengthLabels[strength]}
          </span>
        </p>
      </div>
    );
  };

  // Role selection interface component
  const RoleCard = ({ role }) => (
    <div
      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
        selectedRole === role.id
          ? 'border-orange-500 bg-orange-50'
          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
      }`}
      onClick={() => setSelectedRole(role.id)}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 ${role.color} rounded-lg flex items-center justify-center`}>
          <role.icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{role.title}</h3>
          <p className="text-sm text-gray-600">{role.description}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 ${
          selectedRole === role.id
            ? 'border-orange-500 bg-orange-500'
            : 'border-gray-300'
        }`}>
          {selectedRole === role.id && (
            <div className="w-full h-full bg-white rounded-full scale-50"></div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Link 
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-orange-600 mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 gradient-orange rounded-2xl flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome to QRush
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-sm font-medium">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-sm font-medium">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login interface for existing users */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gradient-orange text-white h-11 font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <div className="text-center text-sm text-gray-600">
                  <p>Use your registered email and password</p>
                </div>
              </TabsContent>

              {/* Registration interface for new users */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="signup-name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        className={`pl-10 h-11 ${nameError ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => handleFieldBlur('name')}
                      />
                    </div>
                    {nameError && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {nameError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className={`pl-10 h-11 ${emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => handleFieldBlur('email')}
                      />
                    </div>
                    {emailError && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {emailError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        className={`pl-10 h-11 ${passwordError ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => handleFieldBlur('password')}
                      />
                    </div>
                    {passwordError ? (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {passwordError}
                      </p>
                    ) : (
                      <PasswordStrengthIndicator password={password} />
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Select Your Role
                    </Label>
                    <div className="space-y-2">
                      {userRoles.map((role) => (
                        <RoleCard key={role.id} role={role} />
                      ))}
                    </div>
                    {touchedFields.role && !selectedRole && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Please select a role
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gradient-orange text-white h-11 font-semibold"
                    disabled={isLoading || !selectedRole || nameError || emailError || passwordError}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>

                <div className="text-center text-sm text-gray-600">
                  <p>Create your account to get started</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Real authentication with Spring Boot backend
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;