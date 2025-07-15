import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { mockBlogPosts } from '../data/mock';

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Të gjitha', count: mockBlogPosts.length },
    { id: 'tutorial', label: 'Tutorial', count: 2 },
    { id: 'best-practices', label: 'Best Practices', count: 1 },
    { id: 'case-study', label: 'Case Study', count: 0 },
    { id: 'news', label: 'Lajme', count: 0 }
  ];

  const filteredPosts = mockBlogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           post.category.toLowerCase().replace(' ', '-') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = mockBlogPosts[0];

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
                      {mockBlogPosts.slice(0, 3).map((post) => (
                        <div key={post.id} className="space-y-2">
                          <h4 className="body-medium font-medium line-clamp-2">
                            {post.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span className="body-small">{post.date}</span>
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
                        <span className="body-small text-gray-600">{featuredPost.date}</span>
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

              {/* Blog Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="hover-scale">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardHeader>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                      <CardTitle className="heading-4">{post.title}</CardTitle>
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
                        <Link to={`/blog/${post.id}`}>
                          <Button variant="outline" size="sm">
                            Lexo
                          </Button>
                        </Link>
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