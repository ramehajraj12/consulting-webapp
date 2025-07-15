import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  CheckCircle
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    contactMethod: ''
  });
  const { toast } = useToast();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock submission
    toast({
      title: "Mesazhi u dërgua me sukses!",
      description: "Do të ju përgjigjemi brenda 24 orëve.",
    });
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      contactMethod: ''
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Telefoni",
      details: ["+355 69 123 4567", "+355 4 456 7890"],
      description: "E hënë - E premte, 9:00 - 18:00"
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@spssanalytics.al", "support@spssanalytics.al"],
      description: "Përgjigje brenda 24 orëve"
    },
    {
      icon: MapPin,
      title: "Adresa",
      details: ["Rruga 'Dëshmorët e Kombit'", "Tiranë 1001, Shqipëri"],
      description: "Zyra jonë kryesore"
    },
    {
      icon: Clock,
      title: "Orari",
      details: ["E hënë - E premte: 9:00 - 18:00", "E shtunë: 9:00 - 14:00"],
      description: "E diel: E mbyllur"
    }
  ];

  const officeLocations = [
    {
      city: "Tiranë",
      address: "Rruga 'Dëshmorët e Kombit', Nr. 15",
      phone: "+355 4 456 7890",
      email: "tirana@spssanalytics.al"
    },
    {
      city: "Durrës",
      address: "Rruga 'Taulantia', Nr. 8",
      phone: "+355 52 123 456",
      email: "durres@spssanalytics.al"
    },
    {
      city: "Shkodër",
      address: "Rruga 'Gjuhadol', Nr. 12",
      phone: "+355 22 789 012",
      email: "shkoder@spssanalytics.al"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="heading-1 mb-6">
              Na <span className="text-blue-600">Kontaktoni</span>
            </h1>
            <p className="body-large text-gray-600 mb-8">
              Kemi gjithmonë kohë për ju! Kontaktoni me ne për çdo pyetje, konsultim ose mbështetje. 
              Ekipi ynë është i gatshëm t'ju ndihmojë.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="heading-3">Dërgoni Mesazh</CardTitle>
                  <CardDescription>
                    Plotësoni formularin dhe do të ju përgjigjemi sa më shpejt të mundemi.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Emri dhe Mbiemri *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Emri juaj i plotë"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefoni</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+355 69 123 4567"
                      />
                    </div>

                    <div>
                      <Label>Subjekti</Label>
                      <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Zgjidhni subjektin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">Konsultim</SelectItem>
                          <SelectItem value="training">Trajnim</SelectItem>
                          <SelectItem value="support">Mbështetje</SelectItem>
                          <SelectItem value="partnership">Partneritet</SelectItem>
                          <SelectItem value="other">Të tjera</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Mënyra e preferuar e kontaktit</Label>
                      <Select value={formData.contactMethod} onValueChange={(value) => setFormData({...formData, contactMethod: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Si dëshironi të kontaktoheni?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Telefon</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="video">Video Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="message">Mesazhi *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        placeholder="Shkruani mesazhin tuaj këtu..."
                        rows={6}
                      />
                    </div>

                    <Button type="submit" className="w-full btn-primary">
                      <Send className="h-4 w-4 mr-2" />
                      Dërgo Mesazh
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Quick Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="heading-4">Informacioni i Kontaktit</CardTitle>
                  <CardDescription>
                    Gjeni mënyrat më të shpejta për t'u lidhur me ne.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contactInfo.map((item, index) => {
                      const IconComponent = item.icon;
                      return (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">{item.title}</h4>
                            {item.details.map((detail, i) => (
                              <p key={i} className="body-small text-gray-600">{detail}</p>
                            ))}
                            <p className="body-small text-gray-500 mt-1">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="heading-4">Rrjetet Sociale</CardTitle>
                  <CardDescription>
                    Ndiqni lajmet dhe përditësimet tona.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="icon">
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Instagram className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="heading-4">Mbështetje e Shpejtë</CardTitle>
                  <CardDescription>
                    Keni nevojë për ndihmë të menjëhershme?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat Live
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      Telefon Urgjent
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Mbështetje
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Zyrat Tona</h2>
            <p className="body-large text-gray-600">
              Gjeni zyrën më të afërt me ju për vizitë personale.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {officeLocations.map((office, index) => (
              <Card key={index} className="hover-scale">
                <CardHeader>
                  <CardTitle className="heading-4">{office.city}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                      <p className="body-small text-gray-600">{office.address}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <p className="body-small text-gray-600">{office.phone}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <p className="body-small text-gray-600">{office.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <MapPin className="h-4 w-4 mr-2" />
                    Shiko Hartën
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Pyetjet e Shpeshta</h2>
            <p className="body-large text-gray-600">
              Gjeni përgjigjet për pyetjet më të zakonshme.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                question: "Sa kohë duhet për një analizë statistikore?",
                answer: "Koha varet nga kompleksiteti i projektit. Zakonisht një analizë standarde merr 2-5 ditë pune."
              },
              {
                question: "Cili është çmimi i një konsultimi?",
                answer: "Konsultimi i parë është falas. Konsultimet e tjera kushtojnë €30/orë për të standardet dhe €50/orë për të specializuarat."
              },
              {
                question: "A ofroni trajnime online?",
                answer: "Po, të gjitha kurset tona janë të disponueshme si online ashtu edhe në person."
              },
              {
                question: "Si mund të ngarkoj të dhënat e mia?",
                answer: "Mund t'i ngarkoni përmes portalit të klientëve ose t'i dërgoni me email në formatin e dëshiruar."
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-medium mb-2">{faq.question}</h4>
                      <p className="body-medium text-gray-600">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;