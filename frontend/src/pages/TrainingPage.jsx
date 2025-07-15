import React from 'react';
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
  ArrowRight
} from 'lucide-react';
import { mockTrainingPrograms } from '../data/mock';

const TrainingPage = () => {
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
              <Button className="btn-secondary">
                Konsultim Falas
              </Button>
            </div>
          </div>
        </div>
      </section>

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
            {mockTrainingPrograms.map((program) => (
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
                      <span className="heading-4 text-blue-600">{program.price}</span>
                    </div>
                    
                    <div>
                      <h4 className="heading-4 mb-2">Moduli:</h4>
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
                      <Button className="flex-1 btn-primary">
                        Regjistrohu
                      </Button>
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

      {/* Learning Path */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Rruga e Mësimit</h2>
            <p className="body-large text-gray-600">
              Një shembull i progresit tuaj në kursin tonë më popullor.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="heading-3">SPSS për Fillestarë - Progres Shembulli</CardTitle>
                <CardDescription>
                  Shikoni se si do të zhvilloheni gjatë 4 javëve të kursit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="heading-4">Java 1: Bazat e SPSS</h4>
                      <Badge variant="secondary">Përfunduar</Badge>
                    </div>
                    <Progress value={100} className="mb-2" />
                    <p className="body-small text-gray-600">
                      Instalimi, njohja me interface-in, importimi i të dhënave
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="heading-4">Java 2: Analizat Deskriptive</h4>
                      <Badge variant="secondary">Përfunduar</Badge>
                    </div>
                    <Progress value={100} className="mb-2" />
                    <p className="body-small text-gray-600">
                      Statistikat deskriptive, frekuencat, mesataret
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="heading-4">Java 3: Visualizimi i Të Dhënave</h4>
                      <Badge variant="outline">Në progres</Badge>
                    </div>
                    <Progress value={65} className="mb-2" />
                    <p className="body-small text-gray-600">
                      Krijimi i grafikave, tabelave, dhe raporteve
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="heading-4">Java 4: Teste Statistikore</h4>
                      <Badge variant="outline">Pritje</Badge>
                    </div>
                    <Progress value={0} className="mb-2" />
                    <p className="body-small text-gray-600">
                      T-test, Chi-square, ANOVA dhe teste të tjera
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Konsultim Falas
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TrainingPage;