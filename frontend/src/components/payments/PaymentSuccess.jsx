import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, Download, Mail, ArrowRight, Loader } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sessionId = searchParams.get('session_id');
  const baseURL = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus();
    } else {
      setError('Session ID nuk u gjet');
      setLoading(false);
    }
  }, [sessionId]);

  const checkPaymentStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/payments/status/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentStatus(data);
        
        // Continue polling if payment is not completed
        if (data.status !== 'completed') {
          setTimeout(checkPaymentStatus, 2000);
        }
      } else {
        setError('Gabim në kontrollimin e statusit të pagesës');
      }
    } catch (err) {
      setError('Gabim në kontrollimin e statusit të pagesës');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    // Would implement invoice download
    alert('Fatura do të dërgohet në email');
  };

  const handleGoToDashboard = () => {
    navigate('/client-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Duke kontrolluar pagesën...</h2>
            <p className="text-gray-600">Ju lutemi prisni ndërsa konfirmojmë pagesën tuaj</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-800">Gabim</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/payments')} className="btn-primary">
              Kthehu te Pagesat
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-2">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            Pagesa u Kompletua me Sukses!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          {paymentStatus && (
            <div className="space-y-6">
              {/* Payment Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Detajet e Pagesës</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Produkti</p>
                    <p className="font-semibold">{paymentStatus.package_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Shuma</p>
                    <p className="font-semibold">€{paymentStatus.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Data</p>
                    <p className="font-semibold">
                      {paymentStatus.paid_at 
                        ? new Date(paymentStatus.paid_at).toLocaleDateString('sq-AL')
                        : 'Tani'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Numri i Faturës</p>
                    <p className="font-semibold">{paymentStatus.invoice_number || 'Duke procesuar...'}</p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-blue-800 mb-4">Hapat e Ardhshëm</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Akses i Menjëhershëm</p>
                      <p className="text-sm text-gray-600">
                        Tani keni akses të plotë në kursin tuaj. Shkoni te dashboard për të filluar.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Konfirmim Email</p>
                      <p className="text-sm text-gray-600">
                        Do të merrni një email konfirmimi me detajet e pagesës dhe instruksionet.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Mbështetje e Plotë</p>
                      <p className="text-sm text-gray-600">
                        Ekipi ynë i mbështetjes është i disponueshëm 24/7 për të ju ndihmuar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleGoToDashboard}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <span>Shko te Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleDownloadInvoice}
                  variant="outline"
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Shkarko Faturën</span>
                </Button>
              </div>

              {/* Support Info */}
              <div className="text-center pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Keni pyetje? Jemi këtu për t'ju ndihmuar!
                </p>
                <Button variant="ghost" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Kontakto Mbështetjen
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;