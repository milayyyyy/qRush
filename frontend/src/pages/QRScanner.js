import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  ArrowLeft,
  AlertTriangle,
  User,
  Clock,
  Ticket
} from 'lucide-react';
import { toast } from 'sonner';

const QRScanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [lastScanResult, setLastScanResult] = useState(null);

  // Mock QR code scanning simulation
  const simulateQRScan = () => {
    const mockTickets = [
      {
        ticketNumber: "TC2024-001234",
        attendeeName: "John Smith",
        email: "john@example.com",
        eventTitle: "Tech Conference 2024",
        status: "valid",
        gate: "Main Entrance",
        seat: "A-15"
      },
      {
        ticketNumber: "TC2024-002345",
        attendeeName: "Sarah Johnson",
        email: "sarah@example.com",
        eventTitle: "Tech Conference 2024",
        status: "valid",
        gate: "Main Entrance",
        seat: "B-22"
      },
      {
        ticketNumber: "TC2024-003456",
        attendeeName: "Mike Wilson",
        email: "mike@example.com",
        eventTitle: "Tech Conference 2024",
        status: "duplicate",
        gate: "Side Entrance",
        seat: "C-08",
        lastScanned: new Date(Date.now() - 1800000)
      },
      {
        ticketNumber: "INVALID-001",
        status: "invalid"
      }
    ];

    // Simulate scanning delay
    setTimeout(() => {
      const randomTicket = mockTickets[Math.floor(Math.random() * mockTickets.length)];
      setScannedData(randomTicket);
      setLastScanResult(randomTicket);
      setIsScanning(false);

      // Show toast notification
      if (randomTicket.status === 'valid') {
        toast.success(`Welcome ${randomTicket.attendeeName}! Ticket verified successfully.`);
      } else if (randomTicket.status === 'duplicate') {
        toast.error(`Duplicate scan detected for ${randomTicket.attendeeName}`);
      } else {
        toast.error('Invalid ticket detected');
      }
    }, 2000);
  };

  const startScanning = () => {
    setIsScanning(true);
    setScannedData(null);
    simulateQRScan();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-700 border-green-200';
      case 'duplicate': return 'bg-red-100 text-red-700 border-red-200';
      case 'invalid': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'duplicate': return <XCircle className="w-6 h-6 text-red-600" />;
      case 'invalid': return <AlertTriangle className="w-6 h-6 text-gray-600" />;
      default: return <AlertTriangle className="w-6 h-6 text-gray-600" />;
    }
  };

  const formatTime = (date) => {
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">QR Scanner</h1>
          <div></div>
        </div>

        {/* Scanner Interface */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {!isScanning ? (
              <div className="text-center space-y-6">
                <div className="w-32 h-32 gradient-orange rounded-full flex items-center justify-center mx-auto">
                  <QrCode className="w-16 h-16 text-white" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Ready to Scan
                  </h2>
                  <p className="text-gray-600">
                    Position the QR code within the camera frame to scan tickets
                  </p>
                </div>

                <Button
                  onClick={startScanning}
                  className="gradient-orange text-white text-lg px-8 py-4 h-auto"
                >
                  <Camera className="w-6 h-6 mr-3" />
                  Start Camera
                </Button>

                <div className="text-sm text-gray-500">
                  <p>Logged in as: <strong>{user.name}</strong></p>
                  <p>Gate: Main Entrance</p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Camera className="w-16 h-16 text-gray-400" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Scanning...
                  </h2>
                  <p className="text-gray-600">
                    Point your camera at the QR code
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>

                <Button
                  onClick={() => setIsScanning(false)}
                  variant="outline"
                >
                  Cancel Scan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scan Result */}
        {scannedData && (
          <Card className={`border-2 ${getStatusColor(scannedData.status)}`}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(scannedData.status)}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {scannedData.status === 'valid' ? 'Valid Ticket' : 
                       scannedData.status === 'duplicate' ? 'Duplicate Scan' : 
                       'Invalid Ticket'}
                    </h3>
                    <Badge className={getStatusColor(scannedData.status)}>
                      {scannedData.status.toUpperCase()}
                    </Badge>
                  </div>

                  {scannedData.status !== 'invalid' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Attendee</p>
                          <p className="font-semibold text-gray-900 flex items-center">
                            <User className="w-4 h-4 mr-2 text-orange-500" />
                            {scannedData.attendeeName}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600">Ticket Number</p>
                          <p className="font-mono font-semibold text-gray-900">
                            {scannedData.ticketNumber}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600">Event</p>
                          <p className="font-semibold text-gray-900">
                            {scannedData.eventTitle}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600">Seat</p>
                          <p className="font-semibold text-gray-900">
                            {scannedData.seat}
                          </p>
                        </div>
                      </div>

                      {scannedData.status === 'duplicate' && scannedData.lastScanned && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-red-700">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-semibold">Already scanned</span>
                          </div>
                          <p className="text-sm text-red-600 mt-1">
                            Last scanned: {formatTime(scannedData.lastScanned)}
                          </p>
                        </div>
                      )}

                      {scannedData.status === 'valid' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-semibold">Access Granted</span>
                          </div>
                          <p className="text-sm text-green-600 mt-1">
                            Welcome to the event! Enjoy your experience.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {scannedData.status === 'invalid' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-semibold">Invalid Ticket</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        This ticket could not be verified. Please check with event staff.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <Button
                  onClick={startScanning}
                  className="gradient-orange text-white flex-1"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan Next Ticket
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!scannedData && !isScanning && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Scanning Instructions
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Ask attendees to have their QR codes ready on their mobile devices</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Ensure good lighting for optimal scanning</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Hold the device steady and center the QR code in the frame</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>For invalid tickets, direct attendees to the help desk</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
