import React, { useState } from 'react';
import api from '../services/api';

interface LoginFormProps {
  onLoginSuccess?: (user: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.sendLoginOTP(email, subdomain);
      if (response.success) {
        setStep('otp');
        setResendCooldown(60);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.verifyLoginOTP(email, otpCode, subdomain);
      if (response.success) {
        if (onLoginSuccess) {
          onLoginSuccess(response.user);
        }
        window.location.href = '/dashboard';
      } else {
        setError('Invalid OTP code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    try {
      const response = await api.sendLoginOTP(email, subdomain);
      if (response.success) {
        setError('');
        setResendCooldown(60);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>BOCHABERI Construction Suite</h2>
      
      {error && (
        <div style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
          {error}
        </div>
      )}
      
      {step === 'email' && (
        <form onSubmit={handleRequestOTP}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              required
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Company Subdomain</label>
            <input
              type="text"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              required
              placeholder="yourcompany"
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {loading ? 'Sending OTP...' : 'Send Verification Code'}
          </button>
        </form>
      )}
      
      {step === 'otp' && (
        <form onSubmit={handleVerifyOTP}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Verification Code</label>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
              We sent a 6-digit code to <strong>{email}</strong>
            </p>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{ width: '100%', padding: '8px', fontSize: '24px', textAlign: 'center', letterSpacing: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
              required
              placeholder="000000"
              maxLength={6}
              autoFocus
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' }}
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendCooldown > 0 || loading}
              style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', color: '#0066cc', border: '1px solid #0066cc', borderRadius: '4px', cursor: 'pointer' }}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep('email')}
              disabled={loading}
              style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
            >
              Back
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LoginForm;