import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Wrench } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(result.error || 'Login failed');
    }
    
    setLoading(false);
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

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-amber-500 rounded-sm flex items-center justify-center">
              <Wrench className="w-8 h-8 text-black" />
            </div>
          </div>
          
          <h2 className="font-heading text-3xl font-bold text-white text-center mb-2">
            Welcome Back
          </h2>
          <p className="text-zinc-400 text-center mb-8">
            Sign in to access the workshop system
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-300">
                Username
              </Label>
              <Input
                id="username"
                data-testid="login-username-input"
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
                data-testid="login-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-900/50 border-zinc-800 focus:border-amber-500 focus:ring-amber-500 text-white"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              data-testid="login-submit-button"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider btn-glow"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-zinc-500">
              Default credentials: IgnitionLab Dynamics / IgnLabDyN@2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}