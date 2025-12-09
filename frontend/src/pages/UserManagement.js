import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import api from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Users, Shield, Plus, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'technician',
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      toast.success('User created successfully');
      setDialogOpen(false);
      setFormData({ username: '', password: '', role: 'technician' });
      fetchUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error(error.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <Card className="bg-zinc-900/50 border-zinc-800 p-12 text-center">
          <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-400 mb-2">Access Denied</h3>
          <p className="text-zinc-500">This page is only accessible to administrators</p>
        </Card>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center text-zinc-400">Loading...</div>
      </DashboardLayout>
    );
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'technician':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'viewer':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
              User Management
            </h1>
            <p className="text-zinc-400">Manage user accounts and permissions</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="create-user-button"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider btn-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl font-bold text-white">
                  Create New User
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="username" className="text-zinc-300">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    data-testid="user-username-input"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-zinc-300">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    data-testid="user-password-input"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="role" className="text-zinc-300">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="admin" className="text-white">Admin</SelectItem>
                      <SelectItem value="technician" className="text-white">Technician</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  data-testid="submit-user-button"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider btn-glow"
                >
                  Create User
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((usr) => (
            <Card
              key={usr.id}
              data-testid="user-card"
              className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-sm flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-500" />
                </div>
                <Badge className={getRoleBadgeColor(usr.role)}>
                  {usr.role}
                </Badge>
              </div>

              <h3 className="font-heading text-xl font-bold text-white mb-2">
                {usr.username}
              </h3>

              <p className="text-xs text-zinc-500 mb-4">
                Created: {formatDate(usr.created_at)}
              </p>

              <div className="flex space-x-2">
                <Select
                  value={usr.role}
                  onValueChange={(value) => handleUpdateRole(usr.id, value)}
                >
                  <SelectTrigger className="flex-1 bg-zinc-800/50 border-zinc-700 text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="admin" className="text-white">Admin</SelectItem>
                    <SelectItem value="technician" className="text-white">Technician</SelectItem>
                    <SelectItem value="viewer" className="text-white">Viewer</SelectItem>
                  </SelectContent>
                </Select>

                {usr.username !== 'IgnitionLab Dynamics' && (
                  <Button
                    onClick={() => handleDeleteUser(usr.id)}
                    data-testid="delete-user-button"
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <Card className="bg-zinc-900/50 border-zinc-800 p-12 text-center">
            <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-400 mb-2">No users found</h3>
            <p className="text-zinc-500">Create your first user to get started</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
