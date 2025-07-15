import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Users, CheckCircle, XCircle, Clock, BarChart3, BookOpen, MessageCircle } from 'lucide-react';
import ChatManagement from './ChatManagement';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseURL = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch dashboard statistics
      const statsResponse = await fetch(`${baseURL}/api/admin/dashboard-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch pending users
      const pendingResponse = await fetch(`${baseURL}/api/admin/pending-users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingUsers(pendingData);
      }

      // Fetch all users
      const usersResponse = await fetch(`${baseURL}/api/admin/all-users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setAllUsers(usersData);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Gabim në ngarkimin e të dhënave');
      setLoading(false);
    }
  };

  const handleUserApproval = async (userId, approved) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/admin/approve-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId, approved })
      });

      if (response.ok) {
        // Refresh data after approval
        fetchDashboardData();
        const action = approved ? 'aprovuar' : 'refuzuar';
        alert(`Përdoruesi u ${action} me sukses!`);
      } else {
        alert('Gabim në aprovimin e përdoruesit');
      }
    } catch (err) {
      console.error('Error approving user:', err);
      alert('Gabim në aprovimin e përdoruesit');
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/admin/toggle-user-status/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchDashboardData();
        alert('Statusi i përdoruesit u ndryshua me sukses!');
      } else {
        alert('Gabim në ndryshimin e statusit');
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert('Gabim në ndryshimin e statusit');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Duke ngarkuar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
        <Button onClick={fetchDashboardData} variant="outline">
          Përfreskoni të dhënat
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Përdorues</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Në pritje aprovimi</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_users || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Përdorues Aktivë</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active_users || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shërbime</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_services || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Users */}
      {pendingUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Përdorues që presin aprovim</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{user.role}</Badge>
                      {user.company && <span className="text-sm text-gray-500">{user.company}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUserApproval(user.id, true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprovo
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleUserApproval(user.id, false)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Refuzo
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Users Management */}
      <Card>
        <CardHeader>
          <CardTitle>Menaxhimi i Përdoruesve</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{user.role}</Badge>
                    {user.is_approved ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Aprovuar
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Në pritje</Badge>
                    )}
                    {user.is_active ? (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Aktiv
                      </Badge>
                    ) : (
                      <Badge variant="outline">Joaktiv</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.is_active ? 'Çaktivizon' : 'Aktivizoi'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;