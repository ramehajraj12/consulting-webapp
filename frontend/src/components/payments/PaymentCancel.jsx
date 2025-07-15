import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { XCircle, ArrowLeft, RefreshCw, Mail } from 'lucide-react';

const PaymentCancel = () => {
  const navigate = useNavigate();

  const handleRetryPayment = () => {
    navigate('/payments');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleContactSupport = () => {
    // Would open support chat or email
    window.location.href = 'mailto:support@spssacademy.com';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-2">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            Pagesa u Anulua
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Message */}
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                Pagesa juaj u anulua dhe nuk u mbajt asnjë tarife. Mund të provoni përsëri ose të kontaktoni mbështetjen nëse keni probleme.
              </p>
            </div>

            {/* Why payments might be cancelled */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-800 mb-4">Arsyet e zakonshme të anulimit</h3>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-600">•</span>
                  <span>Keni mbyllur dritaren e pagesës para kompletimit</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-600">•</span>
                  <span>Keni klikuar butonin "Kthehu" në faqen e pagesës</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-600">•</span>
                  <span>Probleme me kartën e kreditit ose metodën e pagesës</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-600">•</span>
                  <span>Sesioni i pagesës ka skaduar</span>
                </li>
              </ul>
            </div>

            {/* What to do next */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 mb-4">Çfarë të bëni tash?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Provoni Përsëri</p>
                    <p className="text-sm text-gray-600">
                      Klikoni "Provo Përsëri" për të rifilluar procesin e pagesës
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Kontrolloni Metodën e Pagesës</p>
                    <p className="text-sm text-gray-600">
                      Sigurohuni që karta juaj është e vlefshme dhe ka fonde të mjaftueshme
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Kërkoni Ndihmë</p>
                    <p className="text-sm text-gray-600">
                      Nëse problemi vazhdon, kontaktoni mbështetjen tonë
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleRetryPayment}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Provo Përsëri</span>
              </Button>
              <Button 
                onClick={handleGoBack}
                variant="outline"
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kthehu</span>
              </Button>
            </div>

            {/* Support Info */}
            <div className="text-center pt-6 border-t">
              <p className="text-sm text-gray-600 mb-2">
                Keni nevojë për ndihmë me pagesën?
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleContactSupport}
              >
                <Mail className="h-4 w-4 mr-2" />
                Kontakto Mbështetjen
              </Button>
            </div>

            {/* Security Notice */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-600">
                🔒 Të gjitha pagesat janë të sigurta dhe të enkriptuara. Nuk ruajmë informacionin e kartës tuaj.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancel;