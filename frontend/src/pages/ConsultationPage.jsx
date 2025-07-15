import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { 
  Calendar as CalendarIcon,
  Clock,
  Users,
  Star,
  CheckCircle,
  MessageCircle,
  Video,
  FileText,
  Euro
} from 'lucide-react';
import { format } from 'date-fns';
import { mockConsultants, mockServices } from '../data/mock';
import { useToast } from '../hooks/use-toast';

const ConsultationPage = () => {
  const [selectedService, setSelectedService] = useState('');
  const [selectedConsultant, setSelectedConsultant] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectDescription: '',
    urgency: ''
  });
  const { toast } = useToast();

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', 
    '14:00', '15:00', '16:00', '17:00'
  ];

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
      title: "Rezervimi u dërgua me sukses!",
      description: "Do të ju kontaktojmë brenda 24 orëve për konfirmim.",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="heading-1 mb-6">
              Rezervoni <span className="text-blue-600">Konsultimin</span> Tuaj
            </h1>
            <p className="body-large text-gray-600 mb-8">
              Merrni konsultim profesional nga ekspertët tanë për projektin tuaj. 
              Konsultimi i parë është falas!
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Booking Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="heading-3">Rezervo Konsultim</CardTitle>
                  <CardDescription>
                    Plotësoni formularin dhe zgjidhni kohën e dëshiruar.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h4 className="heading-4">Informacioni Personal</h4>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <Label htmlFor="company">Organizata/Kompania</Label>
                          <Input
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="Emri i organizatës"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Service Selection */}
                    <div>
                      <Label>Lloji i Shërbimit *</Label>
                      <Select value={selectedService} onValueChange={setSelectedService}>
                        <SelectTrigger>
                          <SelectValue placeholder="Zgjidhni shërbimin" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockServices.map((service) => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              {service.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Consultation Type */}
                    <div>
                      <Label>Lloji i Konsultimit</Label>
                      <Select value={consultationType} onValueChange={setConsultationType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Zgjidhni llojin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online (Video Call)</SelectItem>
                          <SelectItem value="phone">Telefon</SelectItem>
                          <SelectItem value="in-person">Në person</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Consultant Selection */}
                    <div>
                      <Label>Zgjidhni Konsulentin</Label>
                      <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
                        <SelectTrigger>
                          <SelectValue placeholder="Zgjidhni konsulentin" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockConsultants.map((consultant) => (
                            <SelectItem key={consultant.id} value={consultant.id.toString()}>
                              {consultant.name} - {consultant.specialization}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Selection */}
                    <div>
                      <Label>Data e Konsultimit</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'PPP') : 'Zgjidhni datën'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time Selection */}
                    <div>
                      <Label>Ora e Konsultimit</Label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Zgjidhni orën" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Project Description */}
                    <div>
                      <Label htmlFor="projectDescription">Përshkrimi i Projektit</Label>
                      <Textarea
                        id="projectDescription"
                        name="projectDescription"
                        value={formData.projectDescription}
                        onChange={handleInputChange}
                        placeholder="Përshkruani shkurtimisht projektin tuaj dhe nevojat specifike..."
                        rows={4}
                      />
                    </div>

                    {/* Urgency */}
                    <div>
                      <Label>Urgjenca</Label>
                      <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Zgjidhni urgjencën" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">E ulët</SelectItem>
                          <SelectItem value="medium">Mesatare</SelectItem>
                          <SelectItem value="high">E lartë</SelectItem>
                          <SelectItem value="urgent">Urgjente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full btn-primary">
                      Rezervo Konsultim
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Consultation Options */}
            <div className="space-y-8">
              {/* Consultation Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="heading-4">Llojet e Konsultimit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Video className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Video Konsultim</h4>
                        <p className="body-small text-gray-600">
                          Konsultim online me video, shkëmbim ekrani dhe dokumente
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Konsultim Telefonik</h4>
                        <p className="body-small text-gray-600">
                          Konsultim i shpejtë përmes telefonit për pyetje specifike
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Konsultim në Person</h4>
                        <p className="body-small text-gray-600">
                          Takim fizik në zyrat tona për projekte komplekse
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="heading-4">Çmimet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="body-medium">Konsultim i parë (1 orë)</span>
                      <Badge variant="secondary">Falas</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="body-medium">Konsultim standard</span>
                      <span className="body-medium">€30/orë</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="body-medium">Konsultim i specializuar</span>
                      <span className="body-medium">€50/orë</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="body-medium">Projekte të plota</span>
                      <span className="body-medium">Sipas marrëveshjes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Consultants */}
              <Card>
                <CardHeader>
                  <CardTitle className="heading-4">Konsulentët Tanë</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockConsultants.map((consultant) => (
                      <div key={consultant.id} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{consultant.name}</h4>
                          <p className="body-small text-gray-600">{consultant.specialization}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="body-small">{consultant.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConsultationPage;