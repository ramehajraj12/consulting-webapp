import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { BarChart3, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <BarChart3 className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="heading-2 text-gray-900">
            Mirë se erdhët në SPSS Academy
          </h2>
          <p className="body-medium text-gray-600 mt-2">
            Identifikohuni për të aksesuar llogarinë tuaj
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="heading-4">Identifikimi</CardTitle>
            <CardDescription>
              Shkruani kredencialet tuaja për të hyrë
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Fjalëkalimi</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Shkruani fjalëkalimin tuaj"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={loading}
              >
                {loading ? 'Po identifikohet...' : 'Identifikohu'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="body-small text-gray-600">
                Nuk keni llogari?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-500">
                  Regjistrohuni këtu
                </Link>
              </p>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="body-small text-gray-600 mb-2">Demo accounts:</p>
              <div className="space-y-1">
                <p className="body-small text-gray-500">
                  <strong>Client:</strong> fatmir.leshi@qsut.al / password123
                </p>
                <p className="body-small text-gray-500">
                  <strong>Consultant:</strong> alba.hasani@spssacademy.al / password123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;