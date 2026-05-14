import { useAppStore } from '@/hooks/useAppStore';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2, Plus, Save, Trash2, X, Calendar, Clock, Flag, ChevronDown, ChevronRight, 
  Download, Link, Link2, ZoomIn, ZoomOut, GripVertical, Move, Eye, Printer, FileText,
  Search, Filter, Maximize2, Minimize2, Grid3x3, List, BarChart3, AlertTriangle,
  CheckCircle, Clock as ClockIcon, TrendingUp, Calendar as CalendarIcon, Settings,
  HelpCircle, Keyboard, Copy, Scissors, Undo, Redo, Star, Sparkles, Rocket, Eraser,
  Upload, FileJson, AlertCircle, LayoutTemplate, Maximize, Minimize, GitBranch, 
  Users, DollarSign, CalendarDays, GanttChart as GanttIcon, Trash, Edit
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


interface Task {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  parentId: number | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  cost?: number;
  assignedTo?: string;
  dependencies?: number[];
  children?: Task[];
  expanded?: boolean;
  isMilestone?: boolean;
  baselineStart?: string;
  baselineEnd?: string;
  wbs?: string;
  resourceNames?: string;
  work?: number;
  notes?: string;
  actualStart?: string;
  actualEnd?: string;
  variance?: number;
}

interface Dependency {
  id: number;
  fromTaskId: number;
  toTaskId: number;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lag?: number;
}

interface ColumnConfig {
  id: string;
  label: string;
  width: number;
  visible: boolean;
  order: number;
}

interface ProjectGanttProps {
  projectId: number;
  isStakeholder?: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'name', label: 'Task Name', width: 300, visible: true, order: 0 },
  { id: 'wbs', label: 'WBS', width: 60, visible: false, order: 1 },
  { id: 'start', label: 'Start', width: 90, visible: true, order: 2 },
  { id: 'end', label: 'End', width: 90, visible: true, order: 3 },
  { id: 'duration', label: 'Dur', width: 60, visible: true, order: 4 },
  { id: 'progress', label: '% Done', width: 70, visible: true, order: 5 },
  { id: 'priority', label: 'Priority', width: 70, visible: true, order: 6 },
  { id: 'assignedTo', label: 'Assignee', width: 110, visible: true, order: 7 },
  { id: 'cost', label: 'Cost (KES)', width: 100, visible: true, order: 8 },
  { id: 'predecessors', label: 'Pred', width: 80, visible: false, order: 9 },
  { id: 'successors', label: 'Succ', width: 80, visible: false, order: 10 },
];

// Helper to get dates relative to today
const getDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

// Sample data with dynamic dates (based on current date)
const SAMPLE_TASKS: Task[] = [
  { id: 1, name: "🏗️ PROJECT INITIATION", startDate: getDate(0), endDate: getDate(13), duration: 14, progress: 100, parentId: null, priority: "high", cost: 500000, expanded: true, wbs: "1.0" },
  { id: 2, name: "Project Kickoff Meeting", startDate: getDate(0), endDate: getDate(0), duration: 1, progress: 100, parentId: 1, priority: "high", cost: 50000, assignedTo: "John M.", wbs: "1.1" },
  { id: 3, name: "Site Survey & Topography", startDate: getDate(1), endDate: getDate(5), duration: 5, progress: 100, parentId: 1, priority: "high", cost: 150000, assignedTo: "Sarah K.", wbs: "1.2" },
  { id: 4, name: "Soil Investigation", startDate: getDate(4), endDate: getDate(8), duration: 5, progress: 100, parentId: 1, priority: "high", cost: 200000, assignedTo: "Mike O.", wbs: "1.3" },
  { id: 5, name: "Permits & Approvals", startDate: getDate(2), endDate: getDate(13), duration: 12, progress: 85, parentId: 1, priority: "high", cost: 100000, assignedTo: "Legal Team", wbs: "1.4" },
  { id: 6, name: "🏗️ FOUNDATION WORKS", startDate: getDate(14), endDate: getDate(41), duration: 28, progress: 45, parentId: null, priority: "high", cost: 2000000, expanded: true, wbs: "2.0" },
  { id: 7, name: "Excavation", startDate: getDate(14), endDate: getDate(20), duration: 7, progress: 100, parentId: 6, priority: "high", cost: 500000, assignedTo: "Peter W.", wbs: "2.1" },
  { id: 8, name: "Steel Reinforcement", startDate: getDate(21), endDate: getDate(27), duration: 7, progress: 60, parentId: 6, priority: "high", cost: 600000, assignedTo: "James N.", wbs: "2.2" },
  { id: 9, name: "Concrete Pouring", startDate: getDate(28), endDate: getDate(34), duration: 7, progress: 30, parentId: 6, priority: "high", cost: 700000, assignedTo: "Concrete Team", wbs: "2.3" },
  { id: 10, name: "Curing", startDate: getDate(35), endDate: getDate(41), duration: 7, progress: 0, parentId: 6, priority: "medium", cost: 200000, assignedTo: "Quality Team", wbs: "2.4" },
  { id: 11, name: "🏗️ SUPERSTRUCTURE", startDate: getDate(42), endDate: getDate(97), duration: 56, progress: 0, parentId: null, priority: "high", cost: 5000000, expanded: false, wbs: "3.0" },
  { id: 12, name: "Column Casting", startDate: getDate(42), endDate: getDate(62), duration: 21, progress: 0, parentId: 11, priority: "high", cost: 1500000, wbs: "3.1" },
  { id: 13, name: "Beam & Slab", startDate: getDate(63), endDate: getDate(83), duration: 21, progress: 0, parentId: 11, priority: "high", cost: 2000000, wbs: "3.2" },
  { id: 14, name: "Wall Construction", startDate: getDate(84), endDate: getDate(97), duration: 14, progress: 0, parentId: 11, priority: "medium", cost: 1500000, wbs: "3.3" },
  { id: 15, name: "🏗️ ROOFING", startDate: getDate(98), endDate: getDate(125), duration: 28, progress: 0, parentId: null, priority: "high", cost: 1500000, expanded: false, wbs: "4.0" },
  { id: 16, name: "🎨 FINISHING", startDate: getDate(126), endDate: getDate(181), duration: 56, progress: 0, parentId: null, priority: "medium", cost: 2000000, expanded: false, wbs: "5.0" },
  { id: 17, name: "⚡ MEP INSTALLATION", startDate: getDate(126), endDate: getDate(209), duration: 84, progress: 0, parentId: null, priority: "high", cost: 3000000, expanded: false, wbs: "6.0" },
  { id: 18, name: "🎯 PROJECT HANDOVER", startDate: getDate(210), endDate: getDate(237), duration: 28, progress: 0, parentId: null, priority: "high", cost: 500000, expanded: false, wbs: "7.0" },
  { id: 19, name: "🎉 Foundation Complete", startDate: getDate(41), endDate: getDate(41), duration: 0, progress: 100, parentId: null, priority: "high", isMilestone: true, cost: 0 },
  { id: 20, name: "🎉 Structural Completion", startDate: getDate(97), endDate: getDate(97), duration: 0, progress: 0, parentId: null, priority: "high", isMilestone: true, cost: 0 },
  { id: 21, name: "🎉 Project Completion", startDate: getDate(237), endDate: getDate(237), duration: 0, progress: 0, parentId: null, priority: "high", isMilestone: true, cost: 0 },
];

const SAMPLE_DEPENDENCIES: Dependency[] = [
  { id: 1, fromTaskId: 2, toTaskId: 3, type: 'finish-to-start' },
  { id: 2, fromTaskId: 3, toTaskId: 4, type: 'finish-to-start' },
  { id: 3, fromTaskId: 4, toTaskId: 5, type: 'finish-to-start' },
  { id: 4, fromTaskId: 5, toTaskId: 7, type: 'finish-to-start' },
  { id: 5, fromTaskId: 7, toTaskId: 8, type: 'finish-to-start' },
  { id: 6, fromTaskId: 8, toTaskId: 9, type: 'finish-to-start' },
  { id: 7, fromTaskId: 9, toTaskId: 10, type: 'finish-to-start' },
  { id: 8, fromTaskId: 10, toTaskId: 12, type: 'finish-to-start' },
  { id: 9, fromTaskId: 12, toTaskId: 13, type: 'finish-to-start' },
  { id: 10, fromTaskId: 13, toTaskId: 14, type: 'finish-to-start' },
  { id: 11, fromTaskId: 14, toTaskId: 15, type: 'finish-to-start' },
];

