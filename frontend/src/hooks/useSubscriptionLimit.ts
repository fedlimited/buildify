import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';

interface LimitCheckResult {
  allowed: boolean;
  current: number;
  max: number;
  remaining: number;
  message: string;
}

export function useSubscriptionLimit() {
  const [limits, setLimits] = useState({
    projects: { allowed: true, current: 0, max: 0, remaining: 0, message: '' },
    workers: { allowed: true, current: 0, max: 0, remaining: 0, message: '' },
    users: { allowed: true, current: 0, max: 0, remaining: 0, message: '' }
  });

  const checkLimit = async (type: 'project' | 'worker' | 'user'): Promise<LimitCheckResult> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/subscription/check-limit?type=${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error checking ${type} limit:`, error);
      return { allowed: true, current: 0, max: 0, remaining: 0, message: 'Unable to check limit' };
    }
  };

  const refreshLimits = async () => {
    const [projects, workers, users] = await Promise.all([
      checkLimit('project'),
      checkLimit('worker'),
      checkLimit('user')
    ]);
    setLimits({ projects, workers, users });
  };

  useEffect(() => {
    refreshLimits();
  }, []);

  return { limits, checkLimit, refreshLimits };
}