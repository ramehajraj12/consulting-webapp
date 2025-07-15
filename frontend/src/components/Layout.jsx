import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { 
  Menu, 
  X, 
  BarChart3, 
  BookOpen, 
  MessageCircle, 
  FileText, 
  Users, 
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from 'lucide-react';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Ballina', icon: null },
    { path: '/services', label: 'Shërbimet', icon: null },
    { path: '/training', label: 'Trajnimet', icon: null },
    { path: '/consultation', label: 'Konsultime', icon: null },
    { path: '/blog', label: 'Blog', icon: null },
    { path: '/client-portal', label: 'Portali', icon: null },
    { path: '/contact', label: 'Kontakt', icon: null }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="heading-4 font-bold text-gray-900">
                SPSS Analytics
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${
                    isActive(item.path) ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/consultation">
                <Button className="btn-primary">
                  Rezervo Konsultim
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <nav className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block py-2 px-3 rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4">
                <Link to="/consultation">
                  <Button className="btn-primary w-full">
                    Rezervo Konsultim
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-400" />
                <span className="heading-4 font-bold">SPSS Analytics</span>
              </div>
              <p className="body-small text-gray-300">
                Platformë profesionale për konsulencë statistikore në SPSS dhe trajnime të specializuara.
              </p>
              <div className="flex space-x-4">
                <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Linkedin className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h3 className="heading-4 font-semibold">Shërbimet</h3>
              <ul className="space-y-2">
                <li><Link to="/services" className="body-small text-gray-300 hover:text-white">Analiza Statistikore</Link></li>
                <li><Link to="/services" className="body-small text-gray-300 hover:text-white">Konsulencë 1-në-1</Link></li>
                <li><Link to="/services" className="body-small text-gray-300 hover:text-white">Interpretim Rezultatesh</Link></li>
                <li><Link to="/services" className="body-small text-gray-300 hover:text-white">Projektim Studimi</Link></li>
              </ul>
            </div>

            {/* Training */}
            <div className="space-y-4">
              <h3 className="heading-4 font-semibold">Trajnimet</h3>
              <ul className="space-y-2">
                <li><Link to="/training" className="body-small text-gray-300 hover:text-white">SPSS për Fillestarë</Link></li>
                <li><Link to="/training" className="body-small text-gray-300 hover:text-white">Analiza të Avancuara</Link></li>
                <li><Link to="/training" className="body-small text-gray-300 hover:text-white">Kërkime Mjekësore</Link></li>
                <li><Link to="/training" className="body-small text-gray-300 hover:text-white">Certifikim Profesional</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="heading-4 font-semibold">Kontakt</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="body-small text-gray-300">+355 69 123 4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="body-small text-gray-300">info@spssanalytics.al</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="body-small text-gray-300">Tiranë, Shqipëri</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="body-small text-gray-400">
              © 2024 SPSS Analytics. Të gjitha të drejtat e rezervuara.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;