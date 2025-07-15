import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  BookOpen, 
  Star, 
  Users, 
  Clock, 
  Award,
  Play,
  Download,
  CheckCircle,
  ArrowRight,
  Video,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import api from '../services/api';

const TrainingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainingPrograms();
    if (user && user.role === 'client') {
      fetchMyEnrollments();
    }
  }, [user]);

  const fetchTrainingPrograms = async () => {
    try {
      const response = await api.get('/training');
      setTrainingPrograms(response.data);
    } catch (error) {
      console.error('Error fetching training programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEnrollments = async () => {
    try {
      const response = await api.get('/training/my/enrollments');
      setEnrollments(response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const handleEnroll = async (trainingId) => {
    if (!user) {
      toast({
        title: "Duhet të jeni të kyçur",
        description: "Ju lutemi kyçuni për të vazhduar me regjistrimin.",
        variant: "destructive"
      });
      return;
    }

    if (user.role !== 'client') {
      toast({
        title: "Vetëm klientët mund të regjistrohen",
        description: "Ju lutemi kyçuni me llogari klienti.",
        variant: "destructive"
      });
      return;
    }

    try {
      await api.post(`/training/${trainingId}/enroll`);
      toast({
        title: "Regjistrimi u krye me sukses!",
        description: "Ju jeni regjistruar në program trajnimi.",
      });
      fetchMyEnrollments();
      fetchTrainingPrograms(); // Refresh to update student count
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Gabim në regjistrim';
      toast({
        title: "Gabim në regjistrim",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const isEnrolled = (trainingId) => {
    return enrollments.some(enrollment => 
      enrollment.training_id === trainingId && enrollment.status === 'active'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Duke ngarkuar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="heading-1 mb-6">
              Trajnime <span className="text-blue-600">Profesionale</span> në SPSS
            </h1>
            <p className="body-large text-gray-600 mb-8">
              Kurse të specializuara dhe certifikime profesionale në SPSS për të gjitha nivelet. 
              Mësoni nga ekspertët dhe merrni certifikatën tuaj.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-primary">
                Shfleto Kurset
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link to={user ? "/consultation" : "/login"}>
                <Button className="btn-secondary">
                  Konsultim Falas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* My Enrollments (for logged in clients) */}
      {user && user.role === 'client' && enrollments.length > 0 && (
        <section className="py-16 bg-blue-50">
          <div className="container mx-auto px-4">
            <h2 className="heading-2 mb-8 text-center">Trajnimet e Mia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="hover-scale">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={enrollment.status === 'completed' ? 'default' : 'outline'}>
                        {enrollment.status === 'completed' ? 'Përfunduar' : 'Në progres'}
                      </Badge>
                      <span className="body-small text-gray-600">
                        Moduli {enrollment.current_module + 1}
                      </span>
                    </div>
                    <CardTitle className="heading-4">{enrollment.training_title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="body-small text-gray-600">Progresi</span>
                          <span className="body-small text-gray-600">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} />
                      </div>
                      <Button className="w-full btn-primary">
                        Vazhdo Mësimin
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Training Programs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Programet e Trajnimit</h2>
            <p className="body-large text-gray-600 max-w-2xl mx-auto">
              Zgjidhni kursin që i përshtatet nivelit dhe nevojave tuaja profesionale.
            </p>
          </div>
          
          <div className="scalefast-grid">
            {trainingPrograms.map((program) => (
              <Card key={program.id} className="hover-scale">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-blue-600" />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{program.level}</Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="body-small">{program.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="heading-3">{program.title}</CardTitle>
                  <CardDescription className="body-medium">
                    {program.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="body-small text-gray-600">{program.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="body-small text-gray-600">{program.students}</span>
                        </div>
                      </div>
                      <span className="heading-4 text-blue-600">€{program.price}</span>
                    </div>
                    
                    <div>
                      <h4 className="heading-4 mb-2">Përmbajtja:</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          <Video className="h-3 w-3 mr-1" />
                          {program.video_urls.length} Video
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {program.materials.length} Material
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {program.modules.length} Module
                        </Badge>
                      </div>
                      <ul className="space-y-1">
                        {program.modules.slice(0, 3).map((module, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="body-small text-gray-600">{module}</span>
                          </li>
                        ))}
                        {program.modules.length > 3 && (
                          <li className="body-small text-gray-500">
                            +{program.modules.length - 3} module të tjera
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="flex space-x-2">
                      {isEnrolled(program.id) ? (
                        <Button className="flex-1 btn-primary" disabled>
                          Regjistruar
                        </Button>
                      ) : (
                        <Button 
                          className="flex-1 btn-primary"
                          onClick={() => handleEnroll(program.id)}
                        >
                          Regjistrohu
                        </Button>
                      )}
                      <Button variant="outline" className="flex-1">
                        Detaje
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Pse të Zgjidhni Trajnimet Tona?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="heading-4 mb-2">Certifikim i Akredituar</h3>
              <p className="body-medium text-gray-600">
                Merrni certifikatë të akredituar që njihet ndërkombëtarisht në fushën tuaj.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="heading-4 mb-2">Mësim Interaktiv</h3>
              <p className="body-medium text-gray-600">
                Video leksione, ushtrime praktike dhe projekte reale për përvojë të plotë.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="heading-4 mb-2">Mbështetje 24/7</h3>
              <p className="body-medium text-gray-600">
                Akses i vazhdueshëm në ekspertët tanë për pyetje dhe mbështetje.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="heading-2 mb-4">Filloni Mësimin Sot!</h2>
          <p className="body-large mb-8 max-w-2xl mx-auto">
            Investoni në arsimimin tuaj dhe përshtatuni me kërkesat e tregut të punës.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-blue-600 hover:bg-gray-50">
              Zgjidhni Kursin
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link to={user ? "/consultation" : "/login"}>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Konsultim Falas
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TrainingPage;