import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Edit, Trash2, Plus, Star, Save } from 'lucide-react';

// Backend API URL
const API_URL = 'https://buildify-backend-kye8.onrender.com';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  text: string;
  edited_text: string | null;
  rating: number;
  display_order: number;
  is_approved: boolean;
  display_location: string;
  created_at: string;
}

export function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [form, setForm] = useState({
    name: '',
    role: '',
    company: '',
    text: '',
    edited_text: '',
    rating: 5,
    display_order: 0,
    is_approved: true,
    display_location: 'both'
  });

  const fetchTestimonials = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching testimonials from:', `${API_URL}/api/testimonials/admin/all`);
      const res = await fetch(`${API_URL}/api/testimonials/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Response:', data);
      if (data.success) setTestimonials(data.testimonials);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editing 
        ? `${API_URL}/api/testimonials/admin/${editing.id}` 
        : `${API_URL}/api/testimonials/admin`;
      const method = editing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        fetchTestimonials();
        setDialogOpen(false);
        setEditing(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      role: '',
      company: '',
      text: '',
      edited_text: '',
      rating: 5,
      display_order: 0,
      is_approved: true,
      display_location: 'both'
    });
  };

  const handleApprove = async (id: number, is_approved: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/testimonials/admin/${id}/approve`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_approved })
      });
      fetchTestimonials();
    } catch (error) {
      console.error('Error approving testimonial:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this testimonial? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/api/testimonials/admin/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchTestimonials();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditing(testimonial);
    setForm({
      name: testimonial.name,
      role: testimonial.role || '',
      company: testimonial.company || '',
      text: testimonial.text,
      edited_text: testimonial.edited_text || '',
      rating: testimonial.rating,
      display_order: testimonial.display_order || 0,
      is_approved: testimonial.is_approved,
      display_location: testimonial.display_location || 'both'
    });
    setDialogOpen(true);
  };

  const getLocationBadge = (location: string) => {
    switch(location) {
      case 'both': return <Badge className="bg-purple-500">🌐 Both Pages</Badge>;
      case 'landing': return <Badge className="bg-blue-500">🏠 Landing Only</Badge>;
      case 'login': return <Badge className="bg-amber-500">🔐 Login Only</Badge>;
      case 'hidden': return <Badge variant="secondary">🙈 Hidden</Badge>;
      default: return <Badge variant="outline">{location}</Badge>;
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    if (activeTab === 'all') return true;
    if (activeTab === 'approved') return t.is_approved;
    if (activeTab === 'pending') return !t.is_approved;
    return true;
  });

  if (loading) return <div className="text-center py-8">Loading testimonials...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Testimonials Management</h2>
          <p className="text-sm text-muted-foreground">Manage customer testimonials across Landing and Login pages</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus size={14} className="mr-1" /> Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Name *</label>
                  <Input
                    placeholder="Customer name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Role</label>
                  <Input
                    placeholder="e.g., Project Manager"
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Company</label>
                  <Input
                    placeholder="Company name"
                    value={form.company}
                    onChange={e => setForm({ ...form, company: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Rating</label>
                  <div className="flex gap-1 items-center h-10">
                    {[1,2,3,4,5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setForm({ ...form, rating })}
                        className="focus:outline-none"
                      >
                        <Star size={24} className={form.rating >= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Original Testimonial *</label>
                <Textarea
                  placeholder="Full testimonial text"
                  value={form.text}
                  onChange={e => setForm({ ...form, text: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  Shortened Version (Optional)
                  <span className="text-xs text-muted-foreground ml-2">- If set, this appears on the website</span>
                </label>
                <Textarea
                  placeholder="Shortened version for display (recommended: 100-150 characters)"
                  value={form.edited_text}
                  onChange={e => setForm({ ...form, edited_text: e.target.value })}
                  rows={2}
                />
                {form.text && form.edited_text && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Shortened version will be shown instead of original
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Display Order</label>
                  <Input
                    type="number"
                    placeholder="0-100 (lower = higher priority)"
                    value={form.display_order}
                    onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={form.is_approved ? 'approved' : 'pending'}
                    onChange={e => setForm({ ...form, is_approved: e.target.value === 'approved' })}
                  >
                    <option value="approved">✅ Approved (Shows on website)</option>
                    <option value="pending">⏳ Pending Review (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Show on:</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2 p-3 rounded border cursor-pointer transition-all ${form.display_location === 'both' ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' : 'border-border'}`}>
                    <input
                      type="radio"
                      name="display_location"
                      value="both"
                      checked={form.display_location === 'both'}
                      onChange={e => setForm({ ...form, display_location: e.target.value })}
                      className="mr-2"
                    />
                    <div>
                      <div className="font-medium">🌐 Both Pages</div>
                      <div className="text-xs text-muted-foreground">Shows on Landing & Login</div>
                    </div>
                  </label>
                  
                  <label className={`flex items-center gap-2 p-3 rounded border cursor-pointer transition-all ${form.display_location === 'landing' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-border'}`}>
                    <input
                      type="radio"
                      name="display_location"
                      value="landing"
                      checked={form.display_location === 'landing'}
                      onChange={e => setForm({ ...form, display_location: e.target.value })}
                      className="mr-2"
                    />
                    <div>
                      <div className="font-medium">🏠 Landing Page Only</div>
                      <div className="text-xs text-muted-foreground">Marketing site only</div>
                    </div>
                  </label>
                  
                  <label className={`flex items-center gap-2 p-3 rounded border cursor-pointer transition-all ${form.display_location === 'login' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : 'border-border'}`}>
                    <input
                      type="radio"
                      name="display_location"
                      value="login"
                      checked={form.display_location === 'login'}
                      onChange={e => setForm({ ...form, display_location: e.target.value })}
                      className="mr-2"
                    />
                    <div>
                      <div className="font-medium">🔐 Login Page Only</div>
                      <div className="text-xs text-muted-foreground">Login screen only</div>
                    </div>
                  </label>
                  
                  <label className={`flex items-center gap-2 p-3 rounded border cursor-pointer transition-all ${form.display_location === 'hidden' ? 'border-gray-500 bg-gray-50 dark:bg-gray-800' : 'border-border'}`}>
                    <input
                      type="radio"
                      name="display_location"
                      value="hidden"
                      checked={form.display_location === 'hidden'}
                      onChange={e => setForm({ ...form, display_location: e.target.value })}
                      className="mr-2"
                    />
                    <div>
                      <div className="font-medium">🙈 Hidden</div>
                      <div className="text-xs text-muted-foreground">Not shown anywhere</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  <Save size={14} className="mr-1" />
                  {editing ? 'Update Testimonial' : 'Add Testimonial'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({testimonials.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({testimonials.filter(t => t.is_approved).length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({testimonials.filter(t => !t.is_approved).length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="space-y-3">
            {filteredTestimonials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No testimonials found
              </div>
            ) : (
              filteredTestimonials.map((t) => (
                <Card key={t.id} className={`${!t.is_approved ? 'opacity-70 border-yellow-500/30' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="font-semibold text-base">{t.name}</span>
                          {t.role && <span className="text-xs text-muted-foreground">({t.role})</span>}
                          {t.company && <span className="text-xs text-muted-foreground">- {t.company}</span>}
                          <div className="flex gap-0.5">
                            {[...Array(t.rating)].map((_, i) => (
                              <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          {getLocationBadge(t.display_location)}
                          {!t.is_approved && (
                            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                              ⏳ Pending Approval
                            </Badge>
                          )}
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Original: </span>
                            {t.text.length > 150 ? t.text.substring(0, 150) + '...' : t.text}
                          </p>
                          {t.edited_text && (
                            <p className="text-sm mt-1 text-green-600 dark:text-green-400">
                              <span className="text-muted-foreground">Display: </span>
                              {t.edited_text}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Order: {t.display_order || 0}</span>
                          <span>Submitted: {new Date(t.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 ml-4">
                        {!t.is_approved && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleApprove(t.id, true)}
                            title="Approve"
                            className="text-green-600"
                          >
                            <CheckCircle2 size={16} />
                          </Button>
                        )}
                        {t.is_approved && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleApprove(t.id, false)}
                            title="Reject"
                            className="text-red-600"
                          >
                            <XCircle size={16} />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(t)} title="Edit">
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(t.id)} 
                          title="Delete"
                          className="text-destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}