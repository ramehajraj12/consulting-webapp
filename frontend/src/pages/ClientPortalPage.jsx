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
      
      // Fetch documents, chat messages, and support tickets
      await fetchDocuments();
      await fetchChatMessages();
      await fetchSupportTickets();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      // Mock data for testing
      setDocuments([
        {
          id: '1',
          name: 'Projekt_Analiza.pdf',
          description: 'Analiza e të dhënave për projekt',
          type: 'pdf',
          size: '2.5 MB',
          upload_date: '2024-01-15'
        },
        {
          id: '2',
          name: 'Raport_Final.docx',
          description: 'Raporti final i studimit',
          type: 'docx',
          size: '1.8 MB',
          upload_date: '2024-01-14'
        }
      ]);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const response = await api.get('/chat/messages');
      setChatMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      // Mock data for testing
      setChatMessages([
        {
          id: '1',
          sender: 'user',
          message: 'Përshëndetje! Kam nevojë për ndihmë me analizën e të dhënave.',
          timestamp: '2024-01-15 10:30'
        },
        {
          id: '2',
          sender: 'expert',
          message: 'Përshëndetje! Sigurisht që mund t\'ju ndihmoj. Çfarë lloj analiza dëshironi të bëni?',
          timestamp: '2024-01-15 10:35'
        }
      ]);
    }
  };

  const fetchSupportTickets = async () => {
    try {
      const response = await api.get('/support/tickets');
      setSupportTickets(response.data);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      // Mock data for testing
      setSupportTickets([
        {
          id: '1',
          subject: 'Problem me importimin e të dhënave',
          description: 'Nuk mundem të importoj file CSV në SPSS',
          priority: 'medium',
          status: 'open',
          created_at: '14/01/2024 09:15'
        },
        {
          id: '2',
          subject: 'Pyetje për analizën e regresionit',
          description: 'Si të interpretohen rezultatet e regresionit linear?',
          priority: 'low',
          status: 'closed',
          created_at: '12/01/2024 14:30'
        }
      ]);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadDescription) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('description', uploadDescription);
      
      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setDocuments([...documents, response.data]);
      setShowUploadDialog(false);
      setUploadFile(null);
      setUploadDescription('');
      alert('Dokumenti u ngarkua me sukses!');
    } catch (error) {
      console.error('Error uploading file:', error);
      // Mock upload for testing
      const mockDoc = {
        id: Date.now().toString(),
        name: uploadFile.name,
        description: uploadDescription,
        type: uploadFile.type.split('/')[1] || 'unknown',
        size: `${(uploadFile.size / 1024).toFixed(1)} KB`,
        upload_date: new Date().toISOString().split('T')[0]
      };
      setDocuments([...documents, mockDoc]);
      setShowUploadDialog(false);
      setUploadFile(null);
      setUploadDescription('');
      alert('Dokumenti u ngarkua me sukses! (Mock)');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const response = await api.post('/chat/send', {
        message: newMessage,
        timestamp: new Date().toISOString()
      });
      
      setChatMessages([...chatMessages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Gabim në dërgimin e mesazhit');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription) return;

    setSubmittingTicket(true);
    try {
      const response = await api.post('/support/tickets', {
        subject: ticketSubject,
        description: ticketDescription,
        priority: ticketPriority
      });
      
      setSupportTickets([...supportTickets, response.data]);
      setShowTicketDialog(false);
      setTicketSubject('');
      setTicketDescription('');
      setTicketPriority('medium');
      alert('Ticket u krijua me sukses!');
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Gabim në krijimin e ticket-it');
    } finally {
      setSubmittingTicket(false);
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
              <Button className="btn-primary" onClick={() => setShowUploadDialog(true)}>
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="projects">Projektet</TabsTrigger>
              <TabsTrigger value="consultations">Konsultime</TabsTrigger>
              <TabsTrigger value="documents">Dokumentet</TabsTrigger>
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

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="heading-4">Dokumentet e mia</h3>
                  <p className="text-gray-600">Menaxhoni dokumentet tuaja</p>
                </div>
                <Button onClick={() => setShowUploadDialog(true)} className="btn-primary">
                  <Upload className="h-4 w-4 mr-2" />
                  Ngarko Dokument
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <File className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-sm">{doc.name}</CardTitle>
                        </div>
                        <Badge variant="outline">{doc.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{doc.upload_date}</span>
                        <span>{doc.size}</span>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          Shkarko
                        </Button>
                        <Button variant="outline" size="sm">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {documents.length === 0 && (
                <div className="text-center py-12">
                  <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Nuk keni ngarkuar dokumente ende</p>
                  <Button onClick={() => setShowUploadDialog(true)} className="btn-primary">
                    <Upload className="h-4 w-4 mr-2" />
                    Ngarko Dokumentin e parë
                  </Button>
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
                      <Button className="w-full btn-primary" onClick={() => setShowChatDialog(true)}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Fillo Chat
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Rezervo Konsultim
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => setShowTicketDialog(true)}>
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
              
              {/* Support Tickets */}
              <Card>
                <CardHeader>
                  <CardTitle className="heading-4">Ticket-et e Mbështetjes</CardTitle>
                  <CardDescription>Ticket-et tuaja të mbështetjes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {supportTickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{ticket.subject}</h4>
                          <Badge className={ticket.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {ticket.status === 'open' ? 'Hapur' : 'Mbyllur'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Krijuar: {ticket.created_at}</span>
                          <Badge variant="outline">{ticket.priority}</Badge>
                        </div>
                      </div>
                    ))}
                    
                    {supportTickets.length === 0 && (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Nuk keni ticket-e mbështetje</p>
                        <Button onClick={() => setShowTicketDialog(true)} className="btn-primary">
                          <FileText className="h-4 w-4 mr-2" />
                          Hap Ticket të parë
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Upload Document Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ngarko Dokument</DialogTitle>
            <DialogDescription>
              Ngarkoni dokumentin tuaj dhe shtoni një përshkrim
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <Label htmlFor="file">Zgjidh Dokumentin</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setUploadFile(e.target.files[0])}
                required
                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
              />
            </div>
            <div>
              <Label htmlFor="description">Përshkrimi</Label>
              <Textarea
                id="description"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Përshkruani dokumentin..."
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                Anulo
              </Button>
              <Button type="submit" disabled={uploadingFile}>
                {uploadingFile ? 'Duke ngarkuar...' : 'Ngarko'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chat me Ekspertët</DialogTitle>
            <DialogDescription>
              Bisedoni direkt me ekspertët tanë
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              {chatMessages.map((message, index) => (
                <div key={index} className={`mb-3 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-xs ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-75 mt-1">{message.timestamp}</p>
                  </div>
                </div>
              ))}
              
              {chatMessages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>Nuk keni mesazhe ende. Filloni bisedën!</p>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Shkruani mesazhin tuaj..."
                className="flex-1"
              />
              <Button type="submit" disabled={sendingMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Support Ticket Dialog */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hap Ticket Mbështetje</DialogTitle>
            <DialogDescription>
              Përshkruani problemin tuaj dhe ne do t'ju ndihmojmë
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <Label htmlFor="subject">Tema</Label>
              <Input
                id="subject"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Tema e problemit..."
                required
              />
            </div>
            <div>
              <Label htmlFor="priority">Prioriteti</Label>
              <select
                id="priority"
                value={ticketPriority}
                onChange={(e) => setTicketPriority(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="low">I ulët</option>
                <option value="medium">I mesëm</option>
                <option value="high">I lartë</option>
                <option value="urgent">Urgjent</option>
              </select>
            </div>
            <div>
              <Label htmlFor="ticketDescription">Përshkrimi</Label>
              <Textarea
                id="ticketDescription"
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                placeholder="Përshkruani problemin në detaje..."
                required
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowTicketDialog(false)}>
                Anulo
              </Button>
              <Button type="submit" disabled={submittingTicket}>
                {submittingTicket ? 'Duke dërguar...' : 'Dërgo Ticket'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientPortalPage;