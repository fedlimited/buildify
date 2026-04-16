import { useState } from 'react';
import { LeafletMapPicker } from '@/components/LeafletMapPicker';
import { useAppStore } from '@/hooks/useAppStore';
import { Project } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, RefreshCw, MapPin, Navigation, Globe } from 'lucide-react';

const emptyProject: Omit<Project, 'id' | 'createdAt'> = {
  name: '', client: '', contractSum: 0, location: '', startDate: '', endDate: '', status: 'Active', projectManager: '', description: '',
  latitude: undefined, longitude: undefined, googleMapsUrl: undefined, locationAddress: undefined
};

export function Projects() {
  const { projects, income, addProject, updateProject, deleteProject, fetchProjects } = useAppStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyProject);
  const [locationDialog, setLocationDialog] = useState<Project | null>(null);
  const [locationAddress, setLocationAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const openNew = () => { setEditing(null); setForm(emptyProject); setOpen(true); };
  const openEdit = (p: Project) => { setEditing(p); setForm(p); setOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.client || !form.contractSum) return;
    try {
      if (editing) {
        await updateProject({ ...editing, ...form });
        await fetchProjects();
      } else {
        await addProject(form);
        await fetchProjects();
      }
      setOpen(false);
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this project? This cannot be undone.')) {
      try {
        await deleteProject(id);
        await fetchProjects();
        alert('Project deleted successfully!');
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const getProgress = (pid: number) => {
    const proj = projects.find(p => p.id === pid);
    if (!proj || proj.contractSum === 0) return 0;
    const received = income.filter(i => i.projectId === pid).reduce((s, i) => s + i.amountReceived, 0);
    return Math.min(100, (received / proj.contractSum) * 100);
  };

  // Location Functions
  const openLocationDialog = (project: Project) => {
    setLocationDialog(project);
    setLocationAddress(project.locationAddress || project.location || '');
    setLatitude(project.latitude?.toString() || '');
    setLongitude(project.longitude?.toString() || '');
  };

  const saveProjectLocation = async () => {
    if (!locationDialog) return;
    
    const updateData = {
      ...locationDialog,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      locationAddress: locationAddress,
      location: locationAddress || locationDialog.location
    };
    
    // Generate Google Maps URL
    if (latitude && longitude) {
      updateData.googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    } else if (locationAddress) {
      updateData.googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationAddress)}`;
    }
    
    try {
      await updateProject(updateData);
      await fetchProjects();
      setLocationDialog(null);
      alert('Location saved successfully!');
    } catch (error) {
      console.error('Failed to save location:', error);
      alert('Failed to save location');
    }
  };

  const openGoogleMaps = (project: Project) => {
    if (project.googleMapsUrl) {
      window.open(project.googleMapsUrl, '_blank');
    } else if (project.latitude && project.longitude) {
      window.open(`https://www.google.com/maps?q=${project.latitude},${project.longitude}`, '_blank');
    } else if (project.locationAddress) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.locationAddress)}`, '_blank');
    } else if (project.location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.location)}`, '_blank');
    } else {
      alert('No location set for this project');
    }
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchProjects()}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
          <Button onClick={openNew} size="sm"><Plus size={16} className="mr-1" />Add Project</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map(p => {
          const progress = getProgress(p.id);
          return (
            <div key={p.id} className="bg-card rounded-xl border border-border p-5 slide-up hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-card-foreground text-sm">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.client}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  p.status === 'Active' ? 'bg-success/10 text-success' :
                  p.status === 'Completed' ? 'bg-info/10 text-info' :
                  p.status === 'On Hold' ? 'bg-warning/10 text-warning' :
                  'bg-destructive/10 text-destructive'
                }`}>{p.status}</span>
              </div>
              
              {/* Location with Google Maps button */}
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground truncate flex-1">
                  {p.locationAddress || p.location || 'No location set'}
                </p>
                <button
                  onClick={() => openLocationDialog(p)}
                  className="text-blue-500 hover:text-blue-700 flex items-center gap-1 ml-2 flex-shrink-0"
                  title="Set location"
                >
                  <MapPin size={14} />
                  <span className="text-xs">{p.latitude ? 'Update' : 'Set'} Location</span>
                </button>
              </div>
              
              {/* Open in Google Maps button if location exists */}
              {(p.latitude || p.longitude || p.locationAddress || p.location) && (
                <button
                  onClick={() => openGoogleMaps(p)}
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 mb-2"
                >
                  <Navigation size={12} />
                  View on Google Maps
                </button>
              )}
              
              {/* Coordinates display if available */}
              {p.latitude && p.longitude && (
                <p className="text-xs text-muted-foreground mb-2">
                  📍 {p.latitude.toFixed(6)}, {p.longitude.toFixed(6)}
                </p>
              )}
              
              <p className="text-lg font-bold text-card-foreground mb-3">{formatCurrency(p.contractSum)}</p>
              
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground mb-3">
                <span>{formatDate(p.startDate)}</span>
                <span>{formatDate(p.endDate)}</span>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => openEdit(p)}>
                  <Pencil size={14} className="mr-1" />Edit
                </Button>
                <Button variant="outline" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Project Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Project' : 'New Project'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div><Label className="text-xs">Project Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label className="text-xs">Client *</Label><Input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} /></div>
            <div><Label className="text-xs">Contract Sum (KES) *</Label><Input type="number" value={form.contractSum || ''} onChange={e => setForm({ ...form, contractSum: Number(e.target.value) })} /></div>
            <div><Label className="text-xs">Location Address</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g., Westlands, Nairobi" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
              <div><Label className="text-xs">End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">Project Manager</Label><Input value={form.projectManager} onChange={e => setForm({ ...form, projectManager: e.target.value })} /></div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as Project['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Active', 'Completed', 'On Hold', 'Cancelled'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Dialog with Leaflet Map - REPLACED */}
      <Dialog open={!!locationDialog} onOpenChange={() => setLocationDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Set Project Location - {locationDialog?.name}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Click anywhere on the map to set the exact project site location
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {locationDialog && (
              <LeafletMapPicker
                onLocationSelect={(lat, lng, address) => {
                  setLatitude(lat.toString());
                  setLongitude(lng.toString());
                  setLocationAddress(address);
                }}
                initialLat={locationDialog.latitude}
                initialLng={locationDialog.longitude}
                initialAddress={locationDialog.locationAddress}
              />
            )}
            
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setLocationDialog(null)}>
                Cancel
              </Button>
              <Button onClick={saveProjectLocation}>
                Save Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}