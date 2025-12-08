import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Wrench } from 'lucide-react';
import api from '../lib/api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', {
        username,
        password,
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Left side - Image */}
      <div 
        className="hidden lg:block lg:w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1654157925394-4b7809721149?crop=entropy&cs=srgb&fm=jpg&q=85)'
        }}
      >
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative h-full flex flex-col justify-end p-12">
          <h1 className="font-heading text-5xl font-black text-white mb-4 tracking-tighter">
            IgnitionLab<br />Dynamics
          </h1>
          <p className="text-zinc-400 text-lg">
            Professional ECU Tuning & Performance Workshop Management
          </p>
        </div>
      </div>

      {/* Right side - Register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-amber-500 rounded-sm flex items-center justify-center">
              <Wrench className="w-8 h-8 text-black" />
            </div>
          </div>
          
          <h2 className="font-heading text-3xl font-bold text-white text-center mb-2">
            Create Account
          </h2>
          <p className="text-zinc-400 text-center mb-8">
            Register to access the workshop system
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-300">
                Username
              </Label>
              <Input
                id="username"
                data-testid="register-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-zinc-900/50 border-zinc-800 focus:border-amber-500 focus:ring-amber-500 text-white"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Password
              </Label>
              <Input
                id="password"
                data-testid="register-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-900/50 border-zinc-800 focus:border-amber-500 focus:ring-amber-500 text-white"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-300">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                data-testid="register-confirm-password-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-zinc-900/50 border-zinc-800 focus:border-amber-500 focus:ring-amber-500 text-white"
                placeholder="Confirm your password"
                required
              />
            </div>

            <Button
              type="submit"
              data-testid="register-submit-button"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider btn-glow"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-amber-500 hover:text-amber-400 font-semibold"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
