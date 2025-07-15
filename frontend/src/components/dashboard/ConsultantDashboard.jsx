import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  BarChart3, 
  CheckCircle, 
  Clock, 
  FileText, 
  MessageCircle, 
  Calendar,
  Bell,
  Plus,
  ArrowRight,
  Euro,
  Users,
  TrendingUp,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ConsultantDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/consultant');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Duke ngarkuar dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Përfunduar';
      case 'in-progress':
        return 'Në progres';
      case 'pending':
        return 'Në pritje';
      default:
        return status;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-2 text-gray-900">
                Mirë se erdhët, {user?.name}
              </h1>
              <p className="body-medium text-gray-600">
                Menaxhoni klientët tuaj dhe projektet
              </p>
            </div>
            <div className="flex space-x-4">
              <Link to="/training-management">
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Menaxho Trajnimet
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Shto Shërbim
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="body-small text-gray-600">Projekte Totale</p>
                    <p className="heading-3 text-blue-600">{dashboardData?.stats?.total_projects || 0}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="body-small text-gray-600">Projekte Aktive</p>
                    <p className="heading-3 text-green-600">{dashboardData?.stats?.active_projects || 0}</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="body-small text-gray-600">Projekte të Përfunduara</p>
                    <p className="heading-3 text-emerald-600">{dashboardData?.stats?.completed_projects || 0}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="body-small text-gray-600">Konsultime</p>
                    <p className="heading-3 text-purple-600">{dashboardData?.stats?.consultations || 0}</p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="body-small text-gray-600">Të Ardhura</p>
                    <p className="heading-3 text-green-600">€{dashboardData?.stats?.earnings || 0}</p>
                  </div>
                  <Euro className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Projects */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="heading-4">Projektet e Fundit</CardTitle>
                    <Link to="/projects">
                      <Button variant="outline" size="sm">
                        Shiko të gjitha
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                  <CardDescription>
                    Projektet tuaja më të fundit dhe statusi i tyre
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData?.recent_projects?.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.recent_projects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{project.title}</h4>
                            <p className="body-small text-gray-600">{project.client_name}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={getStatusColor(project.status)}>
                                {getStatusText(project.status)}
                              </Badge>
                              <span className="body-small text-gray-500">{project.type}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-32 mb-2">
                              <Progress value={project.progress} />
                            </div>
                            <span className="body-small text-gray-600">{project.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="body-medium text-gray-600">Nuk keni projekte aktualisht</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pending Consultations */}
              <Card>
                <CardHeader>
                  <CardTitle className="heading-4">Kërkesa të Reja</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData?.pending_consultations?.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.pending_consultations.map((consultation) => (
                        <div key={consultation.id} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="body-small font-medium">{consultation.service_title}</p>
                            <p className="body-small text-gray-600">{consultation.client_name}</p>
                            <p className="body-small text-gray-500">
                              {new Date(consultation.date).toLocaleDateString('sq-AL')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="body-small text-gray-600">Nuk keni kërkesa të reja</p>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Consultations */}
              <Card>
                <CardHeader>
                  <CardTitle className="heading-4">Konsultime të Ardhshme</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData?.upcoming_consultations?.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.upcoming_consultations.map((consultation) => (
                        <div key={consultation.id} className="flex items-start space-x-3">
                          <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="body-small font-medium">{consultation.service_title}</p>
                            <p className="body-small text-gray-600">{consultation.client_name}</p>
                            <p className="body-small text-gray-500">
                              {new Date(consultation.date).toLocaleDateString('sq-AL')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="body-small text-gray-600">Nuk keni konsultime të programuara</p>
                  )}
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="heading-4">Njoftimet e Fundit</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData?.notifications?.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.notifications.map((notification) => (
                        <div key={notification.id} className={`p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                          <div className="flex items-start space-x-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1">
                              <p className="body-small font-medium">{notification.message}</p>
                              <p className="body-small text-gray-500">{notification.time_ago}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="body-small text-gray-600">Nuk keni njoftime të reja</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultantDashboard;