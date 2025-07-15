import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Euro,
  Star,
  Shield,
  Zap,
  Award,
  Users,
  BookOpen,
  MessageCircle,
  BarChart3,
  Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PaymentDashboard = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const baseURL = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchPackages();
    fetchPaymentHistory();
  }, []);

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/payments/packages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      } else {
        // Mock packages for demo
        setPackages([
          {
            id: 'spss_basic',
            name: 'SPSS për Fillestarë',
            description: 'Kurs bazë i SPSS për fillestarë me certifikim',
            price: 99.0,
            currency: 'EUR',
            duration_days: 60,
            features: [
              '20 orë video tutorial',
              'Materialet e kursit',
              'Certifikim profesional',
              'Suport 24/7',
              'Akses i përhershëm'
            ],
            popular: false,
            category: 'course'
          },
          {
            id: 'spss_advanced',
            name: 'SPSS i Avancuar',
            description: 'Kurs i avancuar me analiza komplekse dhe regressions',
            price: 199.0,
            currency: 'EUR',
            duration_days: 90,
            features: [
              '40 orë video tutorial',
              'Analiza të avancuara',
              'Regressions dhe modeling',
              'Certifikim profesional',
              'Konsultim personal',
              'Akses i përhershëm'
            ],
            popular: true,
            category: 'course'
          },
          {
            id: 'consultation_1hour',
            name: 'Konsultim 1 Orë',
            description: 'Konsultim personal 1 orë me ekspert',
            price: 49.0,
            currency: 'EUR',
            duration_days: 30,
            features: [
              '1 orë konsultim live',
              'Analizë personale',
              'Rekomandime specifike',
              'Raport i detajuar',
              'Follow-up email'
            ],
            popular: false,
            category: 'consultation'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/payments/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentHistory(data);
      } else {
        // Mock history
        setPaymentHistory([
          {
            id: '1',
            package_name: 'SPSS për Fillestarë',
            amount: 99.0,
            currency: 'EUR',
            payment_status: 'completed',
            created_at: '2024-01-15T10:30:00Z',
            invoice_number: 'INV-20240115-ABC123'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const handlePurchase = async (packageId) => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          package_id: packageId,
          origin_url: window.location.origin,
          metadata: {
            source: 'dashboard'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe checkout
        window.location.href = data.checkout_url;
      } else {
        alert('Gabim në krijimin e sesionit të pagesës');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Gabim në procesimin e pagesës');
    } finally {
      setProcessing(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'course':
        return <BookOpen className="h-6 w-6 text-blue-600" />;
      case 'consultation':
        return <MessageCircle className="h-6 w-6 text-green-600" />;
      case 'service':
        return <BarChart3 className="h-6 w-6 text-purple-600" />;
      default:
        return <Star className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Zgjidhni Planin Tuaj</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Investoni në arsimimin tuaj profesional me paketat tona të specializuara të SPSS dhe analizës statistikore
        </p>
      </div>

      {/* Payment History Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => setShowHistory(true)}
          className="flex items-center space-x-2"
        >
          <CreditCard className="h-4 w-4" />
          <span>Historia e Pagesave</span>
        </Button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <Card 
            key={pkg.id} 
            className={`relative hover:shadow-xl transition-all duration-300 ${
              pkg.popular ? 'ring-2 ring-blue-500 scale-105' : ''
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1">
                  <Star className="h-4 w-4 mr-1" />
                  Më i Popullarizuar
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                {getCategoryIcon(pkg.category)}
              </div>
              <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
              <p className="text-gray-600 text-sm">{pkg.description}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Price */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Euro className="h-8 w-8 text-green-600" />
                  <span className="text-4xl font-bold text-gray-800">{pkg.price}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {pkg.duration_days} ditë akses
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Çfarë përfshihet:</h4>
                <ul className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Purchase Button */}
              <Button
                onClick={() => handlePurchase(pkg.id)}
                disabled={processing}
                className={`w-full ${
                  pkg.popular 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'btn-primary'
                }`}
              >
                {processing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Duke procesuar...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Blini Tani</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security and Guarantee */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Shield className="h-12 w-12 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Pagesa e Sigurt</h3>
              <p className="text-sm text-gray-600">
                Të gjitha pagesat janë të enkriptuara dhe të sigurta me Stripe
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Zap className="h-12 w-12 text-yellow-600" />
              <h3 className="font-semibold text-gray-800">Akses i Menjëhershëm</h3>
              <p className="text-sm text-gray-600">
                Filloni menjëherë pas kompletimit të pagesës
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Award className="h-12 w-12 text-purple-600" />
              <h3 className="font-semibold text-gray-800">Certifikim Profesional</h3>
              <p className="text-sm text-gray-600">
                Merrni certifikim të vlefshëm për karrierën tuaj
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History Modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Historia e Pagesave</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {paymentHistory.length > 0 ? (
              <div className="space-y-3">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{payment.package_name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(payment.created_at)}
                      </p>
                      {payment.invoice_number && (
                        <p className="text-xs text-gray-500">
                          Fatura: {payment.invoice_number}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Euro className="h-4 w-4 text-green-600" />
                          <span className="font-semibold">{payment.amount}</span>
                        </div>
                        <Badge className={getStatusColor(payment.payment_status)}>
                          {payment.payment_status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nuk keni pagesa ende</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentDashboard;