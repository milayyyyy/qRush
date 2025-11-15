import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { 
  QrCode,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Scan,
  AlertCircle,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [currentEvent, setCurrentEvent] = useState(null);
  const [scannedTickets, setScannedTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data for staff dashboard
    const mockCurrentEvent = {
      id: 1,
      title: "Tech Conference 2024",
      date: "2024-03-15",
      time: "09:00 AM - 06:00 PM",
      location: "San Francisco Convention Center",
      totalCapacity: 500,
      checkedIn: 267,
      pending: 120
    };

    const mockScannedTickets = [
      {
        id: 1,
        ticketNumber: "TC2024-001234",
        attendeeName: "John Smith",
        email: "john@example.com",
        scanTime: new Date(Date.now() - 3600000),
        status: "valid",
        gate: "Main Entrance"
      },
      {
        id: 2,
        ticketNumber: "TC2024-002345",
        attendeeName: "Sarah Johnson",
        email: "sarah@example.com",
        scanTime: new Date(Date.now() - 2700000),
        status: "valid",
        gate: "Main Entrance"
      },
      {
        id: 3,
        ticketNumber: "TC2024-003456",
        attendeeName: "Mike Wilson",
        email: "mike@example.com",
        scanTime: new Date(Date.now() - 1800000),
        status: "duplicate",
        gate: "Side Entrance"
      },
      {
        id: 4,
        ticketNumber: "TC2024-004567",
        attendeeName: "Emily Davis",
        email: "emily@example.com",
        scanTime: new Date(Date.now() - 900000),
        status: "valid",
        gate: "Main Entrance"
      }
    ];

    setCurrentEvent(mockCurrentEvent);
    setScannedTickets(mockScannedTickets);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-700';
      case 'duplicate': return 'bg-red-100 text-red-700';
      case 'expired': return 'bg-yellow-100 text-yellow-700';
      case 'invalid': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-4 h-4" />;
      case 'duplicate': return <XCircle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      case 'invalid': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredTickets = scannedTickets.filter(ticket =>
    ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.attendeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validScans = scannedTickets.filter(ticket => ticket.status === 'valid').length;
  const invalidScans = scannedTickets.filter(ticket => ticket.status !== 'valid').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Staff Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Welcome, {user.name}. Manage event entry and scan tickets.
            </p>
          </div>
          <Link to="/scan">
            <Button className="gradient-orange text-white mt-4 sm:mt-0">
              <Scan className="w-5 h-5 mr-2" />
              Open QR Scanner
            </Button>
          </Link>
        </div>

        {/* Current Event Info */}
        {currentEvent && (
          <Card className="mb-8 border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Current Event: {currentEvent.title}
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span>{currentEvent.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>{currentEvent.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span>{currentEvent.location}</span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  <Users className="w-3 h-3 mr-1" />
                  Active Event
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Capacity</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {currentEvent?.totalCapacity || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Checked In</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {currentEvent?.checkedIn || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Valid Scans</p>
                  <p className="text-3xl font-bold text-gray-900">{validScans}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Issues Found</p>
                  <p className="text-3xl font-bold text-gray-900">{invalidScans}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="scanner" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
            <TabsTrigger value="history">Scan History</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          {/* QR Scanner Tab */}
          <TabsContent value="scanner" className="space-y-6">
            <Card className="p-8 text-center">
              <CardContent>
                <div className="max-w-md mx-auto space-y-6">
                  <div className="w-32 h-32 gradient-orange rounded-full flex items-center justify-center mx-auto">
                    <QrCode className="w-16 h-16 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      QR Code Scanner Ready
                    </h3>
                    <p className="text-gray-600">
                      Click the button below to open the camera and start scanning QR codes
                    </p>
                  </div>

                  <Link to="/scan">
                    <Button className="gradient-orange text-white text-lg px-8 py-4 h-auto">
                      <Scan className="w-6 h-6 mr-3" />
                      Open Camera Scanner
                    </Button>
                  </Link>

                  <div className="text-sm text-gray-500">
                    <p>Make sure attendees have their QR codes ready for quick scanning</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">{validScans}</div>
                <div className="text-sm text-gray-600">Valid Scans Today</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-red-600 mb-2">{invalidScans}</div>
                <div className="text-sm text-gray-600">Issues Detected</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.round((validScans / (validScans + invalidScans || 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </Card>
            </div>
          </TabsContent>

          {/* Scan History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Recent Scans</h2>
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <Card key={ticket.id} className="hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                          <QrCode className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {ticket.attendeeName}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="font-mono">{ticket.ticketNumber}</span>
                            <span>•</span>
                            <span>{ticket.email}</span>
                            <span>•</span>
                            <span>{ticket.gate}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">
                          {formatTime(ticket.scanTime)}
                        </span>
                        <Badge className={`${getStatusColor(ticket.status)} flex items-center space-x-1`}>
                          {getStatusIcon(ticket.status)}
                          <span className="capitalize">{ticket.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTickets.length === 0 && (
              <div className="text-center py-16">
                <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No matching scans found' : 'No scans yet'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Start scanning QR codes to see the history here'
                  }
                </p>
              </div>
            )}
          </TabsContent>

          {/* Manual Entry Tab */}
          <TabsContent value="manual" className="space-y-6">
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Manual Ticket Verification</CardTitle>
                <p className="text-gray-600">
                  Enter ticket number manually if QR scanning is not available
                </p>
              </CardHeader>
              <CardContent className="px-0">
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ticket Number
                    </label>
                    <Input 
                      placeholder="e.g., TC2024-001234"
                      className="font-mono"
                    />
                  </div>
                  <Button className="gradient-orange text-white">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Bulk Check-in</CardTitle>
                <p className="text-gray-600">
                  Check in multiple attendees at once using a list
                </p>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-4">
                  <textarea 
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                    placeholder="Enter ticket numbers, one per line&#10;TC2024-001234&#10;TC2024-002345&#10;TC2024-003456"
                  />
                  <Button className="gradient-orange text-white">
                    <Users className="w-4 h-4 mr-2" />
                    Bulk Check-in
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StaffDashboard;