export function ProjectGantt({ projectId, isStakeholder = false }: ProjectGanttProps) {
  // State declarations
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [projectName, setProjectName] = useState('');
  const { currencySettings, fetchCurrencySettings } = useAppStore();
  const currencySymbol = currencySettings?.currency_symbol || 'KES';

// DEBUG: Log currency settings
console.log('🔍 [Gantt] currencySettings:', currencySettings);
console.log('🔍 [Gantt] currencySymbol:', currencySymbol);

  const [printPaperSize, setPrintPaperSize] = useState<'A0' | 'A1' | 'A2' | 'A3' | 'A4'>('A2');
  const [printOrientation, setPrintOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [printScale, setPrintScale] = useState<'fit' | 'actual' | 'shrink'>('fit');

// Debug currency changes - ADD THIS HERE
useEffect(() => {
    console.log('🔍 [Gantt] currencySettings changed:', currencySettings);
    console.log('🔍 [Gantt] New currency symbol:', currencySettings?.currency_symbol);
}, [currencySettings]);

  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [showBaseline, setShowBaseline] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'all' | 'overdue' | 'this-week' | 'next-week' | 'milestones' | 'high-priority'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedView, setSelectedView] = useState<'standard' | 'critical' | 'milestone'>('standard');
  const [history, setHistory] = useState<{ tasks: Task[]; dependencies: Dependency[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [printLogs, setPrintLogs] = useState<string[]>([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    const saved = localStorage.getItem(`gantt_columns_${projectId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_COLUMNS;
      }
    }
    return DEFAULT_COLUMNS;
  });
  
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [draggingColumn, setDraggingColumn] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartOrder, setDragStartOrder] = useState(0);
  const [selectedDependency, setSelectedDependency] = useState<{ fromTaskId: number | null; toTaskId: number | null }>({ fromTaskId: null, toTaskId: null });
  
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [taskForm, setTaskForm] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: 0,
    parentId: null as number | null,
    priority: 'medium' as const,
    cost: 0,
    assignedTo: ''
  });

  // Add log function
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setPrintLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };


  // Close menus
  const closeExportMenu = () => {
    setShowExportMenu(false);
  };

  const closeImportMenu = () => {
    setShowImportMenu(false);
  };



  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled) return;
    if (isStakeholder) return;
    if (tasks.length === 0 && dependencies.length === 0) return;
    
    setUnsavedChanges(true);
    setAutoSaveStatus('idle');
    
    const timer = setTimeout(() => {
      performAutoSave();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [tasks, dependencies, autoSaveEnabled]);

  const performAutoSave = async () => {
    if (isStakeholder) return;
    
    setAutoSaveStatus('saving');
    setUnsavedChanges(false);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/gantt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ tasks, dependencies })
      });
      
      if (response.ok) {
        setAutoSaveStatus('saved');
        addLog('Auto-saved successfully');



setTimeout(() => {
  setAutoSaveStatus(prev => prev === 'saved' ? 'idle' : prev);
}, 2000);



      } else {
        setAutoSaveStatus('error');
        setTimeout(() => {
          setAutoSaveStatus(prev => prev === 'error' ? 'idle' : prev);
     }, 3000);
    }


    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
      setTimeout(() => {
        setAutoSaveStatus(prev => prev === 'error' ? 'idle' : prev);
     }, 3000);
    }
  };  // ← ADD THIS MISSING BRACE

  const handleManualSave = async () => {
    setAutoSaveEnabled(false);
    setAutoSaveStatus('saving');
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/projects/${projectId}/gantt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ tasks, dependencies })
      });
      alert('✅ Gantt chart saved successfully!');
      setAutoSaveStatus('saved');
      saveToHistory();
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving:', error);
      alert('❌ Error saving gantt data');
      setAutoSaveStatus('error');
    } finally {
      setAutoSaveEnabled(true);
    }
  };

  // Load sample data
  const loadSampleData = () => {
    addLog('Loading sample project data...');
    setTasks(JSON.parse(JSON.stringify(SAMPLE_TASKS)));
    setDependencies(JSON.parse(JSON.stringify(SAMPLE_DEPENDENCIES)));
    const parentIds = new Set(SAMPLE_TASKS.filter(t => t.parentId === null).map(t => t.id));
    setExpandedTasks(parentIds);
    saveToHistory();
    const totalCost = SAMPLE_TASKS.reduce((sum, t) => sum + (t.cost || 0), 0);
    alert(`✅ Sample project data loaded!\n\n📊 ${SAMPLE_TASKS.length} tasks\n🔗 ${SAMPLE_DEPENDENCIES.length} dependencies\n💰 Total budget: KES ${(totalCost / 1000000).toFixed(1)}M\n\nYou can now edit, delete, or clear this data.`);
  };

  // Save to history
  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ tasks: JSON.parse(JSON.stringify(tasks)), dependencies: JSON.parse(JSON.stringify(dependencies)) });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setTasks(prev.tasks);
      setDependencies(prev.dependencies);
      setHistoryIndex(historyIndex - 1);
      addLog('Undo performed');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setTasks(next.tasks);
      setDependencies(next.dependencies);
      setHistoryIndex(historyIndex + 1);
      addLog('Redo performed');
    }
  };



// Toggle fullscreen
const toggleFullscreen = () => {
  if (!isFullscreen) {
    if (fullscreenRef.current?.requestFullscreen) {
      fullscreenRef.current.requestFullscreen();
      addLog('Fullscreen enabled');
      // Add delay to recalculate heights
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        // Force Gantt container to recalculate its height
        if (ganttContainerRef.current) {
          ganttContainerRef.current.style.maxHeight = 'calc(100vh - 60px)';
        }
      }, 100);
      // Additional recalculation after fullscreen animation completes
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 500);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      addLog('Fullscreen exited');
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        if (ganttContainerRef.current) {
          ganttContainerRef.current.style.maxHeight = 'calc(100vh - 180px)';
        }
      }, 100);
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 500);
    }
  }
};




  // Clear all tasks
  const clearAllTasks = () => {
    if (confirm('⚠️ WARNING: This will delete ALL tasks and dependencies. This action cannot be undone. Are you sure?')) {
      setTasks([]);
      setDependencies([]);
      setExpandedTasks(new Set());
      setSelectedTask(null);
      saveToHistory();
      alert('✅ Gantt chart cleared. You can now start fresh or load sample data.');
    }
  };

  // Get dynamic date range based on tasks (expands as needed)
  const getProjectDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (tasks.length === 0) {
      const end = new Date(today);
      end.setMonth(end.getMonth() + 6);
      return { minDate: today, maxDate: end };
    }
    
    const validDates = tasks.flatMap(t => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        return [start, end];
      }
      return [];
    });
    
    if (validDates.length === 0) {
      const end = new Date(today);
      end.setMonth(end.getMonth() + 6);
      return { minDate: today, maxDate: end };
    }
    
    let minDate = new Date(Math.min(...validDates.map(d => d.getTime())));
    let maxDate = new Date(Math.max(...validDates.map(d => d.getTime())));
    
    // Add 30% padding on both sides for better visibility and future planning
    const duration = maxDate.getTime() - minDate.getTime();
    const padding = Math.max(duration * 0.3, 14 * 24 * 60 * 60 * 1000); // Min 14 days padding
    
    minDate = new Date(minDate.getTime() - padding);
    maxDate = new Date(maxDate.getTime() + padding);
    
    // Ensure at least 3 months view
    const minDuration = 90 * 24 * 60 * 60 * 1000;
    if (maxDate.getTime() - minDate.getTime() < minDuration) {
      maxDate = new Date(minDate.getTime() + minDuration);
    }
    
    return { minDate, maxDate };
  };







  // Professional Print Handler with full dynamic range and white background
  const handlePrint = async () => {
    addLog(`=== PRINT STARTED: ${printPaperSize} ${printOrientation} ===`);
    
    if (!printRef.current || !ganttContainerRef.current) {
      addLog('❌ Print reference not found');
      alert('Print error: Could not find chart to print');
      return;
    }

    try {
      // Show loading indicator
      const loadingToast = document.createElement('div');
      loadingToast.innerHTML = 'Generating PDF... Please wait';
      loadingToast.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#333; color:white; padding:10px 20px; border-radius:8px; z-index:9999;';
      document.body.appendChild(loadingToast);

      // Temporarily disable dark mode for print capture
      const originalBodyClass = document.body.className;
      document.body.classList.add('print-mode');
      
      // Create a temporary print container with white background
      const printContainer = document.createElement('div');
      printContainer.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: ${printPaperSize === 'A0' ? '841mm' : printPaperSize === 'A1' ? '594mm' : printPaperSize === 'A2' ? '420mm' : printPaperSize === 'A3' ? '297mm' : '210mm'};
        background: white;
        padding: 20px;
        font-family: Arial, sans-serif;
      `;
      
      // Clone the Gantt chart content
      const ganttContent = ganttContainerRef.current.cloneNode(true) as HTMLElement;
      
      // Force white background on all elements in the clone
      ganttContent.style.backgroundColor = 'white';
      ganttContent.style.color = 'black';
      
      // Remove dark mode classes and force light styles
      const allElements = ganttContent.querySelectorAll('*');
      allElements.forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        // Remove dark mode classes
        htmlEl.classList.remove('dark', 'dark:bg-gray-800', 'dark:bg-gray-700', 'dark:text-white', 'dark:border-gray-700');
        // Force light colors
        htmlEl.style.backgroundColor = 'white';
        htmlEl.style.color = 'black';
        htmlEl.style.borderColor = '#e5e7eb';
      });
      
      // Fix task bar colors for print
      const taskBars = ganttContent.querySelectorAll('[class*="bg-gradient"]');
      taskBars.forEach((bar: Element) => {
        const htmlBar = bar as HTMLElement;
        // Replace gradients with solid colors for print
        if (htmlBar.className.includes('emerald')) htmlBar.style.backgroundColor = '#10b981';
        else if (htmlBar.className.includes('red')) htmlBar.style.backgroundColor = '#ef4444';
        else if (htmlBar.className.includes('orange')) htmlBar.style.backgroundColor = '#f97316';
        else if (htmlBar.className.includes('amber')) htmlBar.style.backgroundColor = '#f59e0b';
        else if (htmlBar.className.includes('blue')) htmlBar.style.backgroundColor = '#3b82f6';
        else if (htmlBar.className.includes('purple')) htmlBar.style.backgroundColor = '#8b5cf6';
        else htmlBar.style.backgroundColor = '#3b82f6';
        
        htmlBar.style.background = htmlBar.style.backgroundColor;
        htmlBar.style.color = 'white';
      });
      
      printContainer.appendChild(ganttContent);
      document.body.appendChild(printContainer);
      
      addLog('Capturing Gantt chart for print with white background...');
      
      // Capture with white background
      const canvas = await html2canvas(printContainer, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: printContainer.scrollWidth,
        windowHeight: printContainer.scrollHeight,
        useCORS: true,
        allowTaint: false,
        onclone: (clonedDoc, element) => {
          // Ensure white background in cloned document
          const clonedContainer = clonedDoc.querySelector('.print-container') as HTMLElement;
          if (clonedContainer) {
            clonedContainer.style.backgroundColor = 'white';
            clonedContainer.style.color = 'black';
          }
        }
      });
      
      // Clean up temporary elements
      document.body.removeChild(printContainer);
      document.body.removeChild(loadingToast);
      document.body.className = originalBodyClass;
      
      addLog(`Canvas size: ${canvas.width}x${canvas.height}px`);
      
      // Paper sizes in mm
      const paperSizes: Record<string, { width: number; height: number }> = {
        A0: { width: 841, height: 1189 },
        A1: { width: 594, height: 841 },
        A2: { width: 420, height: 594 },
        A3: { width: 297, height: 420 },
        A4: { width: 210, height: 297 }
      };
      
      const paper = paperSizes[printPaperSize];
      const pdfWidth = printOrientation === 'landscape' ? paper.height : paper.width;
      const pdfHeight = printOrientation === 'landscape' ? paper.width : paper.height;
      
      // Calculate image dimensions
      let imgWidth = pdfWidth - 20; // 10mm margins on each side
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Apply scaling based on user preference
      if (printScale === 'shrink' && imgHeight > pdfHeight - 20) {
        const shrinkRatio = (pdfHeight - 20) / imgHeight;
        imgWidth *= shrinkRatio;
        imgHeight *= shrinkRatio;
        addLog(`Shrunk to fit: ${imgWidth.toFixed(1)}x${imgHeight.toFixed(1)}mm`);
      } else if (printScale === 'fit') {
        if (imgHeight > pdfHeight - 20) {
          const fitRatio = (pdfHeight - 20) / imgHeight;
          imgWidth *= fitRatio;
          imgHeight *= fitRatio;
          addLog(`Fit to page: ${imgWidth.toFixed(1)}x${imgHeight.toFixed(1)}mm`);
        }
      }
      
      // Create PDF
      const pdf = new jsPDF({ 
        orientation: printOrientation, 
        unit: 'mm', 
        format: printPaperSize.toLowerCase() as any,
        compress: true,
        hotfixes: ['px_scaling']
      });
      
      // Add white background to PDF
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
      
      // Add the image
      pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 10, 10, imgWidth, imgHeight);
      
      // Add footer with metadata
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${new Date().toLocaleString()} | Paper: ${printPaperSize} ${printOrientation} | Page 1 of 1`, 10, pdfHeight - 5);
      
      // Save the PDF
      const fileName = `Gantt_${projectName || 'Project'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      addLog('✅ PDF generated successfully with white background');
      alert(`✅ Professional print PDF saved!\n\n📄 Paper: ${printPaperSize} ${printOrientation}\n📐 Scale: ${printScale}\n📏 Size: ${paper.width}mm x ${paper.height}mm\n\nFile: ${fileName}`);
      
    } catch (error) {
      addLog(`❌ Print error: ${error}`);
      console.error('Print error:', error);
      alert('Error generating PDF. Please check console for details.\n\nMake sure you have enough memory and try a smaller paper size like A3 or A4.');
    }
  };







  // Generate MS Project XML
  const generateMSProjectXML = (tasks: Task[], dependencies: Dependency[], projectName: string): string => {
    const projectStart = tasks.length > 0 ? tasks.reduce((min, t) => t.startDate < min ? t.startDate : min, tasks[0]?.startDate || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0];
    
    return `<?xml version="1.0" encoding="utf-8"?>
<Project xmlns="http://schemas.microsoft.com/project/2010">
  <Name>${escapeXml(projectName)}</Name>
  <StartDate>${projectStart}</StartDate>
  <ScheduleFromStart>1</ScheduleFromStart>
  <CurrentDate>${new Date().toISOString().split('T')[0]}</CurrentDate>
  <Calendar>
    <Name>Standard</Name>
    <WeekDays>
      <WeekDay>
        <DayType>Monday</DayType>
        <DayWorking>1</DayWorking>
      </WeekDay>
    </WeekDays>
  </Calendar>
  <Tasks>
    ${tasks.map(task => `
    <Task>
      <UID>${task.id}</UID>
      <Name>${escapeXml(task.name)}</Name>
      <Start>${task.startDate}T00:00:00</Start>
      <Finish>${task.endDate}T00:00:00</Finish>
      <Duration>${task.duration * 480}</Duration>
      <PercentWorkComplete>${task.progress}</PercentWorkComplete>
      <OutlineLevel>${task.parentId ? '2' : '1'}</OutlineLevel>
      ${task.parentId ? `<OutlineParent>${task.parentId}</OutlineParent>` : ''}
      ${task.isMilestone ? `<Milestone>1</Milestone><Duration>0</Duration>` : ''}
      ${task.wbs ? `<WBS>${task.wbs}</WBS>` : ''}
      ${task.assignedTo ? `<ResourceNames>${escapeXml(task.assignedTo)}</ResourceNames>` : ''}
      <Cost>${task.cost || 0}</Cost>
    </Task>
    `).join('')}
  </Tasks>
  <Relationships>
    ${dependencies.map(dep => `
    <Relationship>
      <PredecessorUID>${dep.fromTaskId}</PredecessorUID>
      <SuccessorUID>${dep.toTaskId}</SuccessorUID>
      <Type>0</Type>
      <Lag>${dep.lag || 0}</Lag>
    </Relationship>
    `).join('')}
  </Relationships>
  <ProjectOptions>
    <NewTasksEstimated>0</NewTasksEstimated>
    <NewTaskDuration>5</NewTaskDuration>
  </ProjectOptions>
</Project>`;
  };

  const escapeXml = (str: string): string => {
    if (!str) return '';
    return str.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };



  const escapeHtml = (str: string) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };




  // Export to MS Project
  const exportToMSProject = () => {
    const xml = generateMSProjectXML(tasks, dependencies, projectName);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName || 'project'}_MSProject.xml`;
    a.click();
    URL.revokeObjectURL(url);
    addLog(`Exported to MS Project: ${tasks.length} tasks`);
    alert(`✅ Exported to MS Project XML!\n\n📊 ${tasks.length} tasks\n🔗 ${dependencies.length} dependencies`);
  };

  // Import MS Project file
  const importMSProject = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, 'text/xml');
        
        const importedTasks: Task[] = [];
        const taskNodes = xmlDoc.getElementsByTagName('Task');
        let maxId = 0;
        
        for (let i = 0; i < taskNodes.length; i++) {
          const taskNode = taskNodes[i];
          const uid = parseInt(taskNode.getElementsByTagName('UID')?.[0]?.textContent || String(i + 1));
          const name = taskNode.getElementsByTagName('Name')?.[0]?.textContent || 'Unnamed Task';
          const startDate = taskNode.getElementsByTagName('Start')?.[0]?.textContent?.split('T')[0] || new Date().toISOString().split('T')[0];
          const finishDate = taskNode.getElementsByTagName('Finish')?.[0]?.textContent?.split('T')[0] || new Date().toISOString().split('T')[0];
          const progress = parseInt(taskNode.getElementsByTagName('PercentWorkComplete')?.[0]?.textContent || '0');
          const isMilestone = taskNode.getElementsByTagName('Milestone')?.[0]?.textContent === '1';
          const outlineParent = taskNode.getElementsByTagName('OutlineParent')?.[0]?.textContent;
          const wbs = taskNode.getElementsByTagName('WBS')?.[0]?.textContent;
          const assignedTo = taskNode.getElementsByTagName('ResourceNames')?.[0]?.textContent;
          const cost = parseFloat(taskNode.getElementsByTagName('Cost')?.[0]?.textContent || '0');
          
          const duration = Math.max(1, Math.ceil((new Date(finishDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
          
          importedTasks.push({
            id: uid,
            name: name,
            startDate: startDate,
            endDate: finishDate,
            duration: duration,
            progress: progress,
            parentId: outlineParent ? parseInt(outlineParent) : null,
            priority: 'medium',
            isMilestone: isMilestone,
            wbs: wbs,
            assignedTo: assignedTo || undefined,
            cost: cost
          });
          
          if (uid > maxId) maxId = uid;
        }
        
        // Import dependencies
        const importedDeps: Dependency[] = [];
        const relNodes = xmlDoc.getElementsByTagName('Relationship');
        let depId = 1;
        
        for (let i = 0; i < relNodes.length; i++) {
          const relNode = relNodes[i];
          const fromTaskId = parseInt(relNode.getElementsByTagName('PredecessorUID')?.[0]?.textContent || '0');
          const toTaskId = parseInt(relNode.getElementsByTagName('SuccessorUID')?.[0]?.textContent || '0');
          const lag = parseInt(relNode.getElementsByTagName('Lag')?.[0]?.textContent || '0');
          
          if (fromTaskId && toTaskId) {
            importedDeps.push({
              id: depId++,
              fromTaskId: fromTaskId,
              toTaskId: toTaskId,
              type: 'finish-to-start',
              lag: lag
            });
          }
        }
        
        if (importedTasks.length > 0) {
          setTasks(importedTasks);
          setDependencies(importedDeps);
          const parentIds = new Set(importedTasks.filter(t => t.parentId === null).map(t => t.id));
          setExpandedTasks(parentIds);
          saveToHistory();
          addLog(`Imported ${importedTasks.length} tasks from MS Project`);
          alert(`✅ Successfully imported ${importedTasks.length} tasks and ${importedDeps.length} dependencies!`);
        } else {
          alert('No valid tasks found.');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('❌ Error importing MS Project file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Export to CSV
  const exportToCSV = () => {
    let csv = '"Task Name","WBS","Start","End","Duration","Progress","Priority","Assigned To","Cost"\n';
    tasks.forEach(task => {
      csv += `"${task.name}","${task.wbs || ''}","${task.startDate}","${task.endDate}",${task.duration},${task.progress}%,${task.priority},"${task.assignedTo || ''}",${task.cost || 0}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gantt-${projectName || projectId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addLog(`Exported to CSV: ${tasks.length} tasks`);
  };







  // Professional Multi-Tab Excel Export with separate Legend tab
  const exportToExcel = () => {
    addLog('Exporting to Professional Multi-Tab Excel format...');
    
    // Calculate project date range
    let projectStart, projectEnd;
    if (tasks.length > 0) {
      const startDates = tasks.map(t => new Date(t.startDate)).filter(d => !isNaN(d.getTime()));
      const endDates = tasks.map(t => new Date(t.endDate)).filter(d => !isNaN(d.getTime()));
      projectStart = new Date(Math.min(...startDates.map(d => d.getTime())));
      projectEnd = new Date(Math.max(...endDates.map(d => d.getTime())));
    } else {
      projectStart = new Date();
      projectEnd = new Date();
      projectEnd.setMonth(projectEnd.getMonth() + 6);
    }
    
    const totalDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    const barWidth = 80;
    const totalWeeks = Math.ceil(totalDays / 7);
    
    // Generate timeline markers
    let weekMarkerLine = '';
    let monthMarkerLine = '';
    
    for (let i = 0; i <= barWidth; i++) {
      const dayPosition = Math.floor((i / barWidth) * totalDays);
      const currentDate = new Date(projectStart);
      currentDate.setDate(projectStart.getDate() + dayPosition);
      
      const weekNum = Math.floor(dayPosition / 7) + 1;
      const isWeekStart = dayPosition % 7 === 0;
      const isMonthStart = currentDate.getDate() <= 3;
      
      if (isWeekStart) {
        const weekLabel = 'W' + weekNum;
        weekMarkerLine += weekLabel;
        for (let j = weekLabel.length; j < 3; j++) weekMarkerLine += ' ';
      } else {
        weekMarkerLine += '   ';
      }
      
      if (isMonthStart) {
        const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'short' });
        monthMarkerLine += monthLabel;
        for (let j = monthLabel.length; j < 3; j++) monthMarkerLine += ' ';
      } else {
        monthMarkerLine += '   ';
      }
    }
    
    // Build HTML with multiple sheets
    let htmlContent = '<!DOCTYPE html>\n';
    htmlContent += '<html>\n';
    htmlContent += '<head>\n';
    htmlContent += '<meta charset="UTF-8">\n';
    htmlContent += '<title>Gantt Chart - ' + escapeHtml(projectName || 'Project') + '</title>\n';
    htmlContent += '<style>\n';
    htmlContent += 'body { font-family: "Segoe UI", Arial, sans-serif; margin: 0; padding: 0; }\n';
    htmlContent += '.sheet-tabs { background-color: #f1f1f1; padding: 10px 10px 0 10px; border-bottom: 1px solid #ccc; }\n';
    htmlContent += '.sheet-tab { display: inline-block; padding: 8px 20px; background-color: #ddd; border: 1px solid #ccc; border-bottom: none; border-radius: 5px 5px 0 0; cursor: pointer; margin-right: 5px; font-weight: bold; }\n';
    htmlContent += '.sheet-tab.active { background-color: #2c3e50; color: white; border-color: #2c3e50; }\n';
    htmlContent += '.sheet-content { display: none; padding: 20px; }\n';
    htmlContent += '.sheet-content.active { display: block; }\n';
    htmlContent += '.gantt-table { border-collapse: collapse; width: 100%; font-size: 11px; }\n';
    htmlContent += '.gantt-table th { background-color: #2c3e50; color: white; padding: 10px 6px; text-align: center; border: 1px solid #34495e; font-weight: bold; white-space: nowrap; }\n';
    htmlContent += '.gantt-table td { padding: 6px 6px; border: 1px solid #bdc3c7; vertical-align: middle; }\n';
    htmlContent += '.gantt-bar { font-family: "Courier New", monospace; font-size: 10px; white-space: pre; letter-spacing: 0px; }\n';
    htmlContent += '.priority-urgent { background-color: #ff4444; color: white; font-weight: bold; text-align: center; }\n';
    htmlContent += '.priority-high { background-color: #ff8800; color: white; font-weight: bold; text-align: center; }\n';
    htmlContent += '.priority-medium { background-color: #ffcc00; color: #333; font-weight: bold; text-align: center; }\n';
    htmlContent += '.priority-low { background-color: #44aa44; color: white; font-weight: bold; text-align: center; }\n';
    htmlContent += '.status-completed { background-color: #27ae60; color: white; text-align: center; }\n';
    htmlContent += '.status-overdue { background-color: #e74c3c; color: white; text-align: center; }\n';
    htmlContent += '.status-progress { background-color: #f39c12; color: white; text-align: center; }\n';
    htmlContent += '.status-pending { background-color: #95a5a6; color: white; text-align: center; }\n';
    htmlContent += '.milestone-row { background-color: #f0e6ff; }\n';
    htmlContent += '.numeric { text-align: right; }\n';
    htmlContent += '.center { text-align: center; }\n';
    htmlContent += '.legend-table { border-collapse: collapse; width: 100%; max-width: 800px; margin-bottom: 20px; }\n';
    htmlContent += '.legend-table td, .legend-table th { border: 1px solid #ddd; padding: 10px; vertical-align: top; }\n';
    htmlContent += '.legend-table th { background-color: #2c3e50; color: white; }\n';
    htmlContent += '.summary-card { background-color: #ecf0f1; padding: 15px; border-radius: 8px; margin-bottom: 20px; }\n';
    htmlContent += '.priority-bar { width: 100%; background-color: #ecf0f1; border-radius: 5px; overflow: hidden; height: 30px; }\n';
    htmlContent += 'h2 { color: #2c3e50; margin-top: 0; }\n';
    htmlContent += 'h3 { color: #34495e; margin-bottom: 10px; }\n';
    htmlContent += '</style>\n';
    htmlContent += '<script>\n';
    htmlContent += 'function showSheet(sheetName) {\n';
    htmlContent += '  var sheets = document.getElementsByClassName("sheet-content");\n';
    htmlContent += '  for (var i = 0; i < sheets.length; i++) {\n';
    htmlContent += '    sheets[i].classList.remove("active");\n';
    htmlContent += '  }\n';
    htmlContent += '  var tabs = document.getElementsByClassName("sheet-tab");\n';
    htmlContent += '  for (var i = 0; i < tabs.length; i++) {\n';
    htmlContent += '    tabs[i].classList.remove("active");\n';
    htmlContent += '  }\n';
    htmlContent += '  document.getElementById(sheetName).classList.add("active");\n';
    htmlContent += '  event.target.classList.add("active");\n';
    htmlContent += '}\n';
    htmlContent += '</script>\n';
    htmlContent += '</head>\n';
    htmlContent += '<body>\n';
    
    // Sheet Tabs
    htmlContent += '<div class="sheet-tabs">\n';
    htmlContent += '<div class="sheet-tab active" onclick="showSheet(\'sheet1\')">📊 GANTT CHART</div>\n';
    htmlContent += '<div class="sheet-tab" onclick="showSheet(\'sheet2\')">📖 LEGEND &amp; SUMMARY</div>\n';
    htmlContent += '</div>\n';
    
    // SHEET 1: GANTT CHART
    htmlContent += '<div id="sheet1" class="sheet-content active">\n';
    htmlContent += '<div style="padding: 10px;">\n';
    htmlContent += '<h2>📊 GANTT CHART - ' + escapeHtml(projectName || 'Project') + '</h2>\n';
    htmlContent += '<p style="color: #7f8c8d;">Generated: ' + new Date().toLocaleString() + ' | ' + projectStart.toLocaleDateString() + ' → ' + projectEnd.toLocaleDateString() + ' (' + totalDays + ' days, ' + totalWeeks + ' weeks)</p>\n';
    
    htmlContent += '<table class="gantt-table" cellspacing="0">\n';
    htmlContent += '<thead>\n';
    htmlContent += '<tr>\n';
    htmlContent += '<th style="width: 200px;">🎯 Task Name</th>\n';
    htmlContent += '<th style="width: 55px;">WBS</th>\n';
    htmlContent += '<th style="width: 85px;">📅 Start</th>\n';
    htmlContent += '<th style="width: 85px;">📅 End</th>\n';
    htmlContent += '<th style="width: 55px;">⏱️ Dur</th>\n';
    htmlContent += '<th style="width: 80px;">📈 Progress</th>\n';
    htmlContent += '<th style="width: 85px;">🎨 Priority</th>\n';
    htmlContent += '<th style="width: 110px;">💰 Cost</th>\n';
    htmlContent += '<th style="width: 120px;">👤 Assigned</th>\n';
    htmlContent += '<th style="width: 90px;">✅ Status</th>\n';
    htmlContent += '<th style="width: ' + (barWidth * 7) + 'px;">📅 Timeline (' + totalDays + ' days)</th>\n';
    htmlContent += '</tr>\n';
    htmlContent += '<tr style="background-color: #34495e;">\n';
    htmlContent += '<td colspan="10" style="background-color: #2c3e50; border: none;">&nbsp;</td>\n';
    htmlContent += '<td style="background-color: #2c3e50; padding: 5px 6px;">\n';
    htmlContent += '<div style="font-family: \'Courier New\', monospace; font-size: 9px; color: #ecf0f1; white-space: pre;">WEEK → ' + weekMarkerLine + '</div>\n';
    htmlContent += '</td>\n';
    htmlContent += '</tr>\n';
    htmlContent += '<tr style="background-color: #2c3e50;">\n';
    htmlContent += '<td colspan="10" style="background-color: #2c3e50; border: none;">&nbsp;</td>\n';
    htmlContent += '<td style="background-color: #2c3e50; padding: 5px 6px;">\n';
    htmlContent += '<div style="font-family: \'Courier New\', monospace; font-size: 9px; color: #bdc3c7; white-space: pre;">MONTH →   ' + monthMarkerLine + '</div>\n';
    htmlContent += '</td>\n';
    htmlContent += '</tr>\n';
    htmlContent += '</thead>\n';
    htmlContent += '<tbody>\n';
    
    // Task rows
    tasks.forEach(function(task) {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      const startOffset = Math.max(0, Math.ceil((taskStart.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)));
      const duration = Math.max(1, Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)));
      const barStart = Math.floor((startOffset / totalDays) * barWidth);
      const barLength = Math.max(1, Math.floor((duration / totalDays) * barWidth));
      
      let visualBar = '';
      for (let i = 0; i < barWidth; i++) {
        if (i >= barStart && i < barStart + barLength) {
          const progressPosition = barStart + Math.floor(barLength * (task.progress / 100));
          visualBar += (i < progressPosition) ? '█' : '▒';
        } else {
          visualBar += '░';
        }
      }
      
      let priorityClass = '';
      let priorityText = '';
      if (task.priority === 'urgent') {
        priorityClass = 'priority-urgent';
        priorityText = '⚠️ URGENT';
      } else if (task.priority === 'high') {
        priorityClass = 'priority-high';
        priorityText = '🔴 HIGH';
      } else if (task.priority === 'medium') {
        priorityClass = 'priority-medium';
        priorityText = '🟡 MEDIUM';
      } else {
        priorityClass = 'priority-low';
        priorityText = '🟢 LOW';
      }
      
      const today = new Date();
      const isOverdue = new Date(task.endDate) < today && task.progress < 100;
      let statusClass = '';
      let statusText = '';
      if (task.progress === 100) {
        statusClass = 'status-completed';
        statusText = '✅ COMPLETED';
      } else if (isOverdue) {
        statusClass = 'status-overdue';
        statusText = '⚠️ OVERDUE';
      } else if (task.progress > 0) {
        statusClass = 'status-progress';
        statusText = '🔄 IN PROGRESS';
      } else {
        statusClass = 'status-pending';
        statusText = '⏳ NOT STARTED';
      }
      
      const progressBarLen = 15;
      const completedBlocks = Math.floor((task.progress / 100) * progressBarLen);
      const progressBarDisplay = '█'.repeat(completedBlocks) + '░'.repeat(progressBarLen - completedBlocks);
      const milestoneStar = task.isMilestone ? '⭐ ' : '';
      const milestoneClass = task.isMilestone ? 'milestone-row' : '';
      
      htmlContent += '<tr class="' + milestoneClass + '">\n';
      htmlContent += '<td><strong>' + milestoneStar + escapeHtml(task.name) + '</strong>' + (task.isMilestone ? ' <span style="color:#8e44ad;">📌</span>' : '') + '</td>\n';
      htmlContent += '<td class="center">' + escapeHtml(task.wbs || '-') + '</td>\n';
      htmlContent += '<td class="center">' + task.startDate + '</td>\n';
      htmlContent += '<td class="center">' + task.endDate + '</td>\n';
      htmlContent += '<td class="center">' + duration + 'd</td>\n';
      htmlContent += '<td class="center">' + progressBarDisplay + ' ' + task.progress + '%</td>\n';
      htmlContent += '<td class="' + priorityClass + '">' + priorityText + '</td>\n';
      htmlContent += '<td class="numeric">' + (task.cost || 0).toLocaleString() + '</td>\n';
      htmlContent += '<td>' + escapeHtml(task.assignedTo || '—') + '</td>\n';
      htmlContent += '<td class="' + statusClass + '">' + statusText + '</td>\n';
      htmlContent += '<td class="gantt-bar" style="font-family:\'Courier New\',monospace;">' + visualBar + '</td>\n';
      htmlContent += '</tr>\n';
    });
    
    if (tasks.length === 0) {
      htmlContent += '<tr><td colspan="11" style="text-align:center; padding:40px;">📋 No tasks yet. Click "Task" to add your first task.</td></tr>\n';
    }
    
    htmlContent += '</tbody>\n';
    htmlContent += '</table>\n';
    htmlContent += '</div>\n';
    htmlContent += '</div>\n';
    
    // SHEET 2: LEGEND & SUMMARY
    htmlContent += '<div id="sheet2" class="sheet-content">\n';
    htmlContent += '<div style="padding: 20px;">\n';
    htmlContent += '<h2>📖 GANTT CHART LEGEND &amp; PROJECT SUMMARY</h2>\n';
    htmlContent += '<p style="color: #7f8c8d;">' + escapeHtml(projectName || 'Project') + ' | Generated: ' + new Date().toLocaleString() + '</p>\n';
    
    // Legend Section
    htmlContent += '<div class="summary-card">\n';
    htmlContent += '<h3>📊 GANTT BAR SYMBOLS</h3>\n';
    htmlContent += '<table class="legend-table">\n';
    htmlContent += '<tr><td style="width: 150px; font-family:\'Courier New\'; font-size:16px;">██████</td><td><strong>Completed Work</strong> - Task portion that is finished</td></tr>\n';
    htmlContent += '<tr><td style="font-family:\'Courier New\'; font-size:16px;">▒▒▒▒▒▒</td><td><strong>Remaining Work</strong> - Task portion yet to be done</td></tr>\n';
    htmlContent += '<tr><td style="font-family:\'Courier New\'; font-size:16px;">░░░░░░</td><td><strong>Not Started / Empty</strong> - No task scheduled here</td></tr>\n';
    htmlContent += '<tr><td>⭐</td><td><strong>Milestone</strong> - Key project milestone</td></tr>\n';
    htmlContent += '</table>\n';
    htmlContent += '</div>\n';
    
    // Priority Colors
    htmlContent += '<div class="summary-card">\n';
    htmlContent += '<h3>🎨 PRIORITY COLOR CODES</h3>\n';
    htmlContent += '<table class="legend-table">\n';
    htmlContent += '<tr><td style="width: 150px; background-color:#ff4444; color:white; text-align:center; padding:8px;">⚠️ URGENT</td><td><strong>Red Fill</strong> - Critical path, must be addressed immediately</td></tr>\n';
    htmlContent += '<tr><td style="background-color:#ff8800; color:white; text-align:center; padding:8px;">🔴 HIGH</td><td><strong>Orange Fill</strong> - High priority, important for project success</td></tr>\n';
    htmlContent += '<tr><td style="background-color:#ffcc00; text-align:center; padding:8px;">🟡 MEDIUM</td><td><strong>Yellow Fill</strong> - Medium priority, normal schedule</td></tr>\n';
    htmlContent += '<tr><td style="background-color:#44aa44; color:white; text-align:center; padding:8px;">🟢 LOW</td><td><strong>Green Fill</strong> - Low priority, can be deferred</td></tr>\n';
    htmlContent += '</table>\n';
    htmlContent += '</div>\n';
    
    // Status Indicators
    htmlContent += '<div class="summary-card">\n';
    htmlContent += '<h3>✅ STATUS INDICATORS</h3>\n';
    htmlContent += '<table class="legend-table">\n';
    htmlContent += '<tr><td style="width: 150px; background-color:#27ae60; color:white; text-align:center;">✅ COMPLETED</td><td>Task is 100% complete</td></tr>\n';
    htmlContent += '<tr><td style="background-color:#e74c3c; color:white; text-align:center;">⚠️ OVERDUE</td><td>Past end date but not complete</td></tr>\n';
    htmlContent += '<tr><td style="background-color:#f39c12; color:white; text-align:center;">🔄 IN PROGRESS</td><td>Work has started, in progress</td></tr>\n';
    htmlContent += '<tr><td style="background-color:#95a5a6; color:white; text-align:center;">⏳ NOT STARTED</td><td>Work not yet begun</td></tr>\n';
    htmlContent += '</table>\n';
    htmlContent += '</div>\n';
    
    // Timeline Markers
    htmlContent += '<div class="summary-card">\n';
    htmlContent += '<h3>📅 TIMELINE MARKERS</h3>\n';
    htmlContent += '<table class="legend-table">\n';
    htmlContent += '<tr><td style="width: 150px; font-family:\'Courier New\';">W1, W2, W3...</td><td><strong>Week Numbers</strong> - Weeks from project start date</td></tr>\n';
    htmlContent += '<tr><td style="font-family:\'Courier New\';">Jan, Feb, Mar...</td><td><strong>Month Markers</strong> - Month abbreviations</td></tr>\n';
    htmlContent += '<tr><td>█ Completed ▒ Remaining ░ Empty</td><td><strong>Progress Indicators</strong> - Shows task completion within the bar</td></tr>\n';
    htmlContent += '</table>\n';
    htmlContent += '</div>\n';
    
    // Project Summary
    const completedCount = tasks.filter(function(t) { return t.progress === 100; }).length;
    const inProgressCount = tasks.filter(function(t) { return t.progress > 0 && t.progress < 100; }).length;
    const notStartedCount = tasks.filter(function(t) { return t.progress === 0; }).length;
    const overdueCount = tasks.filter(function(t) { 
      const endDate = new Date(t.endDate);
      return endDate < new Date() && t.progress < 100;
    }).length;
    const milestoneCount = tasks.filter(function(t) { return t.isMilestone; }).length;
    const totalCostSum = tasks.reduce(function(sum, t) { return sum + (t.cost || 0); }, 0);
    
    htmlContent += '<div class="summary-card">\n';
    htmlContent += '<h3>📈 PROJECT SUMMARY</h3>\n';
    htmlContent += '<table class="legend-table">\n';
    htmlContent += '<tr><td style="width: 200px;"><strong>Total Tasks:</strong></td><td>' + tasks.length + '</td></tr>\n';
    htmlContent += '<tr><td><strong>✅ Completed:</strong></td><td style="color:#27ae60; font-weight:bold;">' + completedCount + '</td></tr>\n';
    htmlContent += '<tr><td><strong>🔄 In Progress:</strong></td><td style="color:#f39c12; font-weight:bold;">' + inProgressCount + '</td></tr>\n';
    htmlContent += '<tr><td><strong>⏳ Not Started:</strong></td><td>' + notStartedCount + '</td></tr>\n';
    htmlContent += '<tr><td><strong>⚠️ Overdue:</strong></td><td style="color:#e74c3c; font-weight:bold;">' + overdueCount + '</td></tr>\n';
    htmlContent += '<tr><td><strong>⭐ Milestones:</strong></td><td>' + milestoneCount + '</td></tr>\n';
    htmlContent += '<tr><td><strong>🔗 Dependencies:</strong></td><td>' + dependencies.length + '</td></tr>\n';
    htmlContent += '<tr><td><strong>💰 Total Budget:</strong></td><td><strong>KES ' + totalCostSum.toLocaleString() + '</strong></td></tr>\n';
    htmlContent += '<tr><td><strong>📅 Project Start:</strong></td><td>' + projectStart.toLocaleDateString() + '</td></tr>\n';
    htmlContent += '<tr><td><strong>📅 Project End:</strong></td><td>' + projectEnd.toLocaleDateString() + '</td></tr>\n';
    htmlContent += '<tr><td><strong>⏱️ Project Duration:</strong></td><td><strong>' + totalDays + ' days (' + totalWeeks + ' weeks)</strong></td></tr>\n';
    htmlContent += '</table>\n';
    htmlContent += '</div>\n';
    
    // Priority Distribution
    const urgentCount = tasks.filter(function(t) { return t.priority === 'urgent'; }).length;
    const highCount = tasks.filter(function(t) { return t.priority === 'high'; }).length;
    const mediumCount = tasks.filter(function(t) { return t.priority === 'medium'; }).length;
    const lowCount = tasks.filter(function(t) { return t.priority === 'low'; }).length;
    const taskTotal = tasks.length || 1;
    
    htmlContent += '<div class="summary-card">\n';
    htmlContent += '<h3>🎯 PRIORITY DISTRIBUTION</h3>\n';
    htmlContent += '<table class="legend-table">\n';
    htmlContent += '<tr><td style="width: 200px;">🔴 Urgent:</td><td>' + urgentCount + ' (' + Math.round((urgentCount / taskTotal) * 100) + '%)</td></tr>\n';
    htmlContent += '<tr><td>🟠 High:</td><td>' + highCount + ' (' + Math.round((highCount / taskTotal) * 100) + '%)</td></tr>\n';
    htmlContent += '<tr><td>🟡 Medium:</td><td>' + mediumCount + ' (' + Math.round((mediumCount / taskTotal) * 100) + '%)</td></tr>\n';
    htmlContent += '<tr><td>🟢 Low:</td><td>' + lowCount + ' (' + Math.round((lowCount / taskTotal) * 100) + '%)</td></tr>\n';
    htmlContent += '</table>\n';
    htmlContent += '<div class="priority-bar">\n';
    htmlContent += '<div style="background-color:#ff4444; width:' + ((urgentCount / taskTotal) * 100) + '%; height:30px; float:left;"></div>\n';
    htmlContent += '<div style="background-color:#ff8800; width:' + ((highCount / taskTotal) * 100) + '%; height:30px; float:left;"></div>\n';
    htmlContent += '<div style="background-color:#ffcc00; width:' + ((mediumCount / taskTotal) * 100) + '%; height:30px; float:left;"></div>\n';
    htmlContent += '<div style="background-color:#44aa44; width:' + ((lowCount / taskTotal) * 100) + '%; height:30px; float:left;"></div>\n';
    htmlContent += '</div>\n';
    htmlContent += '</div>\n';
    
    // Printing Instructions
    htmlContent += '<div style="background-color: #ecf0f1; padding: 15px; border-radius: 8px; margin-top: 20px;">\n';
    htmlContent += '<h3>🖨️ PRINTING INSTRUCTIONS</h3>\n';
    htmlContent += '<ul style="margin: 10px 0;">\n';
    htmlContent += '<li>Page Setup → <strong>Landscape</strong> orientation</li>\n';
    htmlContent += '<li>Margins → <strong>Narrow</strong> (0.5" or 1.27cm)</li>\n';
    htmlContent += '<li>Scaling → <strong>Fit Sheet on One Page</strong></li>\n';
    htmlContent += '<li>Print quality → <strong>High</strong></li>\n';
    htmlContent += '</ul>\n';
    htmlContent += '<p style="margin-top: 10px; font-size: 12px;">💡 <strong>Tip:</strong> For best Gantt bar alignment, set column K font to "Courier New" (monospace).</p>\n';
    htmlContent += '</div>\n';
    htmlContent += '</div>\n';
    htmlContent += '</div>\n';
    
    htmlContent += '</body>\n';
    htmlContent += '</html>';
    
    // Create and download as .xls file
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Gantt_Chart_' + (projectName || 'Project') + '_' + new Date().toISOString().split('T')[0] + '.xls';
    a.click();
    URL.revokeObjectURL(url);
    
    addLog('Exported multi-tab Excel file with separate legend tab');
    alert('✅ Professional Multi-Tab Gantt Chart exported!\n\n📁 File: Gantt_Chart_' + (projectName || 'Project') + '_' + new Date().toISOString().split('T')[0] + '.xls\n\n📑 TABS INCLUDED:\n• Tab 1: GANTT CHART - Main timeline view\n• Tab 2: LEGEND & SUMMARY - All symbols, colors, and project stats\n\n🎨 Features:\n• Week markers aligned with bars\n• Color-coded priorities\n• Status indicators\n• Priority distribution chart\n• Complete project summary\n• Ready for printing!');
  };











  // Export to high-res image
  const exportToHighResImage = async () => {
    if (!ganttContainerRef.current) return;
    try {
      addLog('Capturing high-res image...');
      const canvas = await html2canvas(ganttContainerRef.current, { scale: 4, backgroundColor: '#ffffff', logging: false });
      const link = document.createElement('a');
      link.download = `gantt-${projectName || projectId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      addLog(`Saved ${canvas.width}x${canvas.height}px image`);
      alert(`✅ High-res image saved!\n\n📊 ${canvas.width}x${canvas.height} pixels`);
    } catch (error) {
      addLog(`❌ Export error: ${error}`);
      alert('Failed to export image');
    }
  };


  // Save column configuration
  useEffect(() => {
    localStorage.setItem(`gantt_columns_${projectId}`, JSON.stringify(columns));
  }, [columns, projectId]);



  // Fullscreen change listener - detects when user presses ESC
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Trigger resize to adjust layout
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);


// Fullscreen change listener - detects when user presses ESC
useEffect(() => {
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
    // Trigger resize to adjust layout
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      // Force scroll position reset
      if (ganttContainerRef.current) {
        ganttContainerRef.current.style.maxHeight = document.fullscreenElement 
          ? 'calc(100vh - 60px)' 
          : 'calc(100vh - 180px)';
      }
    }, 100);
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500);
  };
  
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
}, []);





useEffect(() => {
  loadFromBackend();
  fetchProjectName();
  // Force fetch currency settings when Gantt loads
  if (!currencySettings) {
    fetchCurrencySettings();
  }
}, [projectId]);

useEffect(() => {
  if (currencySettings) {
    console.log('✅ Currency settings loaded:', currencySettings);
    window.dispatchEvent(new Event('resize'));
  }
}, [currencySettings]);

// Force recalculation when container becomes visible (fix for stakeholder refresh)
useEffect(() => {
  const checkAndRecalculate = () => {
    if (ganttContainerRef.current && ganttContainerRef.current.clientWidth > 0) {
      console.log('Container is now visible, width:', ganttContainerRef.current.clientWidth);
      window.dispatchEvent(new Event('resize'));
      return true;
    }
    return false;
  };
  
  // Check immediately
  if (!checkAndRecalculate()) {
    // Retry after short intervals
    const intervals = [100, 200, 500, 1000];
    intervals.forEach(delay => {
      setTimeout(() => checkAndRecalculate(), delay);
    });
  }
  
  return () => {};
}, [tasks]);





  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.export-menu-container') && showExportMenu) {
        setShowExportMenu(false);
      }
      if (!target.closest('.import-menu-container') && showImportMenu) {
        setShowImportMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExportMenu, showImportMenu]);




  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') { undo(); e.preventDefault(); }
      if (e.ctrlKey && e.key === 'y') { redo(); e.preventDefault(); }
      if (e.ctrlKey && e.key === 'n') { addNewTask(); e.preventDefault(); }
      if (e.ctrlKey && e.key === 's') { handleManualSave(); e.preventDefault(); }
      if (e.ctrlKey && e.key === 'd') { setShowDependencyModal(true); e.preventDefault(); }
      if (e.ctrlKey && e.key === 'p') { setShowPrintDialog(true); e.preventDefault(); }
      if (e.key === 'Delete' && selectedTask) { deleteSingleTask(selectedTask); e.preventDefault(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTask]);





  const fetchProjectName = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProjectName(data.name);
      }
    } catch (error) {
      console.error('Error fetching project name:', error);
    }
  };




const loadFromBackend = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/gantt`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.tasks && data.tasks.length > 0) {
        // Convert cost from string to number for each task
        const fixedTasks = data.tasks.map((task: Task) => ({
          ...task,
          cost: typeof task.cost === 'string' ? Number(task.cost) : (task.cost || 0)
        }));
        setTasks(fixedTasks);
        setDependencies(data.dependencies || []);
        const parentIds = new Set(data.tasks.filter((t: Task) => t.parentId === null).map((t: Task) => t.id));
        setExpandedTasks(parentIds);
        saveToHistory();
      } else {
        setTasks([]);
        setDependencies([]);
      }
    }
  } catch (error) {
    console.error('Error loading:', error);
  } finally {
    setLoading(false);
  }
};



  // Edit existing task
  const editTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskForm({
      name: task.name,
      startDate: task.startDate,
      endDate: task.endDate,
      progress: task.progress,
      parentId: task.parentId,
      priority: task.priority,
      cost: task.cost || 0,
      assignedTo: task.assignedTo || ''
    });
    setShowTaskModal(true);
  };

  const addNewTask = () => {
    setEditingTask(null);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    setTaskForm({
      name: '',
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
      progress: 0,
      parentId: null,
      priority: 'medium',
      cost: 0,
      assignedTo: ''
    });
    setShowTaskModal(true);
  };




  const handleSaveTask = () => {
    if (!taskForm.name.trim()) {
      alert('Please enter a task name');
      return;
    }
    
    // Validate dates
    const start = new Date(taskForm.startDate);
    const end = new Date(taskForm.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      alert('❌ Invalid date format');
      return;
    }
    if (start > end) {
      alert('❌ Start date cannot be after end date');
      return;
    }
    
    if (editingTaskId !== null) {
      // UPDATE existing task
      const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      setTasks(prev => prev.map(task => 
        task.id === editingTaskId 
          ? { 
              ...task, 
              name: taskForm.name,
              startDate: taskForm.startDate,
              endDate: taskForm.endDate,
              duration: duration,
              progress: taskForm.progress,
              parentId: taskForm.parentId,
              priority: taskForm.priority,
              cost: taskForm.cost,
              assignedTo: taskForm.assignedTo
            }
          : task
      ));
      addLog(`Updated task: ${taskForm.name}`);
    } else {
      // ADD new task
      const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
      const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      
      const newTask: Task = {
        id: newId,
        name: taskForm.name,
        startDate: taskForm.startDate,
        endDate: taskForm.endDate,
        duration: duration,
        progress: taskForm.progress,
        parentId: taskForm.parentId,
        priority: taskForm.priority,
        cost: taskForm.cost,
        assignedTo: taskForm.assignedTo,
        wbs: taskForm.parentId ? `${tasks.find(t => t.id === taskForm.parentId)?.wbs || ''}.${Math.floor(Math.random() * 10)}` : `${Math.floor(Math.random() * 10)}.0`
      };
      
      setTasks([...tasks, newTask]);
      addLog(`Added task: ${newTask.name}`);
    }
    
    setShowTaskModal(false);
    setEditingTaskId(null);
    // Reset form
    setTaskForm({
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
      parentId: null,
      priority: 'medium',
      cost: 0,
      assignedTo: ''
    });
    saveToHistory();
  };


    

  const deleteSingleTask = (taskId: number, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    if (isStakeholder) return;
    
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (confirm(`Delete "${taskToDelete?.name}" and its sub-tasks?`)) {
      setTasks(prev => prev.filter(task => task.id !== taskId && task.parentId !== taskId));
      setDependencies(prev => prev.filter(d => d.fromTaskId !== taskId && d.toTaskId !== taskId));
      if (selectedTask === taskId) setSelectedTask(null);
      saveToHistory();
      addLog(`Deleted task: ${taskToDelete?.name}`);
    }
  };

  const addDependency = (fromTaskId: number, toTaskId: number, type: Dependency['type'] = 'finish-to-start') => {
    if (isStakeholder) return;
    const newId = Math.max(...dependencies.map(d => d.id), 0) + 1;
    setDependencies([...dependencies, { id: newId, fromTaskId, toTaskId, type }]);
    saveToHistory();
    addLog(`Added dependency: ${tasks.find(t => t.id === fromTaskId)?.name} → ${tasks.find(t => t.id === toTaskId)?.name}`);
  };

  const removeDependency = (dependencyId: number) => {
    if (isStakeholder) return;
    setDependencies(dependencies.filter(d => d.id !== dependencyId));
    saveToHistory();
  };

  const updateTaskProgress = (taskId: number, newProgress: number) => {
    if (isStakeholder) return;
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, progress: newProgress } : task));
  };

  const toggleExpand = (taskId: number) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) newExpanded.delete(taskId);
    else newExpanded.add(taskId);
    setExpandedTasks(newExpanded);
  };

  // Color coding based on priority and progress
  const getTaskBarColor = (task: Task) => {
    if (task.isMilestone) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (task.progress === 100) return 'bg-gradient-to-r from-emerald-500 to-green-600';
    if (task.priority === 'urgent') return 'bg-gradient-to-r from-red-500 to-red-700';
    if (task.priority === 'high') return 'bg-gradient-to-r from-orange-500 to-orange-700';
    if (task.priority === 'medium') return 'bg-gradient-to-r from-amber-500 to-amber-700';
    return 'bg-gradient-to-r from-blue-500 to-blue-700';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      default: return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
    }
  };




