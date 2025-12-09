import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { toast } from 'sonner';
import { User, Lock, Save } from 'lucide-react';

export default function Profile() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [usernameData, setUsernameData] = useState({
    newUsername: '',
    password: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    
    if (!usernameData.newUsername.trim()) {
      toast.error('Please enter a new username');
      return;
    }
    
    if (!usernameData.password) {
      toast.error('Please enter your current password');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/auth/update-username', {
        new_username: usernameData.newUsername,
        password: usernameData.password
      });
      
      // Re-login with new username
      const loginResponse = await api.post('/auth/login', {
        username: usernameData.newUsername,
        password: usernameData.password
      });
      
      login(loginResponse.data);
      toast.success('Username updated successfully');
      setUsernameData({ newUsername: '', password: '' });
    } catch (error) {
      console.error('Failed to update username:', error);
      toast.error(error.response?.data?.detail || 'Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/update-password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Failed to update password:', error);
      toast.error(error.response?.data?.detail || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="font-heading text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
            Profile Settings
          </h1>
          <p className="text-zinc-400">Manage your account settings</p>
        </div>

        {/* Current User Info */}
        <Card className="bg-zinc-900/50 border-zinc-800 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-sm flex items-center justify-center">
              <User className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.username}</h2>
              <p className="text-sm text-zinc-400">
                Role: <span className="text-amber-500 uppercase font-medium">{user?.role}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Change Username */}
        <Card className="bg-zinc-900/50 border-zinc-800 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-sm flex items-center justify-center">
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Change Username</h3>
              <p className="text-sm text-zinc-400">Update your account username</p>
            </div>
          </div>

          <form onSubmit={handleUsernameChange} className="space-y-4">
            <div>
              <Label htmlFor="newUsername" className="text-zinc-300">
                New Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newUsername"
                type="text"
                value={usernameData.newUsername}
                onChange={(e) => setUsernameData({ ...usernameData, newUsername: e.target.value })}
                className="bg-zinc-950/50 border-zinc-800 focus:border-blue-500 text-white"
                placeholder="Enter new username"
                required
              />
            </div>

            <div>
              <Label htmlFor="usernamePassword" className="text-zinc-300">
                Current Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="usernamePassword"
                type="password"
                value={usernameData.password}
                onChange={(e) => setUsernameData({ ...usernameData, password: e.target.value })}
                className="bg-zinc-950/50 border-zinc-800 focus:border-blue-500 text-white"
                placeholder="Confirm with your password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold uppercase tracking-wider"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Updating...' : 'Update Username'}
            </Button>
          </form>
        </Card>

        {/* Change Password */}
        <Card className="bg-zinc-900/50 border-zinc-800 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-sm flex items-center justify-center">
              <Lock className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Change Password</h3>
              <p className="text-sm text-zinc-400">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="text-zinc-300">
                Current Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="bg-zinc-950/50 border-zinc-800 focus:border-green-500 text-white"
                placeholder="Enter current password"
                required
              />
            </div>

            <div>
              <Label htmlFor="newPassword" className="text-zinc-300">
                New Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="bg-zinc-950/50 border-zinc-800 focus:border-green-500 text-white"
                placeholder="Enter new password (min 6 characters)"
                required
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-zinc-300">
                Confirm New Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="bg-zinc-950/50 border-zinc-800 focus:border-green-500 text-white"
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-bold uppercase tracking-wider"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
