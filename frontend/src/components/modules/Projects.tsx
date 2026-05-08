import { UpgradeModal } from '@/components/UpgradeModal';
import { useState, useEffect } from 'react';
import { LeafletMapPicker } from '@/components/LeafletMapPicker';
import { GoogleMapPicker } from '@/components/GoogleMapPicker';
import { useAppStore } from '@/hooks/useAppStore';
import { Project } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, RefreshCw, MapPin, Navigation, Globe, Users, FileText, Calendar, Image, Eye, Search } from 'lucide-react';
import { useSubscriptionLimit } from '@/hooks/useSubscriptionLimit';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { ProjectStakeholders } from '@/components/projects/ProjectStakeholders';
import { ProjectTeamManager } from '@/components/projects/ProjectTeamManager';
import { ProjectLinkManager } from '@/components/projects/ProjectLinkManager';

const emptyProject: Omit<Project, 'id' | 'createdAt'> = {
  name: '', client: '', contractSum: 0, location: '', startDate: '', endDate: '', status: 'Active', projectManager: '', description: '',
  latitude: undefined, longitude: undefined, googleMapsUrl: undefined, locationAddress: undefined
};

export function Projects() {
  const { projects, income, addProject, updateProject, deleteProject, fetchProjects } = useAppStore();
  const { limits, refreshLimits } = useSubscriptionLimit();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyProject);
  const [locationDialog, setLocationDialog] = useState<Project | null>(null);
  const [locationAddress, setLocationAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [mapType, setMapType] = useState<'leaflet' | 'google'>('leaflet');
  const [activeTab, setActiveTab] = useState<'details' | 'stakeholders' | 'team' | 'documents' | 'meetings' | 'drawings' | 'photos' | 'reports'>('details');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  // Filter projects when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.location?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchTerm, projects]);

  const openNew = () => { 
    if (!limits.projects.allowed) {
      setShowUpgradeModal(true);
      return;
    }
    setEditing(null); 
    setForm(emptyProject); 
    setOpen(true); 
  };
  
  const openEdit = (p: Project) => { 
    setEditing(p); 
    setForm(p); 
    setOpen(true); 
  };

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
      refreshLimits();
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

  const openStakeholders = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('stakeholders');
  };

  const openTeam = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('team');
  };

  const openDocuments = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('documents');
  };

  const openMeetings = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('meetings');
  };

  const openDrawings = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('drawings');
  };

  const openPhotos = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('photos');
  };

  const openReports = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('reports');
  };

  const viewAsStakeholder = (project: Project) => {
    sessionStorage.setItem('stakeholderViewProjectId', project.id.toString());
    window.open(`/stakeholder/dashboard`, '_blank');
  };

  return (
    <div className="space-y-4 fade-in">

      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-48"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open('/stakeholder/dashboard', '_blank')}
            title="View stakeholder portal"
          >
            <Users size={14} className="mr-1" />
            Stakeholder Portal
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchProjects()}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
          <Button onClick={openNew} size="sm"><Plus size={16} className="mr-1" />Add Project</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
            {searchTerm ? (
              <>
                <Search size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No projects matching "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-amber-500 hover:underline"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <Building2 size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No projects found</p>
                <Button onClick={openNew} className="mt-4">Create your first project</Button>
              </>
            )}
          </div>
        ) : (
          filteredProjects.map(p => {
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
                
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground truncate flex-1">
                    {p.locationAddress || p.location || 'No location set'}
                  </p>
                  <button
                    onClick={() => openLocationDialog(p)}
                    className="text-blue-500 hover:text-blue-700 flex items-center gap-1 ml-2 flex-shrink-0"
                    title="Set or view site location"
                  >
                    <MapPin size={14} />
                    <span className="text-xs">{p.latitude ? 'View/Update' : 'Set'} Site Location</span>
                  </button>
                </div>

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

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => openEdit(p)}>
                      <Pencil size={14} className="mr-1" />Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => openStakeholders(p)}>
                      <Users size={12} className="mr-1" />
                      Stakeholders
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => openTeam(p)}>
                      <Users size={12} className="mr-1" />
                      Team
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => openDocuments(p)}>
                      <FileText size={12} className="mr-1" />
                      Documents
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => openMeetings(p)}>
                      <Calendar size={12} className="mr-1" />
                      Meetings
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => openDrawings(p)}>
                      <FileText size={12} className="mr-1" />
                      Drawings
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => openPhotos(p)}>
                      <Image size={12} className="mr-1" />
                      Photos
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => openReports(p)}>
                      <FileText size={12} className="mr-1" />
                      Reports
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30" 
                      onClick={() => viewAsStakeholder(p)}
                    >
                      <Eye size={12} className="mr-1" />
                      View as Stakeholder
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Project Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          aria-describedby="project-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Project' : 'New Project'}</DialogTitle>
            <p id="project-dialog-description" className="text-sm text-muted-foreground mt-1">
              {editing ? 'Update the project details below' : 'Fill in the project information below'}
            </p>
          </DialogHeader>
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

      {/* Location Dialog with Leaflet Map */}
      <Dialog open={!!locationDialog} onOpenChange={() => setLocationDialog(null)}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          aria-describedby="location-dialog-description"
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Set Project Location - {locationDialog?.name}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant={mapType === 'leaflet' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setMapType('leaflet')}
                  className="text-xs"
                >
                  OpenStreetMap
                </Button>
                <Button 
                  variant={mapType === 'google' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setMapType('google')}
                  className="text-xs"
                >
                  Google Maps
                </Button>
              </div>
            </div>
            <p id="location-dialog-description" className="text-sm text-muted-foreground mt-1">
              {mapType === 'leaflet' 
                ? 'Click anywhere on the map to set the exact project site location' 
                : 'Click on map to set marker | Use drawing tools (top-center) to draw site boundary | Toggle Satellite for aerial view'}
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {locationDialog && (
              <>
                {mapType === 'leaflet' && (
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
                {mapType === 'google' && (
                  <GoogleMapPicker
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
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setLocationDialog(null)}>Cancel</Button>
              <Button onClick={saveProjectLocation}>Save Location</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitType="project"
        current={limits.projects.current}
        max={limits.projects.max}
      />

      {/* Stakeholders Management Dialog */}
      <Dialog open={activeTab === 'stakeholders' && !!selectedProject} onOpenChange={() => {
        setActiveTab('details');
        setSelectedProject(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Stakeholders - {selectedProject?.name}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Invite and manage clients, consultants, and other stakeholders for this project
            </p>
          </DialogHeader>
          {selectedProject && (
            <ProjectStakeholders 
              projectId={selectedProject.id} 
              projectName={selectedProject.name} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Team Management Dialog */}
      <Dialog open={activeTab === 'team' && !!selectedProject} onOpenChange={() => {
        setActiveTab('details');
        setSelectedProject(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Team - {selectedProject?.name}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage project consultants, engineers, and key personnel
            </p>
          </DialogHeader>
          {selectedProject && (
            <ProjectTeamManager 
              projectId={selectedProject.id} 
              projectName={selectedProject.name} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Documents Dialog */}
      <Dialog open={activeTab === 'documents' && !!selectedProject} onOpenChange={() => {
        setActiveTab('details');
        setSelectedProject(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Documents - {selectedProject?.name}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Share Google Drive links for project documents
            </p>
          </DialogHeader>
          {selectedProject && (
            <ProjectLinkManager 
              projectId={selectedProject.id} 
              projectName={selectedProject.name}
              linkType="document"
              title="Documents"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Meetings Dialog */}
      <Dialog open={activeTab === 'meetings' && !!selectedProject} onOpenChange={() => {
        setActiveTab('details');
        setSelectedProject(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Meeting Minutes - {selectedProject?.name}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Share Google Drive links for meeting minutes
            </p>
          </DialogHeader>
          {selectedProject && (
            <ProjectLinkManager 
              projectId={selectedProject.id} 
              projectName={selectedProject.name}
              linkType="meeting"
              title="Meeting Minutes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Drawings Dialog */}
      <Dialog open={activeTab === 'drawings' && !!selectedProject} onOpenChange={() => {
        setActiveTab('details');
        setSelectedProject(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Drawings - {selectedProject?.name}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Share Google Drive links for architectural and engineering drawings
            </p>
          </DialogHeader>
          {selectedProject && (
            <ProjectLinkManager 
              projectId={selectedProject.id} 
              projectName={selectedProject.name}
              linkType="drawing"
              title="Drawings"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Photos Dialog */}
      <Dialog open={activeTab === 'photos' && !!selectedProject} onOpenChange={() => {
        setActiveTab('details');
        setSelectedProject(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Photos - {selectedProject?.name}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Share Google Drive links for project photos
            </p>
          </DialogHeader>
          {selectedProject && (
            <ProjectLinkManager 
              projectId={selectedProject.id} 
              projectName={selectedProject.name}
              linkType="photo"
              title="Photos"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog open={activeTab === 'reports' && !!selectedProject} onOpenChange={() => {
        setActiveTab('details');
        setSelectedProject(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Reports - {selectedProject?.name}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Share Google Drive links for project reports
            </p>
          </DialogHeader>
          {selectedProject && (
            <ProjectLinkManager 
              projectId={selectedProject.id} 
              projectName={selectedProject.name}
              linkType="report"
              title="Reports"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}