const formatDate = (dateStr: string | undefined | null) => {
  // Handle null, undefined, or empty values
  if (!dateStr || dateStr === 'Invalid' || dateStr === 'undefined' || dateStr === 'null') {
    return '—';
  }
  
  try {
    let date: Date;
    
    // Handle YYYY-MM-DD format specifically
    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parts = dateStr.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      date = new Date(year, month, day);
    } else {
      // Try standard parsing
      date = new Date(dateStr);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`[formatDate] Invalid date: ${dateStr}`);
      return '—';
    }
    
    // Format as "MMM DD" (e.g., "Jun 1")
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    console.error(`[formatDate] Error formatting: ${dateStr}`, error);
    return '—';
  }
};




// Format currency based on company settings
const formatCurrency = (amount: number): string => {
  if (isNaN(amount) || amount === 0) return `${currencySymbol} 0`;
  
  return `${currencySymbol} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
};

// Format budget in millions
const formatBudgetInMillions = (amount: number): string => {
  if (isNaN(amount) || amount === 0) return `${currencySymbol} 0`;
  
  const millions = amount / 1000000;
  
  if (millions >= 1000) {
    const billions = millions / 1000;
    return `${currencySymbol} ${billions.toLocaleString(undefined, { maximumFractionDigits: 1 })}B`;
  }
  
  return `${currencySymbol} ${millions.toLocaleString(undefined, { maximumFractionDigits: 1 })}M`;
};



  const getDaysRemaining = (endDateStr: string) => {
    try {
      const end = new Date(endDateStr);
      if (isNaN(end.getTime())) return 0;
      const diff = Math.ceil((end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  };

  const { minDate, maxDate } = getProjectDateRange();

  // Timeline headers with dynamic sizing
  const getTimelineUnit = () => {
    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const effectiveDays = totalDays / zoomLevel;
    
    // Show week numbers for most zoom levels
    if (effectiveDays > 90) {
      return { unit: 'month', label: 'Month', daysPerUnit: 30, width: 70, getLabel: (date: Date) => date.toLocaleDateString('en-US', { month: 'short' }) };
    } else if (effectiveDays > 21) {
      return { unit: 'week', label: 'Week', daysPerUnit: 7, width: 55, getLabel: (date: Date) => {
        const weekNum = Math.ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
        return `W${weekNum}`;
      } };
    } else {
      return { unit: 'day', label: 'Day', daysPerUnit: 1, width: 40, getLabel: (date: Date) => date.getDate().toString() };
    }
  };


  const timelineUnit = getTimelineUnit();
  
  // Generate timeline headers with percentage widths for perfect alignment
  const timelineHeaders = (() => {
    const headers: { date: Date; label: string; widthPercent: number }[] = [];
    const totalMs = maxDate.getTime() - minDate.getTime();
    if (totalMs <= 0) return headers;
    
    const unit = getTimelineUnit();
    let current = new Date(minDate);
    
    if (unit.unit === 'month') {
      current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      while (current <= maxDate) {
        const monthStart = Math.max(current.getTime(), minDate.getTime());
        const monthEnd = Math.min(new Date(current.getFullYear(), current.getMonth() + 1, 1).getTime(), maxDate.getTime());
        const widthPercent = ((monthEnd - monthStart) / totalMs) * 100;
        headers.push({ date: new Date(current), label: unit.getLabel(current), widthPercent: Math.max(3, widthPercent) });
        current.setMonth(current.getMonth() + 1);
      }
    } 
    else if (unit.unit === 'week') {
      // Start from Monday of the first week
      const dayOfWeek = current.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      current.setDate(current.getDate() - daysToMonday);
      while (current <= maxDate) {
        const weekStart = Math.max(current.getTime(), minDate.getTime());
        const weekEnd = Math.min(current.getTime() + 7 * 24 * 60 * 60 * 1000, maxDate.getTime());
        const widthPercent = ((weekEnd - weekStart) / totalMs) * 100;
        headers.push({ date: new Date(current), label: unit.getLabel(current), widthPercent: Math.max(2, widthPercent) });
        current.setDate(current.getDate() + 7);
      }
    }
    else {
      // Day unit
      current = new Date(minDate);
      current.setHours(0, 0, 0, 0);
      while (current <= maxDate) {
        const dayStart = current.getTime();
        const dayEnd = Math.min(dayStart + 24 * 60 * 60 * 1000, maxDate.getTime());
        const widthPercent = ((dayEnd - dayStart) / totalMs) * 100;
        headers.push({ date: new Date(current), label: current.getDate().toString(), widthPercent: Math.max(1, widthPercent) });
        current.setDate(current.getDate() + 1);
      }
    }
    
    return headers;
  })();





  const calculateBarPosition = (startDateStr: string, endDateStr: string) => {
    // Clean up date strings (remove time part if present)
    let cleanStart = startDateStr;
    let cleanEnd = endDateStr;
    
    if (cleanStart && cleanStart.includes('T')) {
      cleanStart = cleanStart.split('T')[0];
    }
    if (cleanEnd && cleanEnd.includes('T')) {
      cleanEnd = cleanEnd.split('T')[0];
    }
    
    const start = new Date(cleanStart);
    const end = new Date(cleanEnd);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { left: '0%', width: '0%' };
    }
    
    const totalDays = maxDate.getTime() - minDate.getTime();
    
    // If totalDays is 0 or invalid, return default
    if (totalDays <= 0) {
      return { left: '0%', width: '10%' };
    }
    
    const startOffset = start.getTime() - minDate.getTime();
    const duration = end.getTime() - start.getTime();
    let left = (startOffset / totalDays) * 100;
    let width = (duration / totalDays) * 100;
    
    // Ensure minimum visibility
    if (width < 0.5 && duration > 0) width = 0.5;
    if (left < 0) left = 0;
    if (left > 100) left = 100;
    if (width > 100) width = 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };





  const getVisibleTasks = (): Task[] => {
    let filtered = [...tasks];
    if (searchTerm) {
      filtered = filtered.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (quickFilter === 'overdue') {
      filtered = filtered.filter(t => getDaysRemaining(t.endDate) < 0 && t.progress < 100);
    }
    if (quickFilter === 'milestones') {
      filtered = filtered.filter(t => t.isMilestone);
    }
    if (quickFilter === 'high-priority') {
      filtered = filtered.filter(t => t.priority === 'high' || t.priority === 'urgent');
    }
    
    const visible: Task[] = [];
    const rootTasks = filtered.filter(t => t.parentId === null);
    const addTaskWithChildren = (task: Task) => {
      visible.push(task);
      if (expandedTasks.has(task.id)) {
        const children = filtered.filter(t => t.parentId === task.id);
        children.forEach(child => addTaskWithChildren(child));
      }
    };
    rootTasks.forEach(task => addTaskWithChildren(task));
    return visible;
  };

  const visibleTasks = getVisibleTasks();
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
  const visibleColumns = sortedColumns.filter(c => c.visible);
  const totalCost = tasks.reduce((sum, t) => sum + (t.cost || 0), 0);
  const completedTasks = tasks.filter(t => t.progress === 100).length;




  // Helper functions for column management
  const startResize = (colId: string, startX: number, currentWidth: number) => {
    setResizingColumn(colId);
    setResizeStartX(startX);
    setResizeStartWidth(currentWidth);
  };

  const startDrag = (colId: string, startX: number, currentOrder: number) => {
    setDraggingColumn(colId);
    setDragStartX(startX);
    setDragStartOrder(currentOrder);
  };

  const toggleColumnVisibility = (colId: string) => {
    setColumns(prev => prev.map(col => col.id === colId ? { ...col, visible: !col.visible } : col));
  };

  const resetColumnLayout = () => {
    setColumns(DEFAULT_COLUMNS);
    localStorage.removeItem(`gantt_columns_${projectId}`);
  };

  // Add resize/drag mouse handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumn) {
        const delta = e.clientX - resizeStartX;
        const newWidth = Math.max(60, resizeStartWidth + delta);
        setColumns(prev => prev.map(col => col.id === resizingColumn ? { ...col, width: newWidth } : col));
      }
    };
    const handleMouseUp = () => {
      setResizingColumn(null);
      setDraggingColumn(null);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn, resizeStartX, resizeStartWidth]);




  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 size={48} className="animate-spin text-amber-500" />
        <p className="ml-3 text-gray-500 dark:text-gray-400">Loading Professional Gantt Chart...</p>
      </div>
    );
  }



  return (

<div 
  ref={fullscreenRef} 
  className="space-y-3" 
  style={{ height: isFullscreen ? '100vh' : 'auto', overflow: isFullscreen ? 'hidden' : 'visible' }}
>


      {/* Professional Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md sticky top-0 z-30">
        <div className="flex flex-wrap items-center justify-between p-2 gap-1 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 flex-wrap">
            <button onClick={addNewTask} className="px-2 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm flex items-center gap-1 transition">
              <Plus size={14} /> Task
            </button>
            <button onClick={() => setShowDependencyModal(true)} className="px-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm flex items-center gap-1 transition">
              <Link size={14} /> Link
            </button>
            
            {/* Auto-save Save Button */}
            <div className="relative">
              <button 
                onClick={handleManualSave} 
                disabled={saving || autoSaveStatus === 'saving'}
                className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm flex items-center gap-1 transition"
              >
                {autoSaveStatus === 'saving' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : autoSaveStatus === 'saved' ? (
                  <CheckCircle size={14} />
                ) : autoSaveStatus === 'error' ? (
                  <AlertTriangle size={14} />
                ) : (
                  <Save size={14} />
                )}
                {autoSaveStatus === 'saving' ? 'Saving...' : 
                 autoSaveStatus === 'saved' ? 'Saved' : 
                 autoSaveStatus === 'error' ? 'Error' : 'Save'}
              </button>
              
              {unsavedChanges && autoSaveStatus !== 'saving' && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              )}
            </div>
            
            {/* Auto-save Toggle */}
            <button 
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className={`px-2 py-1.5 rounded text-sm flex items-center gap-1 transition ${
                autoSaveEnabled 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
              title={autoSaveEnabled ? 'Auto-save is ON' : 'Auto-save is OFF'}
            >
              <Sparkles size={14} />
              Auto {autoSaveEnabled ? 'ON' : 'OFF'}
            </button>
            
            <button onClick={clearAllTasks} className="px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center gap-1 transition">
              <Eraser size={14} /> Clear
            </button>
            <button onClick={loadSampleData} className="px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1 transition">
              <Sparkles size={14} /> Sample
            </button>
            
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>



            
            <div className="relative export-menu-container">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)} 
                className="px-2 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm flex items-center gap-1 transition"
              >
                <Download size={14} /> Export ▼
              </button>
              {showExportMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded border border-gray-200 dark:border-gray-700 min-w-[180px] z-20">

                  <button onClick={() => { exportToMSProject(); closeExportMenu(); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">📊 MS Project XML</button>


<button onClick={() => { exportToExcel(); closeExportMenu(); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
  📊 Export to Excel (Multi-Tab)
</button>


                  <button onClick={() => { handlePrint(); closeExportMenu(); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">📄 PDF (Professional)</button>
                  <button onClick={() => { exportToHighResImage(); closeExportMenu(); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">🖼️ High-Res PNG</button>
                  <button onClick={() => { exportToCSV(); closeExportMenu(); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">📊 Export CSV (Simple)</button>
                </div>
              )}
            </div>

            
            <div className="relative import-menu-container">
              <button onClick={() => setShowImportMenu(!showImportMenu)} className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm flex items-center gap-1 transition">
                <Upload size={14} /> Import ▼
              </button>
              {showImportMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded border border-gray-200 dark:border-gray-700 min-w-[160px] z-20">



                  <button onClick={() => { fileInputRef.current?.click(); closeImportMenu(); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">📁 MS Project XML</button>



                  <input ref={fileInputRef} type="file" accept=".xml" onChange={importMSProject} className="hidden" />
                </div>
              )}
            </div>
            
            <button onClick={() => setShowPrintDialog(true)} className="px-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm flex items-center gap-1 transition">
              <Printer size={14} /> Print
            </button>
            <button onClick={() => setShowColumnConfig(true)} className="px-2 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm flex items-center gap-1 transition">
              <Eye size={14} /> Columns
            </button>
            
            <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700 rounded p-0.5">
              <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))} className="p-1.5 rounded hover:bg-white/50"><ZoomOut size={14} /></button>
              <span className="text-xs w-12 text-center dark:text-white">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))} className="p-1.5 rounded hover:bg-white/50"><ZoomIn size={14} /></button>
              <button onClick={toggleFullscreen} className="p-1.5 rounded hover:bg-white/50">{isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</button>
            </div>
            
            <div className="flex gap-0.5">
              <button onClick={undo} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Undo (Ctrl+Z)"><Undo size={14} /></button>
              <button onClick={redo} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Redo (Ctrl+Y)"><Redo size={14} /></button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-7 pr-2 py-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-36" />
            </div>
            <div className="flex gap-0.5 text-xs">
              <button onClick={() => setQuickFilter('all')} className={`px-2 py-1 rounded ${quickFilter === 'all' ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>All</button>
              <button onClick={() => setQuickFilter('overdue')} className={`px-2 py-1 rounded flex items-center gap-1 ${quickFilter === 'overdue' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}><AlertTriangle size={10} /> Overdue</button>
              <button onClick={() => setQuickFilter('milestones')} className={`px-2 py-1 rounded ${quickFilter === 'milestones' ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}><Star size={10} /> Milestones</button>
            </div>
          </div>
        </div>


        
{/* Stats Dashboard */}
<div className="grid grid-cols-6 gap-2 p-2 text-xs bg-gray-50 dark:bg-gray-800/50">
  <div className="text-center"><span className="text-gray-500 dark:text-gray-400">Tasks:</span> <strong className="dark:text-white">{tasks.length}</strong></div>
  <div className="text-center"><span className="text-gray-500 dark:text-gray-400">Completed:</span> <strong className="text-emerald-600">{completedTasks}</strong></div>
  <div className="text-center"><span className="text-gray-500 dark:text-gray-400">Overdue:</span> <strong className="text-red-600">{tasks.filter(t => getDaysRemaining(t.endDate) < 0 && t.progress < 100).length}</strong></div>
  <div className="text-center"><span className="text-gray-500 dark:text-gray-400">Dependencies:</span> <strong className="dark:text-white">{dependencies.length}</strong></div>
  <div className="text-center"><span className="text-gray-500 dark:text-gray-400">Budget:</span> <strong className="text-cyan-600">{formatBudgetInMillions(totalCost)}</strong></div>
  <div className="text-center"><span className="text-gray-500 dark:text-gray-400">Progress:</span> <strong className="text-emerald-600">{tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0}%</strong></div>
</div>



      </div>

      {/* Print Dialog */}
      {showPrintDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold dark:text-white">Professional Print</h3>
              <button onClick={() => setShowPrintDialog(false)} className="dark:text-gray-400"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select value={printPaperSize} onChange={(e) => setPrintPaperSize(e.target.value as any)} 
                  className="px-2 py-1.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
                  <option value="A0">A0 (Architectural)</option><option value="A1">A1 (Large Poster)</option>
                  <option value="A2">A2 (Medium)</option><option value="A3">A3 (Small)</option><option value="A4">A4 (Letter)</option>
                </select>
                <select value={printOrientation} onChange={(e) => setPrintOrientation(e.target.value as any)} 
                  className="px-2 py-1.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
                  <option value="landscape">Landscape</option><option value="portrait">Portrait</option>
                </select>
              </div>
              <select value={printScale} onChange={(e) => setPrintScale(e.target.value as any)} 
                className="w-full px-2 py-1.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
                <option value="fit">Fit to Page</option><option value="actual">Actual Size</option><option value="shrink">Shrink to Fit</option>
              </select>
              <button onClick={handlePrint} className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold">Generate Professional PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Print Container - Hidden, used for capturing full chart */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="print-container" style={{ padding: '20px', background: 'white', width: '100%' }}>
          <div style={{ marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>Project Gantt Chart</h1>
            <p style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>Project: {projectName} | Generated: {new Date().toLocaleString()} | Paper: {printPaperSize} {printOrientation}</p>
          </div>
          <div dangerouslySetInnerHTML={{ __html: ganttContainerRef.current?.outerHTML || '' }} />
        </div>
      </div>

      {/* Column Config Modal - Dark Mode */}
      {showColumnConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold dark:text-white">Customize Columns</h3>
              <button onClick={() => setShowColumnConfig(false)} className="dark:text-gray-400"><X size={18} /></button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {[...columns].sort((a, b) => a.order - b.order).map(col => (
                <div key={col.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <div className="cursor-grab" onMouseDown={(e) => startDrag(col.id, e.clientX, col.order)}><GripVertical size={14} /></div>
                  <input type="checkbox" checked={col.visible} onChange={() => toggleColumnVisibility(col.id)} className="rounded" />
                  <span className="flex-1 text-sm dark:text-gray-300">{col.label}</span>
                  <div className="text-xs text-gray-400">{col.width}px</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={resetColumnLayout} className="px-3 py-1.5 border rounded text-sm">Reset</button>
              <button onClick={() => setShowColumnConfig(false)} className="px-3 py-1.5 bg-amber-600 text-white rounded text-sm">Done</button>
            </div>
          </div>
        </div>
      )}



      {/* Gantt Chart Container */}
<div 
  ref={ganttContainerRef} 
  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-y-auto overflow-x-auto shadow-md" 
  style={{ 
    maxHeight: isFullscreen ? 'calc(100vh - 60px)' : 'calc(100vh - 180px)',
    minWidth: '100%',
    width: '100%',
    display: 'block'
  }}
>


        <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}>
          {/* Header */}
          <div className="flex border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/90 sticky top-0 z-10">
            {visibleColumns.map((col) => (
              <div key={col.id} className="flex-shrink-0 px-2 py-2 font-semibold text-xs text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 relative" style={{ width: col.width }}>
                {col.label}
                <div className="absolute right-0 top-0 w-0.5 h-full cursor-ew-resize hover:bg-amber-400" onMouseDown={(e) => startResize(col.id, e.clientX, col.width)} />
              </div>
            ))}




            <div className="flex-1 flex">
              {timelineHeaders.map((header, idx) => (
                <div 
                  key={idx} 
                  className="text-center py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 truncate"
                  style={{ width: `${header.widthPercent}%`, minWidth: '40px' }}
                  title={header.date.toLocaleDateString()}
                >
                  {header.label}
                </div>
              ))}
            </div>




            <div className="w-8 flex-shrink-0"></div>
          </div>

          {/* Task Rows */}
          {visibleTasks.map((task) => {
            const isParent = tasks.some(t => t.parentId === task.id);
            const { left, width } = calculateBarPosition(task.startDate, task.endDate);
            const isOverdue = getDaysRemaining(task.endDate) < 0 && task.progress < 100;
            const barColor = getTaskBarColor(task);
            
            return (
              <div key={task.id} 
                className={`flex border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer ${selectedTask === task.id ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`} 
                onClick={() => setSelectedTask(task.id)}>
                {visibleColumns.map((col) => (
                  <div key={col.id} className="flex-shrink-0 px-2 py-1.5 text-xs border-r border-gray-100 dark:border-gray-800 truncate" style={{ width: col.width }}>
                    {col.id === 'name' ? (
                      <div className="flex items-center gap-1">
                        {isParent && (
                          <button onClick={(e) => { e.stopPropagation(); toggleExpand(task.id); }} className="text-gray-400 hover:text-amber-500">
                            {expandedTasks.has(task.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </button>
                        )}
                        <span className={`${task.parentId === null ? "font-semibold" : "ml-4"} truncate dark:text-gray-200`}>{task.name}</span>
                        {task.isMilestone && <Star size={10} className="text-purple-400" />}
                        {dependencies.some(d => d.toTaskId === task.id) && <Link2 size={10} className="text-indigo-400" />}
                      </div>
                    ) : col.id === 'priority' ? (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>

) : col.id === 'cost' ? (
  <span className="font-mono dark:text-gray-300">{formatCurrency(task.cost || 0)}</span>


                    ) : col.id === 'progress' ? (
                      <div className="flex items-center gap-1">
                        {!isStakeholder ? (
                          <select value={task.progress} onChange={(e) => updateTaskProgress(task.id, parseInt(e.target.value))} 
                            className="text-xs px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-200 w-full" onClick={(e) => e.stopPropagation()}>
                            {[0, 25, 50, 75, 100].map(p => <option key={p} value={p}>{p}%</option>)}
                          </select>
                        ) : (
                          <span className={`font-mono font-medium ${task.progress === 100 ? 'text-emerald-600' : 'text-gray-600'}`}>{task.progress}%</span>
                        )}
                      </div>


                    ) : col.id === 'start' ? (
                      <span className="dark:text-gray-300">{formatDate(task.startDate)}</span>
                    ) : col.id === 'end' ? (
                      <span className="dark:text-gray-300">{formatDate(task.endDate)}</span>
                    ) : col.id === 'duration' ? (


                      <span className="dark:text-gray-300">{task.duration}d</span>
                    ) : col.id === 'wbs' ? (
                      <span className="font-mono dark:text-gray-300">{task.wbs}</span>
                    ) : col.id === 'assignedTo' ? (
                      <span className="dark:text-gray-300">{task.assignedTo || '-'}</span>
                    ) : (
                      <span className="dark:text-gray-300">{task[col.id as keyof Task] as string}</span>
                    )}
                  </div>
                ))}
                <div className="flex-1 relative py-1">
                  <div className="relative h-7 bg-gray-100 dark:bg-gray-700/50 rounded overflow-hidden">



                    <div className="absolute inset-0 flex">
                      {timelineHeaders.map((header, idx) => (
                        <div 
                          key={idx} 
                          className="border-r border-gray-200 dark:border-gray-700/50"
                          style={{ width: `${header.widthPercent}%`, minWidth: '2px' }}
                        />
                      ))}
                    </div>


                    {(task.isMilestone || task.duration === 0 || task.name.includes('🎉')) ? (
                      <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-500 shadow-md" style={{ left: `calc(${left} - 6px)` }}>
                        <Star size={8} className="text-white absolute top-0.5 left-0.5" />
                      </div>
                    ) : (
                      <div className={`absolute top-0.5 h-6 rounded-md shadow-sm transition-all cursor-pointer ${barColor} ${isOverdue ? 'ring-2 ring-red-400' : ''}`} 
                        style={{ left: left, width: width }} title={`${task.name}: ${formatDate(task.startDate)} - ${formatDate(task.endDate)}`}>
                        <div className="absolute inset-0 bg-white/25 rounded-md" style={{ width: `${task.progress}%` }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[9px] font-medium text-white drop-shadow-sm">{task.progress}%</span>
                        </div>
                      </div>
                    )}

                 </div>
                </div>




                {!isStakeholder && !task.isMilestone && (
                  <div className="w-16 flex-shrink-0 flex items-center justify-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); editTask(task); }} 
                      className="text-gray-400 hover:text-blue-500 transition"
                      title="Edit Task"
                    >
                      <Edit size={12} />
                    </button>
                    <button 
                      onClick={(e) => deleteSingleTask(task.id, e)} 
                      className="text-gray-400 hover:text-red-500 transition"
                      title="Delete Task"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}

              </div>
            );
          })}

         
          {visibleTasks.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400 mb-3">No tasks yet. Get started below:</p>
              <div className="flex gap-3 justify-center">
                <button onClick={addNewTask} className="px-4 py-2 bg-amber-600 text-white rounded-lg flex items-center gap-2"><Plus size={16} /> Add First Task</button>
                <button onClick={loadSampleData} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"><Sparkles size={16} /> Load Sample Project</button>
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2"><Upload size={16} /> Import MS Project</button>
              </div>
            </div>
          )}
        </div>
      </div>





      {/* Task Modal - Full Dark Mode */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold dark:text-white">{editingTaskId !== null ? 'Edit Task' : 'Add New Task'}</h3>
              <button onClick={() => { setShowTaskModal(false); setEditingTaskId(null); }} className="dark:text-gray-400 hover:dark:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="e.g., Foundation Excavation, Steel Reinforcement, Roofing" 
                value={taskForm.name} 
                onChange={(e) => setTaskForm({...taskForm, name: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" 
              />
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="date" 
                  value={taskForm.startDate} 
                  onChange={(e) => setTaskForm({...taskForm, startDate: e.target.value})} 
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                />
                <input 
                  type="date" 
                  value={taskForm.endDate} 
                  onChange={(e) => setTaskForm({...taskForm, endDate: e.target.value})} 
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                />
              </div>
              <select 
                value={taskForm.parentId || ''} 
                onChange={(e) => setTaskForm({...taskForm, parentId: e.target.value ? parseInt(e.target.value) : null})} 
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">-- No Parent --</option>
                {tasks.filter(t => t.parentId === null).map(task => (<option key={task.id} value={task.id}>{task.name}</option>))}
              </select>
              <select 
                value={taskForm.priority} 
                onChange={(e) => setTaskForm({...taskForm, priority: e.target.value as any})} 
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>





<input 
  type="number" 
  placeholder="e.g., 50000, 150000, 500000" 
  value={taskForm.cost} 
  onChange={(e) => setTaskForm({...taskForm, cost: parseInt(e.target.value) || 0})} 
  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500" 
  step="1000"
  min="0"
/>

<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Examples: 50,000 (materials), 150,000 (labor), 500,000 (equipment)</p>


              <input 
                type="text" 
                placeholder="e.g., John M. - Site Manager, Sarah K. - Architect" 
                value={taskForm.assignedTo} 
                onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              />
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button 
                onClick={() => { setShowTaskModal(false); setEditingTaskId(null); }} 
                className="px-4 py-2 border rounded-lg dark:border-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTask} 
                className="px-4 py-2 bg-amber-600 text-white rounded-lg"
              >
                {editingTaskId !== null ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}




      {/* Dependency Modal - Full Dark Mode */}
      {showDependencyModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold dark:text-white">Add Dependency</h3>
              <button onClick={() => setShowDependencyModal(false)} className="dark:text-gray-400"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <select value={selectedDependency.fromTaskId || ''} onChange={(e) => setSelectedDependency({...selectedDependency, fromTaskId: parseInt(e.target.value)})} 
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="">Predecessor (must finish first)</option>
                {tasks.map(task => (<option key={task.id} value={task.id}>{task.name}</option>))}
              </select>
              <select value={selectedDependency.toTaskId || ''} onChange={(e) => setSelectedDependency({...selectedDependency, toTaskId: parseInt(e.target.value)})} 
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="">Successor (depends on predecessor)</option>
                {tasks.map(task => (<option key={task.id} value={task.id}>{task.name}</option>))}
              </select>
              <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-2">
                <p className="text-xs text-indigo-700 dark:text-indigo-300"><strong>Finish to Start (FS)</strong> - Successor cannot start until predecessor finishes.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowDependencyModal(false)} className="px-4 py-2 border rounded-lg dark:border-gray-600 dark:text-gray-300">Cancel</button>
              <button onClick={() => { 
                if (selectedDependency.fromTaskId && selectedDependency.toTaskId) { 
                  addDependency(selectedDependency.fromTaskId, selectedDependency.toTaskId); 
                  setShowDependencyModal(false); 
                  setSelectedDependency({ fromTaskId: null, toTaskId: null });
                } else { 
                  alert('Select both tasks'); 
                } 
              }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Add Dependency</button>
            </div>
            {dependencies.length > 0 && (
              <div className="mt-4 pt-3 border-t dark:border-gray-700">
                <h4 className="text-xs font-medium mb-2 dark:text-white">Existing Dependencies ({dependencies.length})</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {dependencies.map(dep => {
                    const from = tasks.find(t => t.id === dep.fromTaskId);
                    const to = tasks.find(t => t.id === dep.toTaskId);
                    return (
                      <div key={dep.id} className="flex justify-between items-center p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded text-xs">
                        <span className="truncate dark:text-gray-300">{from?.name} → {to?.name}</span>
                        <button onClick={() => removeDependency(dep.id)} className="text-red-500 hover:text-red-700"><Trash2 size={12} /></button>
                      </div>
                    );
                  })}
                </div>e
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}