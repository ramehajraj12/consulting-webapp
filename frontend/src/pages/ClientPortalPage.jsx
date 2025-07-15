import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  Upload
} from 'lucide-react';
import { mockProjects } from '../data/mock';

const ClientPortalPage = () => {
  const [selectedProject, setSelectedProject] = useState(null);

  const notifications = [
    {
      id: 1,
      type: 'success',
      message: 'Projekti "Analiza të Dhënave Kërkimore" u përfundua me sukses.',
      time: '2 orë më parë',
      read: false
    },
    {
      id: 2,
      type: 'info',
      message: 'Ju keni një konsultim të programuar për nesër në orën 14:00.',
      time: '1 ditë më parë',
      read: true
    },
    {
      id: 3,
      type: 'warning',
      message: 'Ju lutemi ngarkoni të dhënat për projektin "Studim Epidemiologjik".',
      time: '3 ditë më parë',
      read: false
    }
  ];

  const recentFiles = [
    {
      id: 1,
      name: 'Analiza_Finale_Dataset.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploaded: '2024-01-15',
      project: 'Analiza të Dhënave Kërkimore'
    },
    {
      id: 2,
      name: 'SPSS_Output_Results.spv',
      type: 'SPSS',
      size: '1.8 MB',
      uploaded: '2024-01-14',
      project: 'Studim Epidemiologjik'
    },
    {
      id: 3,
      name: 'Interpretimi_Statistikor.docx',
      type: 'DOC',
      size: '890 KB',
      uploaded: '2024-01-12',
      project: 'Analiza Tregut'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Përfunduar':
        return 'bg-green-100 text-green-800';
      case 'Në progres':
        return 'bg-blue-100 text-blue-800';
      case 'Filluar':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-2 mb-2">Mirë se erdhët, Dr. Fatmir Leshi</h1>
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
              <TabsTrigger value="files">Dokumentet</TabsTrigger>
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
                        <p className="body-small text-gray-600">Projekte Aktive</p>
                        <p className="heading-3">2</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="body-small text-gray-600">Projekte të Përfunduara</p>
                        <p className="heading-3">1</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="body-small text-gray-600">Konsultime</p>
                        <p className="heading-3">5</p>
                      </div>
                      <MessageCircle className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="body-small text-gray-600">Dokumentet</p>
                        <p className="heading-3">12</p>
                      </div>
                      <FileText className="h-8 w-8 text-orange-600" />
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
                    {mockProjects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{project.title}</h4>
                          <p className="body-small text-gray-600">{project.client}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                          <Progress value={project.progress} className="w-24" />
                          <span className="body-small text-gray-600">{project.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockProjects.map((project) => (
                  <Card key={project.id} className="hover-scale cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="heading-4">{project.title}</CardTitle>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                      <CardDescription>{project.client}</CardDescription>
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
                            <span className="body-small text-gray-600">Afati: {project.deadline}</span>
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
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="heading-4">Dokumentet e Fundit</CardTitle>
                  <CardDescription>Dokumentet e ngarkuara dhe të shkarkuara</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{file.name}</h4>
                            <p className="body-small text-gray-600">{file.project}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="body-small text-gray-600">{file.size}</p>
                            <p className="body-small text-gray-500">{file.uploaded}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Shkarko
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                            <p className="body-small text-gray-500 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
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