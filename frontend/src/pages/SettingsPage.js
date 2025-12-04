import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Settings, 
  Bell, 
  Shield, 
  Eye,
  EyeOff,
  Lock,
  Trash2,
  Mail,
  Smartphone,
  Globe,
  Volume2,
  VolumeX,
  Save,
  AlertTriangle,
  CheckCircle,
  Copy,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Notification Settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    eventReminders: true,
    promotions: false,
    sound: true,
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete Account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Two-Factor Authentication
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [disable2FACode, setDisable2FACode] = useState('');

  // Generate a random secret key for 2FA (simulated)
  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  // Generate QR code URL for Google Authenticator
  const getQRCodeUrl = (secret) => {
    const issuer = 'QRush';
    const account = user?.email || 'user@example.com';
    const otpauthUrl = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
  };

  // Handle enabling 2FA
  const handleEnable2FA = () => {
    const secret = generateSecret();
    setTwoFactorSecret(secret);
    setShowTwoFactorSetup(true);
    setTwoFactorCode('');
  };

  // Verify 2FA code and enable
  const handleVerify2FA = async () => {
    if (twoFactorCode.length !== 6 || !/^\d+$/.test(twoFactorCode)) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying2FA(true);
    
    // Simulate API verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In real implementation, verify the TOTP code against the secret
    // For demo, we accept any 6-digit code
    setTwoFactorEnabled(true);
    setShowTwoFactorSetup(false);
    setTwoFactorCode('');
    setIsVerifying2FA(false);
    toast.success('Two-Factor Authentication enabled successfully!');
  };

  // Handle disabling 2FA
  const handleDisable2FA = async () => {
    if (disable2FACode.length !== 6 || !/^\d+$/.test(disable2FACode)) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying2FA(true);
    
    // Simulate API verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTwoFactorEnabled(false);
    setShowDisable2FA(false);
    setDisable2FACode('');
    setTwoFactorSecret('');
    setIsVerifying2FA(false);
    toast.success('Two-Factor Authentication disabled');
  };

  // Copy secret to clipboard
  const copySecret = () => {
    navigator.clipboard.writeText(twoFactorSecret);
    toast.success('Secret key copied to clipboard');
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification settings updated');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Password changed successfully');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setIsChangingPassword(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Account deleted successfully');
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Not logged in</h2>
          <p className="text-gray-400 mb-4">Please sign in to access settings.</p>
          <Button onClick={() => navigate('/auth')} className="gradient-orange text-black">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-orange-500' : 'bg-gray-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-xl bg-gray-900/50">
            <TabsTrigger value="notifications" className="text-sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="text-sm">
              <Lock className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="account" className="text-sm">
              <Settings className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-orange-500" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose how you want to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between py-3 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-400">Receive updates via email</p>
                      </div>
                    </div>
                    <ToggleSwitch 
                      enabled={notifications.email} 
                      onChange={() => handleNotificationChange('email')} 
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Push Notifications</p>
                        <p className="text-sm text-gray-400">Receive push notifications</p>
                      </div>
                    </div>
                    <ToggleSwitch 
                      enabled={notifications.push} 
                      onChange={() => handleNotificationChange('push')} 
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Bell className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Event Reminders</p>
                        <p className="text-sm text-gray-400">Get reminded before events</p>
                      </div>
                    </div>
                    <ToggleSwitch 
                      enabled={notifications.eventReminders} 
                      onChange={() => handleNotificationChange('eventReminders')} 
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Promotions & News</p>
                        <p className="text-sm text-gray-400">Receive promotional content</p>
                      </div>
                    </div>
                    <ToggleSwitch 
                      enabled={notifications.promotions} 
                      onChange={() => handleNotificationChange('promotions')} 
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        {notifications.sound ? (
                          <Volume2 className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">Sound Effects</p>
                        <p className="text-sm text-gray-400">Play sounds for notifications</p>
                      </div>
                    </div>
                    <ToggleSwitch 
                      enabled={notifications.sound} 
                      onChange={() => handleNotificationChange('sound')} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-orange-500" />
                    <span>Change Password</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-3 text-gray-400 hover:text-orange-500"
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-3 text-gray-400 hover:text-orange-500"
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-300">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-3 text-gray-400 hover:text-orange-500"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="w-full gradient-orange text-black mt-4"
                    >
                      {isChangingPassword ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                          <span>Changing Password...</span>
                        </div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Two-Factor Authentication */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <Card className="relative bg-gray-900 border-orange-600/20 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Smartphone className="w-5 h-5 text-orange-500" />
                    <span>Two-Factor Authentication</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!showTwoFactorSetup && !showDisable2FA ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 ${twoFactorEnabled ? 'bg-green-500/20' : 'bg-gray-700/50'} rounded-xl flex items-center justify-center`}>
                          <Shield className={`w-6 h-6 ${twoFactorEnabled ? 'text-green-400' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">2FA Status</p>
                          <p className={`text-sm ${twoFactorEnabled ? 'text-green-400' : 'text-gray-400'}`}>
                            {twoFactorEnabled ? 'Enabled' : 'Currently disabled'}
                          </p>
                        </div>
                      </div>
                      {twoFactorEnabled ? (
                        <Button 
                          variant="outline" 
                          className="border-red-500 text-red-500 hover:bg-red-500/10"
                          onClick={() => setShowDisable2FA(true)}
                        >
                          Disable 2FA
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                          onClick={handleEnable2FA}
                        >
                          Enable 2FA
                        </Button>
                      )}
                    </div>
                  ) : showTwoFactorSetup ? (
                    <div className="space-y-6">
                      {/* Setup Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Set Up Two-Factor Authentication</h3>
                        <button 
                          onClick={() => {
                            setShowTwoFactorSetup(false);
                            setTwoFactorCode('');
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Step 1: Scan QR Code */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-black text-sm font-bold">1</div>
                          <p className="text-white font-medium">Scan QR Code</p>
                        </div>
                        <p className="text-sm text-gray-400 ml-8">
                          Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to scan this QR code.
                        </p>
                        <div className="flex justify-center py-4">
                          <div className="bg-white p-3 rounded-xl">
                            <img 
                              src={getQRCodeUrl(twoFactorSecret)} 
                              alt="2FA QR Code" 
                              className="w-48 h-48"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Manual Entry */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-black text-sm font-bold">2</div>
                          <p className="text-white font-medium">Or Enter Secret Key Manually</p>
                        </div>
                        <div className="ml-8 flex items-center space-x-2">
                          <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
                            <p className="text-orange-400 font-mono text-sm tracking-wider">{twoFactorSecret}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={copySecret}
                            className="border-gray-700 text-gray-300 hover:bg-gray-800"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Step 3: Verify */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-black text-sm font-bold">3</div>
                          <p className="text-white font-medium">Enter Verification Code</p>
                        </div>
                        <p className="text-sm text-gray-400 ml-8">
                          Enter the 6-digit code from your authenticator app to verify setup.
                        </p>
                        <div className="ml-8 space-y-4">
                          <Input
                            type="text"
                            placeholder="000000"
                            value={twoFactorCode}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                              setTwoFactorCode(value);
                            }}
                            className="bg-gray-800 border-gray-700 text-white text-center text-2xl tracking-[0.5em] font-mono"
                            maxLength={6}
                          />
                          <Button 
                            onClick={handleVerify2FA}
                            disabled={twoFactorCode.length !== 6 || isVerifying2FA}
                            className="w-full gradient-orange text-black"
                          >
                            {isVerifying2FA ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                <span>Verifying...</span>
                              </div>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Verify & Enable 2FA
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Disable 2FA */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Disable Two-Factor Authentication</h3>
                        <button 
                          onClick={() => {
                            setShowDisable2FA(false);
                            setDisable2FACode('');
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-yellow-400 text-sm">
                          <strong>Warning:</strong> Disabling 2FA will make your account less secure. You'll only need your password to sign in.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Enter your 2FA code to confirm</Label>
                        <Input
                          type="text"
                          placeholder="000000"
                          value={disable2FACode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setDisable2FACode(value);
                          }}
                          className="bg-gray-800 border-gray-700 text-white text-center text-2xl tracking-[0.5em] font-mono"
                          maxLength={6}
                        />
                      </div>

                      <div className="flex space-x-3">
                        <Button 
                          onClick={handleDisable2FA}
                          disabled={disable2FACode.length !== 6 || isVerifying2FA}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          {isVerifying2FA ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Disabling...</span>
                            </div>
                          ) : (
                            'Disable 2FA'
                          )}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setShowDisable2FA(false);
                            setDisable2FACode('');
                          }}
                          className="border-gray-700 text-gray-300 hover:bg-gray-800"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            {/* Danger Zone */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <Card className="relative bg-gray-900 border-red-600/20 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-red-500 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Danger Zone</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Irreversible actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!showDeleteConfirm ? (
                    <Button 
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="outline" 
                      className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">
                          <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Type DELETE to confirm</Label>
                        <Input
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="DELETE"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <Button 
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmText !== 'DELETE'}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Confirm Delete
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText('');
                          }}
                          className="border-gray-700 text-gray-300 hover:bg-gray-800"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
