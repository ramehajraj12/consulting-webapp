import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  BarChart3, 
  Users, 
  FileText, 
  PenTool, 
  Star, 
  BookOpen,
  MessageCircle,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { mockServices, mockTrainingPrograms, mockTestimonials, mockStats } from '../data/mock';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="heading-1 mb-6">
            Ekspertiza Profesionale në{' '}
            <span className="text-blue-600">Analizën Statistikore</span>
          </h1>
          <p className="body-large text-gray-600 mb-8">
            Platforma më e plotë për konsulencë statistikore në SPSS, trajnime të specializuara 
            dhe mbështetje profesionale për projektet tuaja kërkimore.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/consultation">
              <Button className="btn-primary">
                Rezervo Konsultim
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/services">
              <Button className="btn-secondary">
                Shiko Shërbimet
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="heading-2 text-blue-600 mb-2">{mockStats.projectsCompleted}+</div>
              <p className="body-small text-gray-600">Projekte të Përfunduara</p>
            </div>
            <div className="text-center">
              <div className="heading-2 text-blue-600 mb-2">{mockStats.satisfiedClients}+</div>
              <p className="body-small text-gray-600">Klientë të Kënaqur</p>
            </div>
            <div className="text-center">
              <div className="heading-2 text-blue-600 mb-2">{mockStats.yearsExperience}+</div>
              <p className="body-small text-gray-600">Vite Përvojë</p>
            </div>
            <div className="text-center">
              <div className="heading-2 text-blue-600 mb-2">{mockStats.trainedStudents}+</div>
              <p className="body-small text-gray-600">Studentë të Trajnuar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Shërbimet Tona</h2>
            <p className="body-large text-gray-600 max-w-2xl mx-auto">
              Ofrojmë një gamë të plotë shërbimesh për analizën statistikore dhe konsulencën profesionale.
            </p>
          </div>
          
          <div className="scalefast-grid">
            {mockServices.map((service) => {
              const IconComponent = {
                BarChart3: BarChart3,
                Users: Users,
                FileText: FileText,
                PenTool: PenTool
              }[service.icon];

              return (
                <Card key={service.id} className="service-card hover-scale">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="heading-4">{service.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{service.price}</Badge>
                          <Badge variant="outline">{service.duration}</Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="body-medium">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="body-small text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4">
                      <Link to="/services">
                        <Button className="w-full btn-primary">
                          Mëso Më Shumë
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Training Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Programet e Trajnimit</h2>
            <p className="body-large text-gray-600 max-w-2xl mx-auto">
              Kurse të specializuara në SPSS për të gjitha nivelet, nga fillestarët deri te ekspertët.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockTrainingPrograms.slice(0, 3).map((program) => (
              <Card key={program.id} className="hover-scale">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-blue-600" />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{program.level}</Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="body-small">{program.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="heading-4">{program.title}</CardTitle>
                  <CardDescription className="body-medium">
                    {program.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="body-small text-gray-600">{program.duration}</span>
                      <span className="body-small text-gray-600">{program.students} studentë</span>
                    </div>
                    <span className="heading-4 text-blue-600">{program.price}</span>
                  </div>
                  <Link to="/training">
                    <Button className="w-full btn-primary">
                      Regjistrohu
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/training">
              <Button className="btn-secondary">
                Shiko Të Gjitha Kurset
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Çfarë Thonë Klientët</h2>
            <p className="body-large text-gray-600">
              Dëgjoni eksperiencat e klientëve tanë të kënaqur.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover-scale">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500" />
                    ))}
                  </div>
                  <p className="body-medium text-gray-700 mb-4">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="body-small font-medium">{testimonial.name}</p>
                      <p className="body-small text-gray-500">{testimonial.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="heading-2 mb-4">Gati të Filloni Projektin Tuaj?</h2>
          <p className="body-large mb-8 max-w-2xl mx-auto">
            Kontaktoni me ekspertët tanë për konsulencë falas dhe një plan të personalizuar 
            për nevojat tuaja në analizën statistikore.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/consultation">
              <Button className="bg-white text-blue-600 hover:bg-gray-50">
                Filloni Tani
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Kontakt
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;