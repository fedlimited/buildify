import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { Loader2, CheckCircle, XCircle, Trash2, Star, RefreshCw } from 'lucide-react';

export function AdminTestimonials() {
  const navigate = useNavigate();
  const { authUser } = useAppStore();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authUser && !authUser.isSuperAdmin) navigate('/dashboard');
  }, [authUser, navigate]);

  useEffect(() => { fetchTestimonials(); }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const r = await fetch('https://buildify-backend-kye8.onrender.com/api/super-admin/testimonials', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await r.json();
      setTestimonials(data);
    } catch (err) { setError('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id: number, approve: boolean) => {
    const token = localStorage.getItem('token');
    await fetch(`https://buildify-backend-kye8.onrender.com/api/super-admin/testimonials/${id}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ is_approved: approve })
    });
    fetchTestimonials();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this testimonial permanently?')) return;
    const token = localStorage.getItem('token');
    await fetch(`https://buildify-backend-kye8.onrender.com/api/super-admin/testimonials/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchTestimonials();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground text-sm">Approve, reject, or delete user testimonials</p>
        </div>
        <button onClick={fetchTestimonials} className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-muted">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4">{error}</div>}

      <div className="grid gap-4">
        {testimonials.map(t => (
          <div key={t.id} className={`bg-card rounded-xl border p-5 ${t.is_approved ? 'border-green-500/30' : 'border-amber-500/30'}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{t.name}</span>
                  {t.role && <span className="text-xs text-muted-foreground">• {t.role}</span>}
                  {t.company && <span className="text-xs text-muted-foreground">• {t.company}</span>}
                </div>
                <div className="flex gap-1 mb-2">
                  {[...Array(t.rating || 5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-muted-foreground">"{t.text}"</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(t.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {t.is_approved ? (
                  <button onClick={() => handleApprove(t.id, false)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg" title="Reject">
                    <XCircle className="w-5 h-5" />
                  </button>
                ) : (
                  <button onClick={() => handleApprove(t.id, true)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg" title="Approve">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
                <button onClick={() => handleDelete(t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mt-2">
              {t.is_approved ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Approved</span>
              ) : (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending</span>
              )}
            </div>
          </div>
        ))}
        {testimonials.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No testimonials yet.</p>
        )}
      </div>
    </div>
  );
}