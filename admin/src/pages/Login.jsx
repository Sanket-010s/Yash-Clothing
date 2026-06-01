import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/login', data);
      const { access_token, user } = response.data;
      
      login(user, access_token);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-bg to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-primary mb-2">Yash</h1>
          <p className="text-neutral-text">Clothing Admin Panel</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-neutral-border shadow-lg p-8">
          <h2 className="text-2xl font-bold text-neutral-primary mb-6">Login</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-neutral-text" size={20} />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-neutral-text" size={20} />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                />
              </div>
              {errors.password && (
                <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-primary-gold hover:bg-primary-gold-hover disabled:opacity-50 text-neutral-primary font-semibold py-3 rounded-lg transition-colors"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-neutral-bg rounded-lg">
            <p className="text-xs text-neutral-text mb-2 font-semibold">Demo Credentials:</p>
            <p className="text-xs text-neutral-text">Email: admin@yash.com</p>
            <p className="text-xs text-neutral-text">Password: admin123</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-text mt-6">
          Admin access only • Custom T-Shirt Brand Platform v2.0
        </p>
      </div>
    </div>
  );
}
