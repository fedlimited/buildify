import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAppStore } from '@/hooks/useAppStore';
import { formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Calendar, Sun, Cloud, CloudRain, Wind, 
  Users, Truck, AlertTriangle, Save, RefreshCw, 
  Eye, Edit, Trash2, Plus, X, Printer, Building2, UserPlus,
  Droplets, Thermometer, CloudSun, CloudLightning, CloudFog, Snowflake
} from 'lucide-react';

// Weather options
const weatherOptions = [
  { 
    value: 'sunny', 
    label: 'Sunny', 
    icon: Sun, 
    description: 'Clear skies, bright sunshine',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  { 
    value: 'partly-cloudy', 
    label: 'Partly Cloudy', 
    icon: CloudSun, 
    description: 'Mix of sun and clouds',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  { 
    value: 'cloudy', 
    label: 'Cloudy', 
    icon: Cloud, 
    description: 'Overcast, no direct sun',
    color: 'text-gray-400',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  { 
    value: 'light-rain', 
    label: 'Light Rain', 
    icon: CloudRain, 
    description: 'Drizzle or light showers',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  { 
    value: 'heavy-rain', 
    label: 'Heavy Rain', 
    icon: Droplets, 
    description: 'Steady rain, poor visibility',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300'
  },
  { 
    value: 'windy', 
    label: 'Windy', 
    icon: Wind, 
    description: 'Strong winds',
    color: 'text-teal-500',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  { 
    value: 'stormy', 
    label: 'Stormy', 
    icon: CloudLightning, 
    description: 'Thunderstorms, lightning',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  { 
    value: 'foggy', 
    label: 'Foggy', 
    icon: CloudFog, 
    description: 'Low visibility due to fog',
    color: 'text-gray-400',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
];

interface Activity {
  id: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  workersCount: number;
  supervisor: string;
}

interface Delivery {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  supplier: string;
  time: string;
  receivedBy: string;
}

interface Incident {
  id: string;
  type: string;
  description: string;
  time: string;
  severity: string;
  action: string;
}

interface SiteWorker {
  id: string;
  name: string;
  role: string;
  checkIn: string;
  checkOut: string;
  isFromPayroll: boolean;
}

interface SiteSubcontractor {
  id: string;
  name: string;
  company: string;
  workersCount: number;
  task: string;
  checkIn: string;
  checkOut: string;
  contactPerson: string;
}

export function SiteDiaryModule() {
  const { 
    projects, 
    selectedProjectId, 
    siteDiaryEntries, 
    addSiteDiaryEntry, 
    updateSiteDiaryEntry, 
    deleteSiteDiaryEntry, 
    fetchSiteDiaryEntries, 
    workers, 
    workerCategories, 
    subcontractors,
    suppliers,
    fetchSuppliers
  } = useAppStore();
  
  const [open, setOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [projectId, setProjectId] = useState(selectedProjectId || 0);
  const [weatherCondition, setWeatherCondition] = useState('sunny');
  const [temperature, setTemperature] = useState(28);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [siteWorkers, setSiteWorkers] = useState<SiteWorker[]>([]);
  const [siteSubcontractors, setSiteSubcontractors] = useState<SiteSubcontractor[]>([]);
  const [workDone, setWorkDone] = useState('');
  const [plansTomorrow, setPlansTomorrow] = useState('');
  const [challenges, setChallenges] = useState('');
  
  // New item temporary state
  const [newActivity, setNewActivity] = useState({ description: '', location: '', startTime: '08:00', endTime: '17:00', workersCount: 1, supervisor: '' });
  const [newDelivery, setNewDelivery] = useState({ itemName: '', quantity: 1, unit: 'pieces', supplier: '', receivedBy: '' });
  const [newIncident, setNewIncident] = useState({ type: 'near-miss', description: '', severity: 'medium', action: '' });
  const [selectedWorker, setSelectedWorker] = useState('');
  const [customWorkerName, setCustomWorkerName] = useState('');
  const [workerCheckIn, setWorkerCheckIn] = useState('08:00');
  const [workerCheckOut, setWorkerCheckOut] = useState('17:00');
  const [showCustomWorker, setShowCustomWorker] = useState(false);
  
  // Subcontractor state
  const [selectedSubcontractor, setSelectedSubcontractor] = useState('');
  const [customSubcontractorName, setCustomSubcontractorName] = useState('');
  const [subcontractorWorkers, setSubcontractorWorkers] = useState(1);
  const [subcontractorTask, setSubcontractorTask] = useState('');
  const [subcontractorCheckIn, setSubcontractorCheckIn] = useState('08:00');
  const [subcontractorCheckOut, setSubcontractorCheckOut] = useState('17:00');
  const [showCustomSubcontractor, setShowCustomSubcontractor] = useState(false);
  
  // Supplier state for deliveries
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');

  // Load data when component mounts
  useEffect(() => {
    fetchSiteDiaryEntries();
  }, [fetchSiteDiaryEntries, selectedProjectId]);

  // Debug log
  useEffect(() => {
    console.log('Site Diary - Entries updated:', siteDiaryEntries.length);
    console.log('Entries:', siteDiaryEntries);
  }, [siteDiaryEntries]);

  const getProjectName = () => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || '';
  };

  const totalWorkers = siteWorkers.length + siteSubcontractors.reduce((sum, s) => sum + s.workersCount, 0) + activities.reduce((sum, a) => sum + a.workersCount, 0);

  // Worker functions
  const addPayrollWorker = () => {
    if (selectedWorker) {
      const worker = workers.find(w => w.id.toString() === selectedWorker);
      if (worker) {
        setSiteWorkers([...siteWorkers, {
          id: Date.now().toString(),
          name: worker.name,
          role: workerCategories.find(c => c.id === worker.categoryId)?.name || 'Worker',
          checkIn: workerCheckIn,
          checkOut: workerCheckOut,
          isFromPayroll: true
        }]);
        setSelectedWorker('');
      }
    }
  };

  const addCustomWorker = () => {
    if (customWorkerName) {
      setSiteWorkers([...siteWorkers, {
        id: Date.now().toString(),
        name: customWorkerName,
        role: 'Casual Worker',
        checkIn: workerCheckIn,
        checkOut: workerCheckOut,
        isFromPayroll: false
      }]);
      setCustomWorkerName('');
      setShowCustomWorker(false);
    }
  };

  const removeWorker = (id: string) => setSiteWorkers(siteWorkers.filter(w => w.id !== id));

  // Subcontractor functions
  const addExistingSubcontractor = () => {
    if (selectedSubcontractor) {
      const sub = subcontractors.find(s => s.id.toString() === selectedSubcontractor);
      if (sub) {
        setSiteSubcontractors([...siteSubcontractors, {
          id: Date.now().toString(),
          name: sub.name,
          company: sub.name,
          workersCount: subcontractorWorkers,
          task: subcontractorTask,
          checkIn: subcontractorCheckIn,
          checkOut: subcontractorCheckOut,
          contactPerson: sub.contactPerson || ''
        }]);
        setSelectedSubcontractor('');
        setSubcontractorWorkers(1);
        setSubcontractorTask('');
      }
    }
  };

  const addCustomSubcontractor = () => {
    if (customSubcontractorName) {
      setSiteSubcontractors([...siteSubcontractors, {
        id: Date.now().toString(),
        name: customSubcontractorName,
        company: customSubcontractorName,
        workersCount: subcontractorWorkers,
        task: subcontractorTask,
        checkIn: subcontractorCheckIn,
        checkOut: subcontractorCheckOut,
        contactPerson: ''
      }]);
      setCustomSubcontractorName('');
      setSubcontractorWorkers(1);
      setSubcontractorTask('');
      setShowCustomSubcontractor(false);
    }
  };

  const removeSubcontractor = (id: string) => setSiteSubcontractors(siteSubcontractors.filter(s => s.id !== id));

  // Activity functions
  const addActivity = () => {
    if (newActivity.description) {
      setActivities([...activities, { ...newActivity, id: Date.now().toString() }]);
      setNewActivity({ description: '', location: '', startTime: '08:00', endTime: '17:00', workersCount: 1, supervisor: '' });
    }
  };
  const removeActivity = (id: string) => setActivities(activities.filter(a => a.id !== id));

  // Delivery functions
  const removeDelivery = (id: string) => setDeliveries(deliveries.filter(d => d.id !== id));
  
  // Supplier selection handler
  const setNewDeliverySupplier = (value: string) => {
    if (value === '__new__') {
      setShowNewSupplier(true);
      setNewDelivery({ ...newDelivery, supplier: '' });
    } else {
      setShowNewSupplier(false);
      setNewDelivery({ ...newDelivery, supplier: value });
    }
  };
  
  // Add delivery with supplier handling
  const addDelivery = async () => {
    if (newDelivery.itemName && (newDelivery.supplier || (showNewSupplier && newSupplierName))) {
      const finalSupplier = showNewSupplier ? newSupplierName : newDelivery.supplier;
      
      // If this is a new supplier, optionally save to suppliers list
      if (showNewSupplier && newSupplierName) {
        try {
          // Check if supplier already exists
          const existingSupplier = suppliers.find(s => s.name?.toLowerCase() === newSupplierName.toLowerCase());
          if (!existingSupplier) {
            const newSupplier = await api.createSupplier({ name: newSupplierName, is_active: 1 });
            await fetchSuppliers();
            console.log('New supplier added:', newSupplier);
          }
        } catch (error) {
          console.error('Failed to add supplier:', error);
        }
      }
      
      setDeliveries([...deliveries, { 
        ...newDelivery, 
        id: Date.now().toString(), 
        time: new Date().toLocaleTimeString(),
        supplier: finalSupplier
      }]);
      
      // Reset form
      setNewDelivery({ itemName: '', quantity: 1, unit: 'pieces', supplier: '', receivedBy: '' });
      setShowNewSupplier(false);
      setNewSupplierName('');
    } else {
      alert('Please enter item name and select/enter supplier');
    }
  };

  // Incident functions
  const addIncident = () => {
    if (newIncident.description) {
      setIncidents([...incidents, { ...newIncident, id: Date.now().toString(), time: new Date().toLocaleTimeString() }]);
      setNewIncident({ type: 'near-miss', description: '', severity: 'medium', action: '' });
    }
  };
  const removeIncident = (id: string) => setIncidents(incidents.filter(i => i.id !== id));

  // Sync data from server
  const syncData = async () => {
    setIsSyncing(true);
    await fetchSiteDiaryEntries();
    setIsSyncing(false);
  };

  // Print function
  const printSiteDiary = (entry: any) => {
    const printWindow = window.open('', '_blank');
    const weather = weatherOptions.find(w => w.value === entry.weather?.condition) || weatherOptions[0];
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Site Diary - ${formatDate(entry.date)}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; margin: 0; color: #1a1a2e; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #1a56db; }
          .logo { font-size: 24px; font-weight: bold; color: #1a56db; }
          .title { font-size: 20px; font-weight: bold; margin-top: 5px; color: #374151; }
          .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; padding: 15px; background: #f3f4f6; border-radius: 8px; }
          .info-label { font-size: 11px; font-weight: bold; color: #6b7280; margin-bottom: 5px; text-transform: uppercase; }
          .info-value { font-size: 14px; font-weight: 500; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 16px; font-weight: bold; color: #1a56db; margin-bottom: 12px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
          th { background: #f9fafb; font-weight: 600; }
          .footer { margin-top: 30px; padding-top: 20px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">BOCHABERI Construction Suite</div>
          <div class="title">SITE DIARY REPORT</div>
        </div>

        <div class="info-grid">
          <div class="info-item"><div class="info-label">PROJECT</div><div class="info-value">${entry.projectName}</div></div>
          <div class="info-item"><div class="info-label">DATE</div><div class="info-value">${formatDate(entry.date)}</div></div>
          <div class="info-item"><div class="info-label">WEATHER</div><div class="info-value">${weather.label} • ${entry.weather?.temp || 28}°C</div></div>
        </div>

        <div class="section">
          <div class="section-title">👥 WORKERS ON SITE</div>
          <table>
            <thead><tr><th>Name</th><th>Role</th><th>Check In</th><th>Check Out</th></tr></thead>
            <tbody>
              ${entry.siteWorkers?.map((w: any) => `<tr><td>${w.name}</td><td>${w.role}</td><td>${w.checkIn}</td><td>${w.checkOut}</td></tr>`).join('') || '<tr><td colspan="4" style="text-align: center;">No workers recorded</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">🏗️ SUBCONTRACTORS ON SITE</div>
          <table>
            <thead><tr><th>Company</th><th>Task</th><th>Workers</th><th>Check In</th><th>Check Out</th></tr></thead>
            <tbody>
              ${entry.siteSubcontractors?.map((s: any) => `<tr><td>${s.name}</td><td>${s.task}</td><td>${s.workersCount}</td><td>${s.checkIn}</td><td>${s.checkOut}</td></tr>`).join('') || '<tr><td colspan="5" style="text-align: center;">No subcontractors recorded</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">📋 ACTIVITIES</div>
          <table>
            <thead><tr><th>Time</th><th>Location</th><th>Activity</th><th>Supervisor</th><th>Workers</th></tr></thead>
            <tbody>
              ${entry.activities?.map((a: any) => `<tr><td>${a.startTime}-${a.endTime}</td><td>${a.location}</td><td>${a.description}</td><td>${a.supervisor || '-'}</td><td>${a.workersCount}</td></tr>`).join('') || '<tr><td colspan="5" style="text-align: center;">No activities recorded</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">🚚 DELIVERIES</div>
          <table>
            <thead><tr><th>Item</th><th>Quantity</th><th>Supplier</th><th>Received By</th></tr></thead>
            <tbody>
              ${entry.deliveries?.map((d: any) => `<tr><td>${d.itemName}</td><td>${d.quantity} ${d.unit}</td><td>${d.supplier}</td><td>${d.receivedBy}</td></tr>`).join('') || '<tr><td colspan="4" style="text-align: center;">No deliveries recorded</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">⚠️ INCIDENTS</div>
          <table>
            <thead><tr><th>Type</th><th>Description</th><th>Action Taken</th></tr></thead>
            <tbody>
              ${entry.incidents?.map((i: any) => `<tr><td>${i.type}</td><td>${i.description}</td><td>${i.action || '-'}</td></tr>`).join('') || '<tr><td colspan="3" style="text-align: center;">No incidents recorded</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">📝 DAILY SUMMARY</div>
          <div style="margin-bottom: 10px;"><strong>Work Done:</strong> ${entry.summary?.workDone || 'N/A'}</div>
          <div style="margin-bottom: 10px;"><strong>Tomorrow's Plan:</strong> ${entry.summary?.plansTomorrow || 'N/A'}</div>
          <div><strong>Challenges:</strong> ${entry.summary?.challenges || 'N/A'}</div>
        </div>

        <div class="footer">
          Generated on ${new Date().toLocaleString()} | BOCHABERI Construction Suite
        </div>
      </body>
      </html>
    `;
    
    printWindow?.document.write(html);
    printWindow?.document.close();
    printWindow?.print();
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const entryData = {
        date,
        projectId,
        projectName: getProjectName(),
        weather: { condition: weatherCondition, temp: temperature },
        activities,
        deliveries,
        incidents,
        siteWorkers,
        siteSubcontractors,
        totalWorkers,
        summary: { workDone, plansTomorrow, challenges },
        status: 'Submitted'
      };
      
      if (editing) {
        await updateSiteDiaryEntry(editing.id, entryData);
      } else {
        await addSiteDiaryEntry(entryData);
      }
      await fetchSiteDiaryEntries();
      setOpen(false);
      resetForm();
      alert(editing ? 'Entry updated successfully!' : 'Entry saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setProjectId(selectedProjectId || 0);
    setWeatherCondition('sunny');
    setTemperature(28);
    setActivities([]);
    setDeliveries([]);
    setIncidents([]);
    setSiteWorkers([]);
    setSiteSubcontractors([]);
    setWorkDone('');
    setPlansTomorrow('');
    setChallenges('');
    setEditing(null);
    setActiveTab('basic');
  };












const openEdit = (entry: any) => {
  console.log('=== EDITING ENTRY ===');
  console.log('Entry data:', entry);
  
  setEditing(entry);
  setDate(entry.date || new Date().toISOString().split('T')[0]);
  setProjectId(entry.projectId || entry.project_id || 0);
  setWeatherCondition(entry.weather?.condition || 'sunny');
  setTemperature(entry.weather?.temp || 28);
  
  // Handle activities - ensure it's an array
  setActivities(Array.isArray(entry.activities) ? entry.activities : []);
  
  // Handle deliveries - ensure it's an array
  setDeliveries(Array.isArray(entry.deliveries) ? entry.deliveries : []);
  
  // Handle incidents - ensure it's an array
  setIncidents(Array.isArray(entry.incidents) ? entry.incidents : []);
  
  // Handle site workers - map fields if needed
  const workersData = Array.isArray(entry.siteWorkers) ? entry.siteWorkers : [];
  setSiteWorkers(workersData.map((w: any, index: number) => ({
    id: w.id || `worker-${index}`,
    name: w.name || '',
    role: w.role || 'Worker',
    checkIn: w.checkIn || w.check_in || '08:00',
    checkOut: w.checkOut || w.check_out || '17:00',
    isFromPayroll: w.isFromPayroll || false
  })));
  
  // Handle site subcontractors - map fields if needed
  const subsData = Array.isArray(entry.siteSubcontractors) ? entry.siteSubcontractors : [];
  setSiteSubcontractors(subsData.map((s: any, index: number) => ({
    id: s.id || `sub-${index}`,
    name: s.name || s.company || '',
    company: s.company || s.name || '',
    workersCount: s.workersCount || s.workers_count || 1,
    task: s.task || '',
    checkIn: s.checkIn || s.check_in || '08:00',
    checkOut: s.checkOut || s.check_out || '17:00',
    contactPerson: s.contactPerson || s.contact_person || ''
  })));
  
  // Handle summary - try different field names
  setWorkDone(entry.summary?.workDone || entry.summary?.work_done || '');
  setPlansTomorrow(entry.summary?.plansTomorrow || entry.summary?.plans_tomorrow || '');
  setChallenges(entry.summary?.challenges || '');
  
  setOpen(true);
};








  const handleDelete = async (id: number) => {
    if (confirm('Delete this diary entry? This cannot be undone.')) {
      await deleteSiteDiaryEntry(id);
      await fetchSiteDiaryEntries();
      alert('Entry deleted successfully!');
    }
  };

  const getWeatherIcon = (condition: string) => {
    const weather = weatherOptions.find(w => w.value === condition);
    if (weather) {
      const Icon = weather.icon;
      return <Icon size={20} className={weather.color} />;
    }
    return <Sun size={20} className="text-amber-500" />;
  };

  const getWeatherButtonClass = (weatherValue: string) => {
    const weather = weatherOptions.find(w => w.value === weatherValue);
    if (weatherCondition === weatherValue) {
      return `${weather?.bgColor} border-2 ${weather?.borderColor} shadow-sm`;
    }
    return 'bg-gray-50 border border-gray-200 hover:bg-gray-100';
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold">Site Diary</h1>
            <p className="text-xs text-muted-foreground">Daily site records, workers, subcontractors, activities, and incidents</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={syncData} disabled={isSyncing}>
              <RefreshCw size={14} className={`mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync'}
            </Button>
            <Button onClick={() => { resetForm(); setOpen(true); }} size="sm">
              <Plus size={14} className="mr-1" /> New Entry
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Total Entries</p>
            <p className="text-2xl font-bold">{siteDiaryEntries.length}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Total Workers</p>
            <p className="text-2xl font-bold">{siteDiaryEntries.reduce((sum, e) => sum + (e.totalWorkers || 0), 0)}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Deliveries</p>
            <p className="text-2xl font-bold text-green-600">{siteDiaryEntries.reduce((sum, e) => sum + (e.deliveries?.length || 0), 0)}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Incidents</p>
            <p className="text-2xl font-bold text-red-600">{siteDiaryEntries.reduce((sum, e) => sum + (e.incidents?.length || 0), 0)}</p>
          </Card>
        </div>

        {/* Entries List */}
        <div className="space-y-2">
          {siteDiaryEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewEntry(entry)}>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-muted-foreground" />
                        <span className="text-sm font-medium">{formatDate(entry.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getWeatherIcon(entry.weather?.condition)}
                        <span className="text-xs">{weatherOptions.find(w => w.value === entry.weather?.condition)?.label}</span>
                        <span className="text-xs">• {entry.weather?.temp}°C</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{entry.status}</Badge>
                    </div>
                    <p className="text-sm font-medium">{entry.projectName}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {entry.summary?.workDone?.substring(0, 80)}...
                    </p>
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      <span>👥 {entry.totalWorkers || 0} workers</span>
                      <span>🏗️ {entry.siteSubcontractors?.length || 0} subs</span>
                      <span>📦 {entry.deliveries?.length || 0}</span>
                      <span>⚠️ {entry.incidents?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => printSiteDiary(entry)} title="Print">
                      <Printer size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setViewEntry(entry); }} title="View">
                      <Eye size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(entry)} title="Edit">
                      <Edit size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)} title="Delete">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {siteDiaryEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No diary entries yet. Click "New Entry" to create your first site diary.
            </div>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">{editing ? 'Edit Site Diary' : 'New Site Diary Entry'}</DialogTitle>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
              <TabsList className="grid grid-cols-6 gap-1 h-auto p-1">
                <TabsTrigger value="basic" className="text-xs py-1">Basic</TabsTrigger>
                <TabsTrigger value="workers" className="text-xs py-1">Workers</TabsTrigger>
                <TabsTrigger value="subcontractors" className="text-xs py-1">Subs</TabsTrigger>
                <TabsTrigger value="activities" className="text-xs py-1">Activities</TabsTrigger>
                <TabsTrigger value="deliveries" className="text-xs py-1">Deliveries</TabsTrigger>
                <TabsTrigger value="summary" className="text-xs py-1">Summary</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Date</Label>
                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Project</Label>
                    <Select value={projectId.toString()} onValueChange={v => setProjectId(Number(v))}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.filter(p => p.status === 'Active').map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs mb-2 block">Weather Condition</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {weatherOptions.map(weather => {
                      const Icon = weather.icon;
                      return (
                        <Tooltip key={weather.value}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setWeatherCondition(weather.value)}
                              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${getWeatherButtonClass(weather.value)}`}
                            >
                              <Icon size={24} className={weather.color} />
                              <span className="text-xs font-medium">{weather.label}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{weather.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs">Temperature (°C)</Label>
                  <Input type="number" value={temperature} onChange={e => setTemperature(Number(e.target.value))} className="h-8 text-sm" />
                </div>
              </TabsContent>

              {/* Workers Tab */}
              <TabsContent value="workers" className="space-y-3 mt-3">
                <div className="space-y-2">
                  {siteWorkers.map(worker => (
                    <div key={worker.id} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                      <div>
                        <span className="font-medium">{worker.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{worker.role}</span>
                        <span className="text-xs text-muted-foreground ml-2">{worker.checkIn}-{worker.checkOut}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeWorker(worker.id)} className="h-6 w-6 p-0">
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="border rounded p-3 space-y-2">
                  <p className="text-xs font-medium">Add Payroll Worker</p>
                  <div className="flex gap-2">
                    <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                      <SelectTrigger className="h-8 text-sm flex-1">
                        <SelectValue placeholder="Select worker" />
                      </SelectTrigger>
                      <SelectContent>
                        {workers.map(worker => (
                          <SelectItem key={worker.id} value={worker.id.toString()}>{worker.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input type="time" value={workerCheckIn} onChange={e => setWorkerCheckIn(e.target.value)} className="w-20 h-8 text-sm" />
                    <Input type="time" value={workerCheckOut} onChange={e => setWorkerCheckOut(e.target.value)} className="w-20 h-8 text-sm" />
                    <Button onClick={addPayrollWorker} size="sm" className="h-8 px-3">Add</Button>
                  </div>
                </div>

                <div className="border rounded p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-medium">Add Casual Worker</p>
                    <Button variant="ghost" size="sm" onClick={() => setShowCustomWorker(!showCustomWorker)} className="h-6 text-xs">
                      {showCustomWorker ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  {showCustomWorker && (
                    <div className="flex gap-2">
                      <Input placeholder="Worker name" value={customWorkerName} onChange={e => setCustomWorkerName(e.target.value)} className="h-8 text-sm flex-1" />
                      <Input type="time" value={workerCheckIn} onChange={e => setWorkerCheckIn(e.target.value)} className="w-20 h-8 text-sm" />
                      <Input type="time" value={workerCheckOut} onChange={e => setWorkerCheckOut(e.target.value)} className="w-20 h-8 text-sm" />
                      <Button onClick={addCustomWorker} size="sm" className="h-8 px-3">Add</Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Subcontractors Tab */}
              <TabsContent value="subcontractors" className="space-y-3 mt-3">
                <div className="space-y-2">
                  {siteSubcontractors.map(sub => (
                    <div key={sub.id} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                      <div>
                        <span className="font-medium">{sub.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{sub.task} | {sub.workersCount} workers</span>
                        <span className="text-xs text-muted-foreground ml-2">{sub.checkIn}-{sub.checkOut}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeSubcontractor(sub.id)} className="h-6 w-6 p-0">
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="border rounded p-3 space-y-2">
                  <p className="text-xs font-medium">Add Existing Subcontractor</p>
                  <div className="flex gap-2">
                    <Select value={selectedSubcontractor} onValueChange={setSelectedSubcontractor}>
                      <SelectTrigger className="h-8 text-sm flex-1">
                        <SelectValue placeholder="Select subcontractor" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcontractors.map(sub => (
                          <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Task" value={subcontractorTask} onChange={e => setSubcontractorTask(e.target.value)} className="h-8 text-sm flex-1" />
                    <Input type="number" placeholder="Workers" value={subcontractorWorkers} onChange={e => setSubcontractorWorkers(Number(e.target.value))} className="w-16 h-8 text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <Input type="time" value={subcontractorCheckIn} onChange={e => setSubcontractorCheckIn(e.target.value)} className="w-24 h-8 text-sm" />
                    <Input type="time" value={subcontractorCheckOut} onChange={e => setSubcontractorCheckOut(e.target.value)} className="w-24 h-8 text-sm" />
                    <Button onClick={addExistingSubcontractor} size="sm" className="h-8 px-3">Add</Button>
                  </div>
                </div>

                <div className="border rounded p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-medium">Add New Subcontractor</p>
                    <Button variant="ghost" size="sm" onClick={() => setShowCustomSubcontractor(!showCustomSubcontractor)} className="h-6 text-xs">
                      {showCustomSubcontractor ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  {showCustomSubcontractor && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input placeholder="Company name" value={customSubcontractorName} onChange={e => setCustomSubcontractorName(e.target.value)} className="h-8 text-sm flex-1" />
                        <Input placeholder="Task" value={subcontractorTask} onChange={e => setSubcontractorTask(e.target.value)} className="h-8 text-sm flex-1" />
                        <Input type="number" placeholder="Workers" value={subcontractorWorkers} onChange={e => setSubcontractorWorkers(Number(e.target.value))} className="w-16 h-8 text-sm" />
                      </div>
                      <div className="flex gap-2">
                        <Input type="time" value={subcontractorCheckIn} onChange={e => setSubcontractorCheckIn(e.target.value)} className="w-24 h-8 text-sm" />
                        <Input type="time" value={subcontractorCheckOut} onChange={e => setSubcontractorCheckOut(e.target.value)} className="w-24 h-8 text-sm" />
                        <Button onClick={addCustomSubcontractor} size="sm" className="h-8 px-3">Add</Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Activities Tab */}
              <TabsContent value="activities" className="space-y-3 mt-3">
                <div className="space-y-2">
                  {activities.map(activity => (
                    <div key={activity.id} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                      <div>
                        <span className="font-medium">{activity.description}</span>
                        <span className="text-xs text-muted-foreground ml-2">{activity.location} | {activity.startTime}-{activity.endTime}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeActivity(activity.id)} className="h-6 w-6 p-0">
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="border rounded p-3 space-y-2">
                  <p className="text-xs font-medium">Add Activity</p>
                  <Input placeholder="Description" value={newActivity.description} onChange={e => setNewActivity({ ...newActivity, description: e.target.value })} className="h-8 text-sm" />
                  <div className="grid grid-cols-4 gap-2">
                    <Input placeholder="Location" value={newActivity.location} onChange={e => setNewActivity({ ...newActivity, location: e.target.value })} className="h-8 text-sm" />
                    <Input type="time" value={newActivity.startTime} onChange={e => setNewActivity({ ...newActivity, startTime: e.target.value })} className="h-8 text-sm" />
                    <Input type="time" value={newActivity.endTime} onChange={e => setNewActivity({ ...newActivity, endTime: e.target.value })} className="h-8 text-sm" />
                    <Input type="number" placeholder="Workers" value={newActivity.workersCount} onChange={e => setNewActivity({ ...newActivity, workersCount: Number(e.target.value) })} className="h-8 text-sm" />
                  </div>
                  <Input placeholder="Supervisor" value={newActivity.supervisor} onChange={e => setNewActivity({ ...newActivity, supervisor: e.target.value })} className="h-8 text-sm" />
                  <Button onClick={addActivity} size="sm" className="h-8 w-full">Add Activity</Button>
                </div>
              </TabsContent>

              {/* Deliveries Tab */}
              <TabsContent value="deliveries" className="space-y-3 mt-3">
                <div className="space-y-2">
                  {deliveries.map(delivery => (
                    <div key={delivery.id} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                      <div>
                        <span className="font-medium">{delivery.itemName}</span>
                        <span className="text-xs text-muted-foreground ml-2">{delivery.quantity} {delivery.unit} from {delivery.supplier}</span>
                        <span className="text-xs text-muted-foreground ml-2">Received by: {delivery.receivedBy}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeDelivery(delivery.id)} className="h-6 w-6 p-0">
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="border rounded p-3 space-y-2">
                  <p className="text-xs font-medium">Add Delivery</p>
                  
                  {/* Item Name and Supplier row */}
                  <div className="grid grid-cols-2 gap-2">
                    <Input 
                      placeholder="Item name" 
                      value={newDelivery.itemName} 
                      onChange={e => setNewDelivery({ ...newDelivery, itemName: e.target.value })} 
                      className="h-8 text-sm" 
                    />
                    
                    {/* Supplier Dropdown with Add New option */}
                    <div className="flex gap-1">
                      <Select value={newDelivery.supplier} onValueChange={setNewDeliverySupplier}>
                        <SelectTrigger className="h-8 text-sm flex-1">
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map(supplier => (
                            <SelectItem key={supplier.id} value={supplier.name}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="__new__" className="text-blue-600 font-medium">
                            + Add New Supplier...
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Show new supplier input when selected */}
                      {showNewSupplier && (
                        <Input 
                          placeholder="New supplier name" 
                          value={newSupplierName}
                          onChange={e => setNewSupplierName(e.target.value)}
                          className="h-8 text-sm w-40"
                          autoFocus
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Quantity, Unit, Received By row */}
                  <div className="grid grid-cols-3 gap-2">
                    <Input 
                      type="number" 
                      placeholder="Qty" 
                      value={newDelivery.quantity} 
                      onChange={e => setNewDelivery({ ...newDelivery, quantity: Number(e.target.value) })} 
                      className="h-8 text-sm" 
                    />
                    <Input 
                      placeholder="Unit" 
                      value={newDelivery.unit} 
                      onChange={e => setNewDelivery({ ...newDelivery, unit: e.target.value })} 
                      className="h-8 text-sm" 
                    />
                    <Input 
                      placeholder="Received by" 
                      value={newDelivery.receivedBy} 
                      onChange={e => setNewDelivery({ ...newDelivery, receivedBy: e.target.value })} 
                      className="h-8 text-sm" 
                    />
                  </div>
                  
                  {/* Add Delivery button */}
                  <Button onClick={addDelivery} size="sm" className="h-8 w-full">Add Delivery</Button>
                </div>
              </TabsContent>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-3 mt-3">
                <div>
                  <Label className="text-xs">Today's Work Done</Label>
                  <Textarea value={workDone} onChange={e => setWorkDone(e.target.value)} rows={2} className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Tomorrow's Plan</Label>
                  <Textarea value={plansTomorrow} onChange={e => setPlansTomorrow(e.target.value)} rows={2} className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Challenges / Issues</Label>
                  <Textarea value={challenges} onChange={e => setChallenges(e.target.value)} rows={2} className="text-sm" />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="outline" onClick={() => setOpen(false)} size="sm">Cancel</Button>
              <Button onClick={handleSave} disabled={loading} size="sm">
                <Save size={14} className="mr-1" />
                {loading ? 'Saving...' : editing ? 'Update' : 'Save'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Entry Dialog */}
        <Dialog open={!!viewEntry} onOpenChange={() => setViewEntry(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">Site Diary - {viewEntry && formatDate(viewEntry.date)}</DialogTitle>
            </DialogHeader>
            {viewEntry && (
              <div className="space-y-3 py-2">
                <div className="grid grid-cols-3 gap-3 bg-muted rounded p-3 text-sm">
                  <div><p className="text-xs text-muted-foreground">Project</p><p className="font-medium">{viewEntry.projectName}</p></div>
                  <div><p className="text-xs text-muted-foreground">Weather</p><p className="font-medium">{weatherOptions.find(w => w.value === viewEntry.weather?.condition)?.label} • {viewEntry.weather?.temp}°C</p></div>
                  <div><p className="text-xs text-muted-foreground">Total Workers</p><p className="font-medium">{viewEntry.totalWorkers || 0}</p></div>
                </div>

                {viewEntry.siteWorkers?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Workers</h4>
                    <div className="space-y-1">
                      {viewEntry.siteWorkers.map((w: any, i: number) => (
                        <div key={i} className="bg-muted/30 rounded p-2 text-sm">
                          <span className="font-medium">{w.name}</span> - {w.role} ({w.checkIn}-{w.checkOut})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewEntry.siteSubcontractors?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Subcontractors</h4>
                    <div className="space-y-1">
                      {viewEntry.siteSubcontractors.map((s: any, i: number) => (
                        <div key={i} className="bg-muted/30 rounded p-2 text-sm">
                          <span className="font-medium">{s.name}</span> - {s.task} ({s.workersCount} workers) {s.checkIn}-{s.checkOut}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewEntry.activities?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Activities</h4>
                    <div className="space-y-1">
                      {viewEntry.activities.map((a: any, i: number) => (
                        <div key={i} className="bg-muted/30 rounded p-2 text-sm">
                          <span className="font-medium">{a.description}</span> - {a.location} ({a.startTime}-{a.endTime})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewEntry.deliveries?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Deliveries</h4>
                    <div className="space-y-1">
                      {viewEntry.deliveries.map((d: any, i: number) => (
                        <div key={i} className="bg-muted/30 rounded p-2 text-sm">
                          {d.itemName} - {d.quantity} {d.unit} from {d.supplier}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewEntry.summary?.workDone && (
                  <div className="bg-accent/5 border rounded p-3">
                    <h4 className="text-sm font-semibold mb-1">Summary</h4>
                    <p className="text-sm">✓ {viewEntry.summary.workDone}</p>
                    {viewEntry.summary?.plansTomorrow && <p className="text-sm mt-1">📅 Tomorrow: {viewEntry.summary.plansTomorrow}</p>}
                    {viewEntry.summary?.challenges && <p className="text-sm mt-1 text-orange-600">⚠️ {viewEntry.summary.challenges}</p>}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}