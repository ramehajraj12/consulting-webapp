import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  BarChart3, 
  Users, 
  FileText, 
  PenTool, 
  CheckCircle,
  ArrowRight,
  Clock,
  Euro,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ServicesPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, consultantsRes] = await Promise.all([
        api.get('/services'),
        api.get('/auth/consultants') // We'll create this endpoint
      ]);

      setServices(servicesRes.data);
      // For now, use mock consultants data
      setConsultants([
        {
          id: 1,
          name: "Dr. Alba Hasani",
          title: "Ekspert Statistikor",
          specialization: "Statistika mjekësore",
          experience: "12 vite",
          rating: 4.9,
          bio: "Ekspert me përvoje të gjatë në analizën statistikore për kërkime mjekësore dhe epidemiologjike."
        },
        {
          id: 2,
          name: "Prof. Marin Kodra",
          title: "Konsulent i Lartë",
          specialization: "Metodologji kërkimi",
          experience: "15 vite",
          rating: 4.8,
          bio: "Profesor univerzitar me specializim në metodologjinë e kërkimit dhe analizën e të dhënave."
        },
        {
          id: 3,
          name: "Dr. Ines Brahimi",
          title: "Analist i Të Dhënave",
          specialization: "Statistika biznesore",
          experience: "8 vite",
          rating: 4.7,
          bio: "Specialiste në analizën e të dhënave për bizneset dhe studimet e tregut."
        }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
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
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="heading-1 mb-6">
              Shërbimet Tona <span className="text-blue-600">Profesionale</span>
            </h1>
            <p className="body-large text-gray-600 mb-8">
              Ofrojmë një gamë të plotë shërbimesh për analizën statistikore, konsulencën profesionale 
              dhe mbështetjen e projekteve tuaja kërkimore.
            </p>
            <Link to={user ? "/consultation" : "/login"}>
              <Button className="btn-primary">
                Rezervo Konsultim Falas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="scalefast-grid">
            {services.map((service) => {
              const IconComponent = {
                BarChart3: BarChart3,
                Users: Users,
                FileText: FileText,
                PenTool: PenTool
              }[service.icon];

              return (
                <Card key={service.id} className="service-card hover-scale">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <IconComponent className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="heading-3">{service.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="flex items-center space-x-1">
                            <Euro className="h-3 w-3" />
                            <span>{service.price_range}</span>
                          </Badge>
                          <Badge variant="outline" className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{service.duration}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="body-medium text-gray-600">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="heading-4 mb-3">Përfshin:</h4>
                        <ul className="space-y-2">
                          {service.features.map((feature, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="body-small text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex space-x-2">
                        <Link to={user ? "/consultation" : "/login"} className="flex-1">
                          <Button className="w-full btn-primary">
                            Rezervo Tani
                          </Button>
                        </Link>
                        <Button variant="outline" className="flex-1">
                          Më Shumë Info
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Experts */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Takoni Ekspertët Tanë</h2>
            <p className="body-large text-gray-600 max-w-2xl mx-auto">
              Ekipi ynë i ekspertëve me përvojë të gjatë në analizën statistikore dhe SPSS.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {consultants.map((consultant) => (
              <Card key={consultant.id} className="hover-scale">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="heading-4 mb-2">{consultant.name}</h3>
                  <p className="body-medium text-blue-600 mb-1">{consultant.title}</p>
                  <p className="body-small text-gray-600 mb-3">{consultant.specialization}</p>
                  
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="body-small">{consultant.rating}</span>
                    </div>
                    <div className="text-gray-300">•</div>
                    <span className="body-small text-gray-600">{consultant.experience}</span>
                  </div>
                  
                  <p className="body-small text-gray-600 mb-4">
                    {consultant.bio}
                  </p>
                  
                  <Link to={user ? "/consultation" : "/login"}>
                    <Button className="w-full btn-primary">
                      Rezervo Konsultim
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Si Funksionon</h2>
            <p className="body-large text-gray-600">
              Proces i thjeshtë për të marrë shërbimin e duhur për ju.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="heading-3 text-blue-600">1</span>
              </div>
              <h3 className="heading-4 mb-2">Kontakt Fillestar</h3>
              <p className="body-medium text-gray-600">
                Na kontaktoni për të diskutuar nevojat tuaja dhe të marrim një konsultim falas.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="heading-3 text-blue-600">2</span>
              </div>
              <h3 className="heading-4 mb-2">Plan i Personalizuar</h3>
              <p className="body-medium text-gray-600">
                Krijojmë një plan pune të detajuar të përshtatur për projektin tuaj specifik.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="heading-3 text-blue-600">3</span>
              </div>
              <h3 className="heading-4 mb-2">Zbatimi dhe Dorëzimi</h3>
              <p className="body-medium text-gray-600">
                Realizojmë punën me cilësi të lartë dhe ju dorëzojmë rezultatet e plota.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="heading-2 mb-4">Gati të Filloni?</h2>
          <p className="body-large mb-8 max-w-2xl mx-auto">
            Kontaktoni me ne sot për konsultim falas dhe ofertë të personalizuar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? "/consultation" : "/login"}>
              <Button className="bg-white text-blue-600 hover:bg-gray-50">
                Rezervo Konsultim
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Na Kontaktoni
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;