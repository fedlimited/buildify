import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Building2, Mail, Phone, MapPin, Key, User, Globe, Sparkles, Shield, Rocket, Star } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface RegisterProps {
  onBackToLogin?: () => void;
}

export function Register({ onBackToLogin }: RegisterProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    subdomain: '',
    email: '',
    phone: '',
    address: '',
    kra_pin: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    confirm_password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'subdomain') {
      const formatted = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setForm({ ...form, subdomain: formatted });
    } else {
      setForm({ ...form, [id]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.admin_password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (form.admin_password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (form.subdomain.length < 3) {
      setError('Subdomain must be at least 3 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      name: form.name,
      subdomain: form.subdomain,
      email: form.email,
      phone: form.phone,
      address: form.address,
      kra_pin: form.kra_pin.toUpperCase(),
      admin_name: form.admin_name,
      admin_email: form.admin_email,
      admin_password: form.admin_password
    };

    try {
      const response = await fetch(`${API_BASE_URL}/companies/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || '';
        if (errorMsg.includes('subdomain') || errorMsg.includes('exists')) {
          throw new Error('Subdomain already taken');
        } else if (errorMsg.includes('email')) {
          throw new Error('Email already registered');
        } else {
          throw new Error('Check details and try again');
        }
      }

      setSuccess(`Welcome! Your company "${form.name}" has been registered. Redirecting...`);

      setTimeout(() => {
        if (onBackToLogin) {
          onBackToLogin();
        } else {
          navigate('/login', { state: { subdomain: form.subdomain, email: form.admin_email } });
        }
      }, 3000);

    } catch (err: any) {
      const message = err.message || '';
      if (message.includes('network') || message.includes('fetch')) {
        setError('Check your internet connection');
      } else {
        setError(message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Valid = form.name && form.subdomain;
  const isStep2Valid = form.admin_name && form.admin_email && form.admin_password && form.confirm_password;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Form */}
          <div>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl">
              <CardHeader className="text-center border-b border-white/10">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Building2 size={32} className="text-amber-500" />
                </div>
                <CardTitle className="text-3xl font-bold text-white">Register Your Company</CardTitle>
                <CardDescription className="text-slate-400 text-base mt-2">
                  Join the world's best construction platform
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Step Indicator */}
                <div className="flex justify-between mb-8">
                  <div className="flex-1 text-center">
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${step >= 1 ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      1
                    </div>
                    <span className={`text-xs font-medium ${step >= 1 ? 'text-amber-400' : 'text-slate-500'}`}>Company Details</span>
                  </div>
                  <div className="flex-1 text-center">
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${step >= 2 ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      2
                    </div>
                    <span className={`text-xs font-medium ${step >= 2 ? 'text-amber-400' : 'text-slate-500'}`}>Admin Account</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {step === 1 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-slate-300 flex items-center gap-2 mb-2">Company Name *</Label>
                        <Input
                          id="name"
                          placeholder="Acme Construction Ltd"
                          value={form.name}
                          onChange={handleChange}
                          required
                          className="bg-black/50 border-slate-700 text-white"
                          autoFocus
                        />
                      </div>

                      <div>
                        <Label htmlFor="subdomain" className="text-slate-300 flex items-center gap-2 mb-2">Your URL *</Label>
                        <div className="flex">
                          <Input
                            id="subdomain"
                            placeholder="acme"
                            value={form.subdomain}
                            onChange={handleChange}
                            required
                            className="rounded-r-none bg-black/50 border-slate-700 text-white"
                          />
                          <span className="inline-flex items-center px-3 bg-slate-800 border border-l-0 border-slate-700 rounded-r-md text-sm text-slate-400">
                            .bochi.ke
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email" className="text-slate-300 flex items-center gap-2 mb-2">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="info@acme.com"
                            value={form.email}
                            onChange={handleChange}
                            className="bg-black/50 border-slate-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-slate-300 flex items-center gap-2 mb-2">Phone</Label>
                          <Input
                            id="phone"
                            placeholder="+254 700 000 000"
                            value={form.phone}
                            onChange={handleChange}
                            className="bg-black/50 border-slate-700 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address" className="text-slate-300 flex items-center gap-2 mb-2">Address</Label>
                        <Input
                          id="address"
                          placeholder="Nairobi, Kenya"
                          value={form.address}
                          onChange={handleChange}
                          className="bg-black/50 border-slate-700 text-white"
                        />
                      </div>

                      <div>
                        <Label htmlFor="kra_pin" className="text-slate-300">KRA PIN (Optional)</Label>
                        <Input
                          id="kra_pin"
                          placeholder="P051012345Z"
                          value={form.kra_pin}
                          onChange={handleChange}
                          className="bg-black/50 border-slate-700 text-white"
                        />
                      </div>

                      <Button
                        type="button"
                        className="w-full mt-4 bg-amber-500 hover:bg-amber-600"
                        onClick={() => setStep(2)}
                        disabled={!isStep1Valid}
                      >
                        Continue
                      </Button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="admin_name" className="text-slate-300 flex items-center gap-2 mb-2">Full Name *</Label>
                        <Input
                          id="admin_name"
                          placeholder="John Doe"
                          value={form.admin_name}
                          onChange={handleChange}
                          required
                          className="bg-black/50 border-slate-700 text-white"
                          autoFocus
                        />
                      </div>

                      <div>
                        <Label htmlFor="admin_email" className="text-slate-300 flex items-center gap-2 mb-2">Admin Email *</Label>
                        <Input
                          id="admin_email"
                          type="email"
                          placeholder="admin@acme.com"
                          value={form.admin_email}
                          onChange={handleChange}
                          required
                          className="bg-black/50 border-slate-700 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="admin_password" className="text-slate-300 flex items-center gap-2 mb-2">Password *</Label>
                          <Input
                            id="admin_password"
                            type="password"
                            placeholder="********"
                            value={form.admin_password}
                            onChange={handleChange}
                            required
                            className="bg-black/50 border-slate-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirm_password" className="text-slate-300">Confirm Password *</Label>
                          <Input
                            id="confirm_password"
                            type="password"
                            placeholder="********"
                            value={form.confirm_password}
                            onChange={handleChange}
                            required
                            className="bg-black/50 border-slate-700 text-white"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 border-slate-600 text-white hover:bg-slate-800"
                          onClick={() => setStep(1)}
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-amber-500 hover:bg-amber-600"
                          disabled={isLoading || !isStep2Valid}
                        >
                          {isLoading ? 'Creating Account...' : 'Start Free Trial'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2">
                      <CheckCircle size={16} />
                      <span>{success}</span>
                    </div>
                  )}
                </form>

                <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                  <p className="text-xs text-slate-500">
                    By registering, you agree to our{' '}
                    <a href="/terms" className="text-amber-400 hover:underline">Terms</a> and{' '}
                    <a href="/privacy" className="text-amber-400 hover:underline">Privacy</a>
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Already have an account?{' '}
                    <button
                      onClick={() => {
                        if (onBackToLogin) {
                          onBackToLogin();
                        } else {
                          navigate('/login');
                        }
                      }}
                      className="text-amber-400 hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Benefits */}
          <div className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-center p-6">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full mb-4">
                <Globe size={14} className="text-amber-400" />
                <span className="text-amber-400 text-xs font-medium">Trusted Worldwide</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Best Construction
                <span className="block text-amber-400">Software Platform</span>
              </h2>
              <p className="text-slate-400 text-sm">Join 500+ construction companies</p>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-4 text-center">
                <p className="text-2xl font-bold text-white">40%</p>
                <p className="text-xs text-slate-400">Cost Reduction</p>
              </Card>
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-4 text-center">
                <p className="text-2xl font-bold text-white">20h</p>
                <p className="text-xs text-slate-400">Weekly Saved</p>
              </Card>
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-4 text-center">
                <p className="text-2xl font-bold text-white">99.9%</p>
                <p className="text-xs text-slate-400">Accuracy</p>
              </Card>
            </div>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                Why Choose BOCHI
              </h3>
              <div className="space-y-2">
                {["Save 20+ hours weekly", "Reduce costs by 40%", "Real-time insights", "Stakeholder portal"].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-amber-400" />
                    <span className="text-slate-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-5 text-center">
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-white font-medium">Rated 4.9/5</p>
              <p className="text-xs text-slate-400">by Construction Professionals</p>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Shield size={14} className="text-amber-400" />
                <span className="text-sm text-white">14-day free trial</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">No credit card required</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}