import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { apiService } from '../services/api';
import { validateEmail, validatePassword, validateName, validateRole, validateContact, validateBirthdate, validateGender } from '../utils/validators'; 
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
  AlertCircle,
  Eye,
  EyeOff,
  Phone,
  Cake
} from 'lucide-react';
import { toast } from 'sonner';

const AuthPage = () => {
  // Authentication state management
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState('login'); // default tab
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Form validation state tracking
  const [touchedFields, setTouchedFields] = useState({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [contact, setContact] = useState('');
  const [contactError, setContactError] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [birthdateError, setBirthdateError] = useState('');
  const [gender, setGender] = useState('');
  const [genderError, setGenderError] = useState('');

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

  // Real-time contact validation for 11-digit number starting with 09
  useEffect(() => {
    if (touchedFields.contact) {
      const validation = validateContact(contact);
      setContactError(validation.message);
    }
  }, [contact, touchedFields.contact]);

  // Real-time birthdate validation
  useEffect(() => {
    if (touchedFields.birthdate) {
      const validation = validateBirthdate(birthdate);
      setBirthdateError(validation.message);
    }
  }, [birthdate, touchedFields.birthdate]);

  // Real-time gender validation
  useEffect(() => {
    if (touchedFields.gender) {
      const validation = validateGender(gender);
      setGenderError(validation.message);
    }
  }, [gender, touchedFields.gender]);

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
    const contactNum = formData.get('contact');

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
          contact: true,
          birthdate: true,
          gender: true,
          role: true
        });

        const nameValidation = validateName(name);
        const emailValidation = validateEmail(email);
        const passwordValidation = validatePassword(password);
        const contactValidation = validateContact(contactNum);
        const birthdateValidation = validateBirthdate(birthdate);
        const genderValidation = validateGender(gender);
        const roleValidation = validateRole(selectedRole);

        if (!nameValidation.isValid || !emailValidation.isValid || 
            !passwordValidation.isValid || !contactValidation.isValid || 
            !birthdateValidation.isValid || !genderValidation.isValid || !roleValidation.isValid) {
          setNameError(nameValidation.message);
          setEmailError(emailValidation.message);
          setPasswordError(passwordValidation.message);
          setContactError(contactValidation.message);
          setBirthdateError(birthdateValidation.message);
          setGenderError(genderValidation.message);
          setIsLoading(false);
          return;
        }

        // Registration data payload
        response = await apiService.signup({
          name: name,
          email: email,
          password: password,
          role: selectedRole.toUpperCase(),
          contact: contactNum,
          birthdate: birthdate,
          gender: gender
        });
      }

      if (!isLogin) {
        // Signup flow
        toast.success(response.message); // Signup successful message

        // Clear all signup inputs
        setName('');
        setEmail('');
        setPassword('');
        setContact('');
        setBirthdate('');
        setGender('');
        setSelectedRole('');
        setTouchedFields({});

        setCurrentTab('login');        // redirect user to login tab

        
        return;
      }

      // Login flow (keep the existing login code here)
      const userData = {
        id: response.userID,
        email: response.email,
        name: response.name,
        role: response.role.toLowerCase(),
        contact: response.contact,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.email}`
      };

      login(userData);
      toast.success(`Welcome back, ${userData.name}!`);
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
          ? 'border-orange-500 bg-orange-600/20'
          : 'border-gray-700 hover:border-orange-500/50 hover:bg-orange-600/10'
      }`}
      onClick={() => setSelectedRole(role.id)}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center`}>
          <role.icon className="w-6 h-6 text-orange-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">{role.title}</h3>
          <p className="text-sm text-gray-400">{role.description}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 ${
          selectedRole === role.id
            ? 'border-orange-500 bg-orange-500'
            : 'border-gray-600'
        }`}>
          {selectedRole === role.id && (
            <div className="w-full h-full bg-black rounded-full scale-50"></div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border border-orange-600/20 bg-gray-900">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 gradient-orange rounded-2xl flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-black" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Welcome to QRush
            </CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>

          
          <CardContent>
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
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
                    <Label htmlFor="login-email" className="text-sm font-medium text-gray-300">
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
                    <Label htmlFor="login-password" className="text-sm font-medium text-gray-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-password"
                        name="password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 h-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-orange-500 transition-colors"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gradient-orange text-black h-11 font-semibold"
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

                <div className="text-center text-sm text-gray-400">
                  <p>Use your registered email and password</p>
                </div>
              </TabsContent>

              {/* Registration interface for new users */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium text-gray-300">
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
                    <Label htmlFor="signup-email" className="text-sm font-medium text-gray-300">
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
                    <Label htmlFor="signup-password" className="text-sm font-medium text-gray-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        name="password"
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className={`pl-10 pr-10 h-11 ${passwordError ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => handleFieldBlur('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-orange-500 transition-colors"
                      >
                        {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
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

                  <div className="space-y-2">
                    <Label htmlFor="signup-contact" className="text-sm font-medium text-gray-300">
                      Contact Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="signup-contact"
                        name="contact"
                        type="tel"
                        placeholder="09123456789"
                        className={`pl-10 h-11 ${contactError ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
                        required
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        onBlur={() => handleFieldBlur('contact')}
                        maxLength={11}
                      />
                    </div>
                    {contactError && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {contactError}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-birthdate" className="text-sm font-medium text-gray-300">
                        Birthdate
                      </Label>
                      <div className="relative">
                        <Cake className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="signup-birthdate"
                          name="birthdate"
                          type="date"
                          className={`pl-10 h-11 ${birthdateError ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
                          required
                          value={birthdate}
                          onChange={(e) => setBirthdate(e.target.value)}
                          onBlur={() => handleFieldBlur('birthdate')}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      {birthdateError && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {birthdateError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-gender" className="text-sm font-medium text-gray-300">
                        Gender
                      </Label>
                      <select
                        id="signup-gender"
                        name="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        onBlur={() => handleFieldBlur('gender')}
                        className={`w-full h-11 px-3 rounded-md bg-gray-800 border text-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${genderError ? 'border-red-500' : 'border-gray-700'}`}
                        required
                      >
                        <option value="" className="text-gray-400">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                      {genderError && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {genderError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-300">
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
                    className="w-full gradient-orange text-black h-11 font-semibold"
                    disabled={isLoading || !selectedRole || nameError || emailError || passwordError || contactError || birthdateError || genderError}
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

                <div className="text-center text-sm text-gray-400">
                  <p>Create your account to get started</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Real authentication with Spring Boot backend
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;