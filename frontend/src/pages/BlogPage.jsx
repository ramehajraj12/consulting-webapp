import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { 
  Search,
  Calendar,
  Clock,
  User,
  BookOpen,
  TrendingUp,
  Filter,
  ArrowRight,
  Heart,
  Eye,
  MessageCircle
} from 'lucide-react';
import api from '../services/api';

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const baseURL = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [selectedCategory, searchTerm, currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        skip: ((currentPage - 1) * 10).toString(),
        limit: '10'
      });
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await api.get(`/blog/posts?${params}`);
      
      if (currentPage === 1) {
        setPosts(response.data);
      } else {
        setPosts(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.data.length === 10);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Mock data fallback
      setPosts([
        {
          id: '1',
          title: "Si të Zgjidhni Testin e Duhur Statistikor",
          excerpt: "Udhëzues i plotë për zgjedhjen e testeve statistikore të përshtatshme për të dhënat tuaja.",
          author_name: "Dr. Alba Hasani",
          created_at: "2024-01-15T10:00:00Z",
          category: "Tutorial",
          reading_time: 8,
          views: 245,
          likes: 12,
          featured_image: null,
          tags: ["SPSS", "Statistika", "Tutorial"]
        },
        {
          id: '2',
          title: "Gabimet më të Shpeshta në Analizën Statistikore",
          excerpt: "Identifikimi dhe shmangja e gabimeve të zakonshme në analizën e të dhënave.",
          author_name: "Prof. Marin Kodra",
          created_at: "2024-01-12T15:30:00Z",
          category: "Best Practices",
          reading_time: 6,
          views: 189,
          likes: 8,
          featured_image: null,
          tags: ["Gabime", "Analiza", "Best Practices"]
        },
        {
          id: '3',
          title: "Interpretimi i Rezultateve të Regresionit",
          excerpt: "Mënyra e duhur për të interpretuar dhe raportuar rezultatet e analizës regresive.",
          author_name: "Dr. Ines Brahimi",
          created_at: "2024-01-10T09:15:00Z",
          category: "Analiza",
          reading_time: 10,
          views: 321,
          likes: 15,
          featured_image: null,
          tags: ["Regresion", "Interpretim", "Analiza"]
        }
      ]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/blog/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Mock categories
      setCategories([
        { id: '1', name: 'Tutorial', slug: 'tutorial', post_count: 5 },
        { id: '2', name: 'Best Practices', slug: 'best-practices', post_count: 3 },
        { id: '3', name: 'Analiza', slug: 'analiza', post_count: 7 },
        { id: '4', name: 'Statistika', slug: 'statistika', post_count: 4 }
      ]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLike = async (postId) => {
    try {
      const response = await api.post(`/blog/posts/${postId}/like`);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: response.data.liked ? post.likes + 1 : post.likes - 1 }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="heading-1 mb-4">Blog & Burime</h1>
            <p className="body-large text-gray-600 mb-8">
              Artikuj, udhëzues dhe këshilla profesionale për analizën statistikore
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex max-w-md mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Kërko artikuj..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="ml-2 btn-primary">
                Kërko
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <div className="space-y-6">
                {/* Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="heading-4">Kategoritë</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleCategoryChange('all')}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCategory === 'all'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Të gjitha
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryChange(category.slug)}
                          className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedCategory === category.slug
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {category.name} ({category.post_count})
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Posts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="heading-4">Postet e fundit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {posts.slice(0, 3).map((post) => (
                        <div key={post.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                          <Link
                            to={`/blog/${post.id}`}
                            className="block hover:text-blue-600 transition-colors"
                          >
                            <h4 className="font-medium text-sm line-clamp-2 mb-1">
                              {post.title}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {formatDate(post.created_at)}
                            </p>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {loading && currentPage === 1 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Duke ngarkuar artikujt...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">{post.category}</Badge>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{post.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-4 w-4" />
                              <span>{post.likes}</span>
                            </div>
                          </div>
                        </div>
                        <CardTitle className="heading-3">
                          <Link to={`/blog/${post.id}`} className="hover:text-blue-600 transition-colors">
                            {post.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="body-medium">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{post.author_name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(post.created_at)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{post.reading_time} min</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(post.id)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                            <Link to={`/blog/${post.id}`}>
                              <Button variant="outline" size="sm">
                                Lexo më shumë
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                        
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {post.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {hasMore && !loading && (
                <div className="text-center mt-8">
                  <Button
                    onClick={() => {
                      setCurrentPage(prev => prev + 1);
                      fetchPosts();
                    }}
                    variant="outline"
                    disabled={loading}
                  >
                    {loading ? 'Duke ngarkuar...' : 'Shiko më shumë'}
                  </Button>
                </div>
              )}

              {filteredPosts.length === 0 && !loading && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nuk u gjetën artikuj për kërkesën tuaj.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
      category: "Tutorial",
      readTime: "10 min"
    },
    {
      id: 4,
      title: "SPSS vs R: Cili është më i mirë për ju?",
      excerpt: "Krahasim i detajuar mes SPSS dhe R për analiza statistikore.",
      author: "Dr. Alba Hasani",
      date: "2024-01-08",
      category: "Comparison",
      readTime: "12 min"
    },
    {
      id: 5,
      title: "Përgatitja e të Dhënave për Analizë",
      excerpt: "Hapat kryesorë për të përgatitur të dhënat tuaja për analizë statistikore.",
      author: "Prof. Marin Kodra",
      date: "2024-01-05",
      category: "Tutorial",
      readTime: "9 min"
    }
  ];

  const categories = [
    { id: 'all', label: 'Të gjitha', count: mockBlogPosts.length },
    { id: 'tutorial', label: 'Tutorial', count: 3 },
    { id: 'best-practices', label: 'Best Practices', count: 1 },
    { id: 'comparison', label: 'Krahasime', count: 1 },
    { id: 'news', label: 'Lajme', count: 0 }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPosts(mockBlogPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           post.category.toLowerCase().replace(' ', '-') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = posts[0];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Duke ngarkuar artikujt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="heading-1 mb-6">
              Blog & <span className="text-blue-600">Burime</span>
            </h1>
            <p className="body-large text-gray-600 mb-8">
              Artikuj profesionalë, tutorial dhe këshilla për analizën statistikore në SPSS. 
              Qëndroni të informuar me trendet e fundit.
            </p>
            <div className="flex justify-center">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Kërko artikuj..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="heading-4">Kategoritë</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-blue-50 text-blue-600'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <span className="body-medium">{category.label}</span>
                          <Badge variant="secondary">{category.count}</Badge>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Posts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="heading-4">Artikuj të Fundit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {posts.slice(0, 3).map((post) => (
                        <div key={post.id} className="space-y-2">
                          <h4 className="body-medium font-medium line-clamp-2 hover:text-blue-600 cursor-pointer">
                            {post.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span className="body-small">{formatDate(post.date)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Newsletter */}
                <Card>
                  <CardHeader>
                    <CardTitle className="heading-4">Newsletter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="body-small text-gray-600 mb-4">
                      Merrni artikuj dhe këshilla të reja direkt në email.
                    </p>
                    <div className="space-y-2">
                      <Input placeholder="Email adresa" />
                      <Button className="w-full btn-primary">
                        Abonohu
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Featured Post */}
              {featuredPost && (
                <Card className="mb-8">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-blue-600" />
                  </div>
                  <CardHeader>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="default">I Zgjedhur</Badge>
                      <Badge variant="outline">{featuredPost.category}</Badge>
                    </div>
                    <CardTitle className="heading-2">{featuredPost.title}</CardTitle>
                    <CardDescription className="body-large">
                      {featuredPost.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="body-small text-gray-600">{featuredPost.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="body-small text-gray-600">{formatDate(featuredPost.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="body-small text-gray-600">{featuredPost.readTime}</span>
                        </div>
                      </div>
                      <Button className="btn-primary">
                        Lexo Më Shumë
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Blog Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredPosts.slice(1).map((post) => (
                  <Card key={post.id} className="hover-scale cursor-pointer">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardHeader>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                      <CardTitle className="heading-4 hover:text-blue-600 transition-colors">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="body-medium">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-gray-500" />
                            <span className="body-small text-gray-600">{post.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span className="body-small text-gray-600">{post.readTime}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Lexo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* No Results */}
              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="heading-4 text-gray-600 mb-2">Nuk u gjetën artikuj</h3>
                  <p className="body-medium text-gray-500">
                    Provoni të ndryshoni termat e kërkimit ose kategorinë.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;