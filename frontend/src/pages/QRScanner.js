/* global globalThis */
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../services/api';

const QRScanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [barcodeSupported, setBarcodeSupported] = useState(
    () => typeof globalThis !== 'undefined' && 'BarcodeDetector' in globalThis
  );
  const [scannerMessage, setScannerMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const lastScannedCodeRef = useRef(null);

  useEffect(() => {
    if (typeof globalThis !== 'undefined') {
      setBarcodeSupported('BarcodeDetector' in globalThis);
    }
  }, []);

  useEffect(() => {
    if (!barcodeSupported) {
      setScannerMessage('Automatic QR detection is not supported in this browser. Use manual verification if needed.');
    }
  }, [barcodeSupported]);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    setIsProcessing(false);
    if (barcodeSupported) {
      setScannerMessage('');
    }
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    lastScannedCodeRef.current = null;
  }, [barcodeSupported]);

  useEffect(() => () => {
    stopScanning();
  }, [stopScanning]);

  const handleDetectedCode = useCallback(async (code) => {
    if (!code || isProcessing || code === lastScannedCodeRef.current) {
      return;
    }

    lastScannedCodeRef.current = code;
    setIsProcessing(true);
    setScannerMessage('');

    try {
      const response = await apiService.scanTicket({
        qrCode: code,
        staffUserId: user?.id ?? null,
        gate: 'Main Gate'
      });

      const normalized = {
        ...response,
        scannedAt: response?.scannedAt ? new Date(response.scannedAt) : null,
        previousScanAt: response?.previousScanAt ? new Date(response.previousScanAt) : null
      };

      setScannedData(normalized);
      sessionStorage.setItem('qrush:pending-dashboard-refresh', 'true');

      const status = (response?.status || '').toLowerCase();
      if (status === 'valid') {
        toast.success(response?.message || 'Ticket verified successfully.');
      } else if (status === 'duplicate') {
        toast.warning(response?.message || 'Duplicate scan detected.');
      } else {
        toast.error(response?.message || 'Invalid ticket detected.');
      }
    } catch (error) {
      console.error('Ticket scan failed', error);
      setScannerMessage('Unable to validate ticket. Please try again.');
      toast.error('Unable to validate ticket. Please try again.');
    } finally {
      setIsProcessing(false);
      stopScanning();
    }
  }, [isProcessing, stopScanning, user?.id]);

  const startScanning = useCallback(async () => {
    const nav = globalThis?.navigator;
    const mediaDevices = nav?.mediaDevices;
    const getUserMedia = mediaDevices?.getUserMedia;
    if (typeof getUserMedia !== 'function') {
      setCameraError('Camera access is not supported on this device.');
      return;
    }

    try {
      setCameraError(null);
      setScannerMessage('');
      setScannedData(null);
      setIsProcessing(false);
      lastScannedCodeRef.current = null;

      const stream = await mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsScanning(true);
      if (!barcodeSupported) {
        setScannerMessage('Camera ready. This browser does not support automatic QR detection.');
      }
    } catch (error) {
      console.error('Unable to access camera', error);
      setCameraError('Unable to access the camera. Please check permissions and try again.');
      stopScanning();
    }
  }, [barcodeSupported, stopScanning]);

  useEffect(() => {
    if (!isScanning || !barcodeSupported) {
      return;
    }

    let cancelled = false;
    const detector = new globalThis.BarcodeDetector({ formats: ['qr_code'] });

    const detect = async () => {
      if (cancelled) {
        return;
      }

      if (!videoRef.current || videoRef.current.readyState < 2) {
        frameRef.current = requestAnimationFrame(detect);
        return;
      }

      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue || barcodes[0].displayValue;
          await handleDetectedCode(code);
          return;
        }
      } catch (error) {
        console.error('Barcode detection failed', error);
        setScannerMessage('Scanning error. Please steady the camera and try again.');
      }

      frameRef.current = requestAnimationFrame(detect);
    };

    frameRef.current = requestAnimationFrame(detect);

    return () => {
      cancelled = true;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [barcodeSupported, handleDetectedCode, isScanning]);

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

  const getStatusTitle = (status) => {
    switch (status) {
      case 'valid':
        return 'Valid Ticket';
      case 'duplicate':
        return 'Duplicate Scan';
      default:
        return 'Invalid Ticket';
    }
  };

  const formatTime = (value) => {
    if (!value) {
      return '--:--';
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '--:--';
    }
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    });
  };

  const scannedStatus = scannedData ? (scannedData.status || 'invalid').toLowerCase() : null;
  const scannedGate = scannedData?.gate || 'Main Gate';
  const scannedAtLabel = scannedData ? formatTime(scannedData.scannedAt) : null;
  const previousScanLabel = scannedData ? formatTime(scannedData.previousScanAt) : null;

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
            {isScanning ? (
              <div className="space-y-6">
                <div className="max-w-md mx-auto w-full">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black shadow-inner">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      autoPlay
                    />
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center space-y-2 text-white">
                        <Camera className="w-10 h-10 animate-pulse" />
                        <span className="text-sm">Processing scan...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-900">Align QR Code</h2>
                  <p className="text-gray-600">Hold the QR code steady within the frame.</p>
                  {scannerMessage && (
                    <p className="text-sm text-gray-500">{scannerMessage}</p>
                  )}
                  {!barcodeSupported && (
                    <p className="text-sm text-orange-600">
                      Automatic detection is not supported in this browser. Use manual check if needed.
                    </p>
                  )}
                </div>

                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={stopScanning}>
                    Stop Camera
                  </Button>
                </div>
              </div>
            ) : (
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

                {cameraError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}

                <Button
                  onClick={startScanning}
                  className="gradient-orange text-white text-lg px-8 py-4 h-auto"
                  disabled={isProcessing}
                >
                  <Camera className="w-6 h-6 mr-3" />
                  Start Camera
                </Button>

                <div className="text-sm text-gray-500 space-y-1">
                  <p>Logged in as: <strong>{user.name}</strong></p>
                  <p>Gate: Main Entrance</p>
                  {scannerMessage && (
                    <p className="text-xs text-gray-500">{scannerMessage}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scan Result */}
        {scannedData && (
          <Card className={`border-2 ${getStatusColor(scannedStatus || 'invalid')}`}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(scannedStatus || 'invalid')}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {getStatusTitle(scannedStatus || 'invalid')}
                    </h3>
                    <Badge className={getStatusColor(scannedStatus || 'invalid')}>
                      {(scannedStatus || 'invalid').toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600">{scannedData.message}</p>

                  {scannedStatus !== 'invalid' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Attendee</p>
                          <p className="font-semibold text-gray-900 flex items-center">
                            <User className="w-4 h-4 mr-2 text-orange-500" />
                            {scannedData.attendeeName || 'Guest'}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900 break-words">
                            {scannedData.attendeeEmail || '—'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600">Ticket Number</p>
                          <p className="font-mono font-semibold text-gray-900">
                            {scannedData.ticketNumber || '—'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600">Event</p>
                          <p className="font-semibold text-gray-900">
                            {scannedData.eventTitle || 'Event TBD'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600">Gate</p>
                          <p className="font-semibold text-gray-900">
                            {scannedGate}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-600">Scanned At</p>
                          <p className="font-semibold text-gray-900">
                            {scannedAtLabel}
                          </p>
                        </div>
                      </div>

                      {scannedStatus === 'duplicate' && previousScanLabel !== '--:--' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-red-700">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-semibold">Already scanned</span>
                          </div>
                          <p className="text-sm text-red-600 mt-1">
                            Last scanned: {previousScanLabel}
                          </p>
                          {typeof scannedData.reEntryCount === 'number' && (
                            <p className="text-xs text-red-500 mt-1">
                              Re-entry attempts: {Math.max(scannedData.reEntryCount, 1)}
                            </p>
                          )}
                        </div>
                      )}

                      {scannedStatus === 'valid' && (
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

                  {scannedStatus === 'invalid' && (
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
