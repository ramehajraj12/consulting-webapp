import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { 
  User,
  FileText,
  Calendar,
  Clock,
  Download,
  MessageCircle,
  Bell,
  Settings,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Upload,
  Send,
  X,
  File,
  Paperclip
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ClientPortalPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Document upload state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [documents, setDocuments] = useState([]);
  
  // Chat state
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Support ticket state
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [supportTickets, setSupportTickets] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashboardRes, projectsRes, consultationsRes] = await Promise.all([
        api.get('/dashboard/client'),
        api.get('/projects'),
        api.get('/consultations')
      ]);

      setDashboardData(dashboardRes.data);
      setProjects(projectsRes.data);
      setConsultations(consultationsRes.data);
      setNotifications(dashboardRes.data.notifications || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('sq-AL');
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-2 mb-2">Mirë se erdhët, {user?.name}</h1>
              <p className="body-medium text-gray-600">
                Menaxhoni projektet tuaja dhe ndiqni progresin në një vend.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Cilësimet
              </Button>
              <Button className="btn-primary">
                <Upload className="h-4 w-4 mr-2" />
                Ngarko Dokument
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="projects">Projektet</TabsTrigger>
              <TabsTrigger value="consultations">Konsultime</TabsTrigger>
              <TabsTrigger value="notifications">Njoftimet</TabsTrigger>
              <TabsTrigger value="support">Mbështetje</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="body-small text-gray-600">Projekte Totale</p>
                        <p className="heading-3">{dashboardData?.stats?.total_projects || 0}</p>
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
              </div>

              {/* Recent Projects */}
              <Card>
                <CardHeader>
                  <CardTitle className="heading-4">Projektet e Fundit</CardTitle>
                  <CardDescription>Aktiviteti i fundit në projektet tuaja</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.recent_projects?.length > 0 ? (
                      dashboardData.recent_projects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{project.title}</h4>
                            <p className="body-small text-gray-600">{project.consultant_name}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge className={getStatusColor(project.status)}>
                              {getStatusText(project.status)}
                            </Badge>
                            <Progress value={project.progress} className="w-24" />
                            <span className="body-small text-gray-600">{project.progress}%</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="body-medium text-gray-600">Nuk keni projekte aktualisht</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <Card key={project.id} className="hover-scale cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="heading-4">{project.title}</CardTitle>
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusText(project.status)}
                        </Badge>
                      </div>
                      <CardDescription>{project.consultant_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="body-small text-gray-600">Progresi</span>
                            <span className="body-small text-gray-600">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="body-small text-gray-600">
                              Afati: {project.deadline ? formatDate(project.deadline) : 'Pa afat'}
                            </span>
                          </div>
                          <Badge variant="outline">{project.type}</Badge>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" className="flex-1">
                            <FileText className="h-4 w-4 mr-2" />
                            Detaje
                          </Button>
                          <Button className="flex-1 btn-primary">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Kontakt
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {projects.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="body-medium text-gray-600">Nuk keni projekte aktualisht</p>
                </div>
              )}
            </TabsContent>

            {/* Consultations Tab */}
            <TabsContent value="consultations" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {consultations.map((consultation) => (
                  <Card key={consultation.id} className="hover-scale">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="heading-4">{consultation.service_title}</CardTitle>
                        <Badge className={getStatusColor(consultation.status)}>
                          {getStatusText(consultation.status)}
                        </Badge>
                      </div>
                      <CardDescription>{consultation.consultant_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="body-small text-gray-600">
                              {formatDate(consultation.date)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="body-small text-gray-600">
                              {consultation.duration} min
                            </span>
                          </div>
                        </div>
                        
                        {consultation.notes && (
                          <p className="body-small text-gray-600 italic">
                            "{consultation.notes}"
                          </p>
                        )}
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" className="flex-1">
                            Detaje
                          </Button>
                          {consultation.status === 'confirmed' && (
                            <Button className="flex-1 btn-primary">
                              Bashkohu
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {consultations.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="body-medium text-gray-600">Nuk keni konsultime të rezervuara</p>
                </div>
              )}
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="heading-4">Njoftimet</CardTitle>
                  <CardDescription>Të gjitha njoftimet e fundit</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-4 rounded-lg border ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <p className="body-medium">{notification.message}</p>
                            <p className="body-small text-gray-500 mt-1">{notification.time_ago}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {notifications.length === 0 && (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="body-medium text-gray-600">Nuk keni njoftime të reja</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Support Tab */}
            <TabsContent value="support" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="heading-4">Kontakt i Shpejtë</CardTitle>
                    <CardDescription>Kontaktoni me ekspertët tanë</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button className="w-full btn-primary">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Fillo Chat
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Rezervo Konsultim
                      </Button>
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Hap Ticket
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="heading-4">Burimet</CardTitle>
                    <CardDescription>Materiale të dobishme</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="ghost" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Udhëzues SPSS
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        FAQ
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Profili im
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default ClientPortalPage;