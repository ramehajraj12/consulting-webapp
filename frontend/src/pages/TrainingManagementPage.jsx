import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Star, 
  Video,
  FileText,
  Clock,
  Euro
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const TrainingManagementPage = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: '',
    duration: '',
    price: '',
    modules: [],
    video_urls: [],
    materials: []
  });

  const levels = ['Fillestar', 'I mesëm', 'I avancuar', 'Specializim'];

  useEffect(() => {
    fetchMyPrograms();
  }, []);

  const fetchMyPrograms = async () => {
    try {
      const response = await api.get('/training/my/programs');
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleListInputChange = (field, value) => {
    const items = value.split('\n').filter(item => item.trim());
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      price: parseFloat(formData.price)
    };

    try {
      if (editingProgram) {
        await api.put(`/training/${editingProgram.id}`, submitData);
      } else {
        await api.post('/training', submitData);
      }
      
      setShowCreateForm(false);
      setEditingProgram(null);
      setFormData({
        title: '',
        description: '',
        level: '',
        duration: '',
        price: '',
        modules: [],
        video_urls: [],
        materials: []
      });
      fetchMyPrograms();
    } catch (error) {
      console.error('Error saving program:', error);
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      description: program.description,
      level: program.level,
      duration: program.duration,
      price: program.price.toString(),
      modules: program.modules,
      video_urls: program.video_urls,
      materials: program.materials
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (programId) => {
    if (window.confirm('Jeni i sigurt që dëshironi të fshini këtë program trajnimi?')) {
      try {
        await api.delete(`/training/${programId}`);
        fetchMyPrograms();
      } catch (error) {
        console.error('Error deleting program:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      level: '',
      duration: '',
      price: '',
      modules: [],
      video_urls: [],
      materials: []
    });
    setEditingProgram(null);
    setShowCreateForm(false);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-2 text-gray-900">Menaxhimi i Trajnimeve</h1>
            <p className="body-medium text-gray-600">
              Krijoni dhe menaxhoni programet tuaja të trajnimit
            </p>
          </div>
          <Button 
            className="btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Shto Program të Ri
          </Button>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Card key={program.id} className="hover-scale">
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
                    <div className="flex items-center space-x-1">
                      <Euro className="h-4 w-4 text-green-600" />
                      <span className="heading-4 text-green-600">{program.price}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="body-small font-medium mb-2">Përmbajtja:</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="secondary">
                        <Video className="h-3 w-3 mr-1" />
                        {program.video_urls.length} Video
                      </Badge>
                      <Badge variant="secondary">
                        <FileText className="h-3 w-3 mr-1" />
                        {program.materials.length} Material
                      </Badge>
                      <Badge variant="secondary">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {program.modules.length} Module
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(program)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Ndrysho
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(program.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {programs.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="heading-4 text-gray-600 mb-2">Nuk keni programe trajnimi</h3>
            <p className="body-medium text-gray-500 mb-4">
              Filloni duke krijuar programin tuaj të parë të trajnimit
            </p>
            <Button 
              className="btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Krijo Program të Ri
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProgram ? 'Ndrysho Program Trajnimi' : 'Krijo Program të Ri'}
            </DialogTitle>
            <DialogDescription>
              Plotësoni informacionin për programin e trajnimit
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titulli</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="p.sh. SPSS për Fillestarë"
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="level">Niveli</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Zgjidhni nivelin" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map(level => (
                      <SelectItem key={level} value={level} className="text-sm">{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Kohëzgjatja</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  placeholder="p.sh. 4 javë"
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="price">Çmimi (€)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  placeholder="100.00"
                  className="text-sm"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Përshkrimi</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Përshkrimi i programit të trajnimit..."
                className="text-sm h-20"
              />
            </div>

            {/* Modules Section */}
            <div>
              <Label>Modulet (një për rresht)</Label>
              <Textarea
                value={formData.modules.join('\n')}
                onChange={(e) => setFormData({...formData, modules: e.target.value.split('\n').filter(m => m.trim())})}
                placeholder="Moduli 1: Hyrje në SPSS&#10;Moduli 2: Analiza deskriptive&#10;Moduli 3: Teste statistikore"
                className="text-sm h-20"
              />
            </div>

            {/* Video URLs Section */}
            <div>
              <Label>URL të Videove (një për rresht)</Label>
              <Textarea
                value={formData.video_urls.join('\n')}
                onChange={(e) => setFormData({...formData, video_urls: e.target.value.split('\n').filter(u => u.trim())})}
                placeholder="https://youtube.com/watch?v=...&#10;https://vimeo.com/..."
                className="text-sm h-20"
              />
            </div>

            {/* Materials Section */}
            <div>
              <Label>Materialet (një për rresht)</Label>
              <Textarea
                value={formData.materials.join('\n')}
                onChange={(e) => setFormData({...formData, materials: e.target.value.split('\n').filter(m => m.trim())})}
                placeholder="Udhëzues PDF&#10;Ushtrime praktike&#10;Template SPSS"
                className="text-sm h-20"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                className="text-sm"
              >
                Anulo
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="btn-primary text-sm"
              >
                {loading ? 'Duke ruajtur...' : (editingProgram ? 'Përditëso' : 'Krijo')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
              </div>
              <div>
                <Label htmlFor="level">Niveli</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({...prev, level: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Zgjidhni nivelin" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Përshkrimi</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Përshkruani programin e trajnimit..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Kohëzgjatja</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  placeholder="p.sh. 4 javë"
                />
              </div>
              <div>
                <Label htmlFor="price">Çmimi (€)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  placeholder="120.00"
                />
              </div>
            </div>

            <div>
              <Label>Modulet (një për rresht)</Label>
              <Textarea
                value={formData.modules.join('\n')}
                onChange={(e) => handleListInputChange('modules', e.target.value)}
                placeholder="Hyrje në SPSS&#10;Importimi i të dhënave&#10;Analizat deskriptive"
                rows={4}
              />
            </div>

            <div>
              <Label>URL të Videove (një për rresht)</Label>
              <Textarea
                value={formData.video_urls.join('\n')}
                onChange={(e) => handleListInputChange('video_urls', e.target.value)}
                placeholder="https://youtube.com/watch?v=...&#10;https://vimeo.com/..."
                rows={3}
              />
            </div>

            <div>
              <Label>Materialet (një për rresht)</Label>
              <Textarea
                value={formData.materials.join('\n')}
                onChange={(e) => handleListInputChange('materials', e.target.value)}
                placeholder="Udhëzues PDF&#10;Ushtrime praktike&#10;Template SPSS"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Anulo
              </Button>
              <Button type="submit" className="btn-primary">
                {editingProgram ? 'Ndrysho' : 'Krijo'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingManagementPage;