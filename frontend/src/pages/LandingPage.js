import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import NoiseFlowBackground from '../components/NoiseFlowBackground';
import { 
  QrCode, 
  Shield, 
  BarChart3, 
  Clock, 
  Users, 
  Ticket,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Zap
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: QrCode,
      title: "QR Code Ticketing",
      description: "Generate unique, secure QR codes for every ticket. Fast scanning at events."
    },
    {
      icon: Shield,
      title: "Fraud Prevention",
      description: "Eliminate ticket duplication and fraud with our secure digital system."
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Monitor crowd flow, ticket sales, and generate detailed event reports."
    },
    {
      icon: Clock,
      title: "Instant Processing",
      description: "Reduce waiting times with lightning-fast QR code scanning at entry points."
    }
  ];

  const userTypes = [
    {
      icon: Users,
      title: "Event Organizers",
      description: "Create events, manage tickets, and track attendance with powerful analytics.",
      link: "/auth"
    },
    {
      icon: Ticket,
      title: "Attendees",
      description: "Browse events, purchase tickets, and access them instantly on your phone.",
      link: "/auth"
    },
    {
      icon: Smartphone,
      title: "Event Staff",
      description: "Scan QR codes quickly and efficiently to manage event entry.",
      link: "/auth"
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black scroll-mt-16">
        {/* Noise Flow Background */}
        <NoiseFlowBackground />
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12 lg:pt-16 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-6xl lg:text-8xl font-black text-white leading-tight">
                  QR Code
                  <span className="block text-5xl lg:text-6xl">
                    <span className="bg-orange-600 text-black px-8 py-3 inline-block w-full text-center">
                      Revolution
                    </span>
                  </span>
                </h1>
                <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
                  Transform your event experience with secure, instant QR code ticketing. 
                  Eliminate fraud, reduce wait times, and gain valuable insights.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button className="btn-primary text-lg px-8 py-4 h-auto">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/events">
                  <Button variant="outline" className="btn-secondary text-lg px-8 py-4 h-auto">
                    Browse Events
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-orange-600/30">
                <img 
                  src="/qr-hero.jpg"
                  alt="QR Code on Smartphone"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-6 -right-6 bg-gray-900 p-4 rounded-2xl shadow-xl border border-orange-600/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-600/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Secure</p>
                    <p className="text-sm text-gray-400">100% Fraud-Free</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-gray-900 p-4 rounded-2xl shadow-xl border border-orange-600/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-600/20 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Instant</p>
                    <p className="text-sm text-gray-400">Lightning Fast</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="why-qrush" className="py-20 bg-gray-900 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-white">
              Why Choose QRush?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our comprehensive ticketing solution provides everything you need for successful events.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 text-center 
                  hover:bg-black/40 hover:backdrop-blur-md hover:scale-105
                  transition-all duration-300 ease-out cursor-pointer
                  before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-b before:from-orange-500/30 before:to-orange-600/10 before:-z-10
                  before:blur-[2px] hover:before:blur-[4px] hover:before:from-orange-500/60 hover:before:to-orange-600/30
                  after:absolute after:inset-0 after:rounded-2xl after:bg-black/80 after:-z-10
                  shadow-lg shadow-orange-600/5 hover:shadow-xl hover:shadow-orange-600/20"
              >
                <div className="w-16 h-16 gradient-orange rounded-2xl flex items-center justify-center mx-auto mb-4 
                  group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-orange-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section id="built-for-everyone" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-white">
              Built for Everyone
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Whether you're organizing events, attending them, or managing entry, QRush has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {userTypes.map((type, index) => (
              <div 
                key={index}
                className="group relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 text-center 
                  hover:bg-gray-900/40 hover:backdrop-blur-md hover:scale-105
                  transition-all duration-300 ease-out cursor-pointer
                  before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-b before:from-orange-500/30 before:to-orange-600/10 before:-z-10
                  before:blur-[2px] hover:before:blur-[4px] hover:before:from-orange-500/60 hover:before:to-orange-600/30
                  after:absolute after:inset-0 after:rounded-2xl after:bg-gray-900/80 after:-z-10
                  shadow-lg shadow-orange-600/5 hover:shadow-xl hover:shadow-orange-600/20"
              >
                <div className="w-20 h-20 bg-orange-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6
                  group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <type.icon className="w-10 h-10 text-orange-500" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-orange-400 transition-colors duration-300">
                  {type.title}
                </h3>
                <p className="text-gray-400 leading-relaxed mb-6 group-hover:text-gray-300 transition-colors duration-300">
                  {type.description}
                </p>
                <Link to={type.link}>
                  <Button className="gradient-orange text-black hover:opacity-90 group-hover:scale-105 transition-transform duration-300">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12 border-t border-orange-600/20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 gradient-orange rounded-lg flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-black" />
                </div>
                <span className="text-2xl font-bold">
                  Q<span className="text-orange-500">Rush</span>
                </span>
              </div>
              <p className="text-gray-400">
                Revolutionizing event ticketing with secure QR code technology.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/" className="block text-gray-400 hover:text-orange-500 transition-colors">Home</Link>
                <Link to="/events" className="block text-gray-400 hover:text-orange-500 transition-colors">Events</Link>
                <Link to="/auth" className="block text-gray-400 hover:text-orange-500 transition-colors">Sign Up</Link>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Features</h3>
              <div className="space-y-2">
                <p className="text-gray-400">QR Code Generation</p>
                <p className="text-gray-400">Analytics Dashboard</p>
                <p className="text-gray-400">Fraud Prevention</p>
                <p className="text-gray-400">Real-time Tracking</p>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <p>support@qrush.com</p>
                <p>+63-969-367-8827</p>
                <p>Available 24/7</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 QRush. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;