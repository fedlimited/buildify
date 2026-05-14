import { useAppStore } from '@/hooks/useAppStore';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  // ========== STATE DECLARATIONS ==========
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

  const [printPaperSize, setPrintPaperSize] = useState<'A0' | 'A1' | 'A2' | 'A3' | 'A4'>('A2');
  const [printOrientation, setPrintOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [printScale, setPrintScale] = useState<'fit' | 'actual' | 'shrink'>('fit');

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
  
  // ========== REFS ==========
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timelineHeaderRef = useRef<HTMLDivElement>(null);
  const ganttBodyRef = useRef<HTMLDivElement>(null);
  
  // ========== FORM STATE ==========
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

  // ========== HELPER FUNCTIONS ==========
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setPrintLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  const closeExportMenu = () => setShowExportMenu(false);
  const closeImportMenu = () => setShowImportMenu(false);

  // ========== HISTORY MANAGEMENT ==========
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ tasks: JSON.parse(JSON.stringify(tasks)), dependencies: JSON.parse(JSON.stringify(dependencies)) });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, tasks, dependencies]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setTasks(prev.tasks);
      setDependencies(prev.dependencies);
      setHistoryIndex(historyIndex - 1);
      addLog('Undo performed');
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setTasks(next.tasks);
      setDependencies(next.dependencies);
      setHistoryIndex(historyIndex + 1);
      addLog('Redo performed');
    }
  }, [history, historyIndex]);

  // ========== AUTO-SAVE ==========
  const performAutoSave = useCallback(async () => {
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
        setTimeout(() => setAutoSaveStatus(prev => prev === 'saved' ? 'idle' : prev), 2000);
      } else {
        setAutoSaveStatus('error');
        setTimeout(() => setAutoSaveStatus(prev => prev === 'error' ? 'idle' : prev), 3000);
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus(prev => prev === 'error' ? 'idle' : prev), 3000);
    }
  }, [tasks, dependencies, projectId, isStakeholder]);

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled || isStakeholder) return;
    if (tasks.length === 0 && dependencies.length === 0) return;
    setUnsavedChanges(true);
    const timer = setTimeout(() => performAutoSave(), 2000);
    return () => clearTimeout(timer);
  }, [tasks, dependencies, autoSaveEnabled, isStakeholder, performAutoSave]);

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

  // ========== SAMPLE DATA ==========
  const loadSampleData = () => {
    addLog('Loading sample project data...');
    setTasks(JSON.parse(JSON.stringify(SAMPLE_TASKS)));
    setDependencies(JSON.parse(JSON.stringify(SAMPLE_DEPENDENCIES)));
    const parentIds = new Set(SAMPLE_TASKS.filter(t => t.parentId === null).map(t => t.id));
    setExpandedTasks(parentIds);
    saveToHistory();
    const totalCost = SAMPLE_TASKS.reduce((sum, t) => sum + (t.cost || 0), 0);
    alert(`✅ Sample project data loaded!\n\n📊 ${SAMPLE_TASKS.length} tasks\n🔗 ${SAMPLE_DEPENDENCIES.length} dependencies\n💰 Total budget: KES ${(totalCost / 1000000).toFixed(1)}M`);
  };

  // ========== CLEAR ALL ==========
  const clearAllTasks = () => {
    if (confirm('⚠️ WARNING: This will delete ALL tasks and dependencies. This action cannot be undone. Are you sure?')) {
      setTasks([]);
      setDependencies([]);
      setExpandedTasks(new Set());
      setSelectedTask(null);
      saveToHistory();
      alert('✅ Gantt chart cleared.');
    }
  };

  // ========== TOGGLE FULLSCREEN ==========
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (fullscreenRef.current?.requestFullscreen) {
        fullscreenRef.current.requestFullscreen();
        addLog('Fullscreen enabled');
        setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        addLog('Fullscreen exited');
        setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
      }
    }
  };

  // ========== FORCE RESIZE SYNC ==========
  const forceResizeSync = useCallback(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  console.log('🔍 [Gantt] currencySettings:', currencySettings);
  console.log('🔍 [Gantt] currencySymbol:', currencySymbol);




  // ========== DATE RANGE CALCULATION (IMPROVED SYNC) ==========
  const getProjectDateRange = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (tasks.length === 0) {
      const end = new Date(today);
      end.setMonth(end.getMonth() + 1);
      return { minDate: today, maxDate: end };
    }
    
    // Validate dates before using them
    const validDates: Date[] = [];
    
    tasks.forEach(t => {
      try {
        const start = new Date(t.startDate);
        const end = new Date(t.endDate);
        
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          validDates.push(start, end);
        } else {
          console.warn('Invalid date found:', t.name, t.startDate, t.endDate);
        }
      } catch (error) {
        console.error('Error parsing date for task:', t.name, error);
      }
    });
    
    if (validDates.length === 0) {
      console.warn('No valid dates found, using default range');
      const end = new Date(today);
      end.setMonth(end.getMonth() + 1);
      return { minDate: today, maxDate: end };
    }
    
    let minDate: Date;
    let maxDate: Date;
    
    try {
      const timestamps = validDates.map(d => d.getTime());
      const minTimestamp = Math.min(...timestamps);
      const maxTimestamp = Math.max(...timestamps);
      minDate = new Date(minTimestamp);
      maxDate = new Date(maxTimestamp);
    } catch (error) {
      console.error('Error calculating date range:', error);
      const end = new Date(today);
      end.setMonth(end.getMonth() + 1);
      return { minDate: today, maxDate: end };
    }
    
    // Calculate project duration in days
    const projectDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Smart padding based on project length
    let paddingDays;
    if (projectDays <= 7) {
      paddingDays = 3;
    } else if (projectDays <= 30) {
      paddingDays = Math.ceil(projectDays * 0.15);
    } else if (projectDays <= 90) {
      paddingDays = Math.ceil(projectDays * 0.1);
    } else if (projectDays <= 365) {
      paddingDays = Math.min(Math.ceil(projectDays * 0.05), 30);
    } else {
      // For very long projects (> 1 year), use percentage-based padding with cap
      paddingDays = Math.min(Math.ceil(projectDays * 0.03), 60);
    }
    
    minDate = new Date(minDate.getTime() - paddingDays * 24 * 60 * 60 * 1000);
    maxDate = new Date(maxDate.getTime() + paddingDays * 24 * 60 * 60 * 1000);
    
    return { minDate, maxDate };
  }, [tasks]);

  // ========== TIMELINE UNIT DETECTION (DYNAMIC BASED ON ZOOM & DURATION) ==========
  const getTimelineUnit = useCallback((minDate: Date, maxDate: Date, zoom: number) => {
    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const effectiveDays = totalDays / zoom;
    
    if (effectiveDays <= 14) {
      return { unit: 'day', label: 'Day', daysPerUnit: 1, width: 45 };
    } else if (effectiveDays <= 60) {
      return { unit: 'week', label: 'Week', daysPerUnit: 7, width: 55 };
    } else if (effectiveDays <= 180) {
      return { unit: 'month', label: 'Month', daysPerUnit: 30, width: 70 };
    } else if (effectiveDays <= 730) {
      return { unit: 'quarter', label: 'Quarter', daysPerUnit: 90, width: 80 };
    } else {
      return { unit: 'year', label: 'Year', daysPerUnit: 365, width: 90 };
    }
  }, []);

  // ========== SAFE DATE RANGE WITH FALLBACK ==========
  const { minDate, maxDate } = getProjectDateRange();
  
  let safeMinDate = minDate;
  let safeMaxDate = maxDate;
  
  if (!safeMinDate || !safeMaxDate || isNaN(safeMinDate.getTime()) || isNaN(safeMaxDate.getTime())) {
    console.error('Invalid date range detected, using fallback');
    const today = new Date();
    safeMinDate = new Date(today);
    safeMaxDate = new Date(today);
    safeMaxDate.setMonth(safeMaxDate.getMonth() + 1);
  }
  
  const timelineUnit = getTimelineUnit(safeMinDate, safeMaxDate, zoomLevel);
  
  // ========== GENERATE TIMELINE HEADERS WITH PRECISE ALIGNMENT ==========
  const generateTimelineHeaders = useCallback(() => {
    const headers: { date: Date; label: string; width: number; startOffset: number; endOffset: number }[] = [];
    
    const totalDuration = safeMaxDate.getTime() - safeMinDate.getTime();
    if (totalDuration <= 0) return headers;
    
    if (timelineUnit.unit === 'year') {
      const startYear = safeMinDate.getFullYear();
      const endYear = safeMaxDate.getFullYear();
      
      for (let year = startYear; year <= endYear; year++) {
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31);
        const headerStart = Math.max(yearStart.getTime(), safeMinDate.getTime());
        const headerEnd = Math.min(yearEnd.getTime(), safeMaxDate.getTime());
        const duration = headerEnd - headerStart;
        const widthPercent = (duration / totalDuration) * 100;
        
        headers.push({
          date: new Date(year, 0, 1),
          label: `${year}`,
          width: widthPercent,
          startOffset: headerStart - safeMinDate.getTime(),
          endOffset: headerEnd - safeMinDate.getTime()
        });
      }
    } 
    else if (timelineUnit.unit === 'quarter') {
      const startDate = new Date(safeMinDate);
      startDate.setDate(1);
      const startQuarter = Math.floor(startDate.getMonth() / 3);
      startDate.setMonth(startQuarter * 3);
      startDate.setDate(1);
      
      let current = new Date(startDate);
      
      while (current <= safeMaxDate) {
        const nextQuarter = new Date(current);
        nextQuarter.setMonth(nextQuarter.getMonth() + 3);
        
        const headerStart = Math.max(current.getTime(), safeMinDate.getTime());
        const headerEnd = Math.min(nextQuarter.getTime(), safeMaxDate.getTime());
        const duration = headerEnd - headerStart;
        const widthPercent = (duration / totalDuration) * 100;
        
        const quarterNum = Math.floor(current.getMonth() / 3) + 1;
        headers.push({
          date: new Date(current),
          label: `Q${quarterNum}`,
          width: widthPercent,
          startOffset: headerStart - safeMinDate.getTime(),
          endOffset: headerEnd - safeMinDate.getTime()
        });
        current = nextQuarter;
      }
    }
    else if (timelineUnit.unit === 'month') {
      const startMonth = new Date(safeMinDate);
      startMonth.setDate(1);
      let current = new Date(startMonth);
      
      while (current <= safeMaxDate) {
        const nextMonth = new Date(current);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        const headerStart = Math.max(current.getTime(), safeMinDate.getTime());
        const headerEnd = Math.min(nextMonth.getTime(), safeMaxDate.getTime());
        const duration = headerEnd - headerStart;
        const widthPercent = (duration / totalDuration) * 100;
        
        headers.push({
          date: new Date(current),
          label: current.toLocaleDateString('en-US', { month: 'short' }),
          width: widthPercent,
          startOffset: headerStart - safeMinDate.getTime(),
          endOffset: headerEnd - safeMinDate.getTime()
        });
        current = nextMonth;
      }
    }
    else if (timelineUnit.unit === 'week') {
      const startWeek = new Date(safeMinDate);
      const dayOfWeek = startWeek.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startWeek.setDate(startWeek.getDate() - daysToMonday);
      
      let current = new Date(startWeek);
      
      while (current <= safeMaxDate) {
        const nextWeek = new Date(current);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const headerStart = Math.max(current.getTime(), safeMinDate.getTime());
        const headerEnd = Math.min(nextWeek.getTime(), safeMaxDate.getTime());
        const duration = headerEnd - headerStart;
        const widthPercent = (duration / totalDuration) * 100;
        
        const weekNumber = Math.ceil((current.getTime() - new Date(current.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
        
        headers.push({
          date: new Date(current),
          label: `W${weekNumber}`,
          width: widthPercent,
          startOffset: headerStart - safeMinDate.getTime(),
          endOffset: headerEnd - safeMinDate.getTime()
        });
        current = nextWeek;
      }
    }
    else {
      // Day unit
      let current = new Date(safeMinDate);
      current.setHours(0, 0, 0, 0);
      
      while (current <= safeMaxDate) {
        const nextDay = new Date(current);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const headerStart = Math.max(current.getTime(), safeMinDate.getTime());
        const headerEnd = Math.min(nextDay.getTime(), safeMaxDate.getTime());
        const duration = headerEnd - headerStart;
        const widthPercent = (duration / totalDuration) * 100;
        
        headers.push({
          date: new Date(current),
          label: current.getDate().toString(),
          width: widthPercent,
          startOffset: headerStart - safeMinDate.getTime(),
          endOffset: headerEnd - safeMinDate.getTime()
        });
        current = nextDay;
      }
    }
    
    return headers;
  }, [safeMinDate, safeMaxDate, timelineUnit]);

  const timelineHeaders = generateTimelineHeaders();

  // ========== PRECISE BAR POSITION CALCULATION ==========
  const calculateBarPosition = useCallback((startDateStr: string, endDateStr: string) => {
    if (!startDateStr || !endDateStr) {
      return { left: '0%', width: '0%' };
    }
    
    let cleanStart = startDateStr;
    let cleanEnd = endDateStr;
    
    if (cleanStart.includes('T')) cleanStart = cleanStart.split('T')[0];
    if (cleanEnd.includes('T')) cleanEnd = cleanEnd.split('T')[0];
    
    const start = new Date(cleanStart);
    const end = new Date(cleanEnd);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { left: '0%', width: '0%' };
    }
    
    const totalMs = safeMaxDate.getTime() - safeMinDate.getTime();
    
    if (totalMs <= 0) {
      return { left: '0%', width: '10%' };
    }
    
    let startOffset = start.getTime() - safeMinDate.getTime();
    let duration = end.getTime() - start.getTime();
    
    // Clamp values to visible range
    startOffset = Math.max(0, Math.min(totalMs, startOffset));
    duration = Math.max(0, Math.min(totalMs - startOffset, duration));
    
    // Ensure minimum visibility for very short tasks (1 pixel minimum)
    const minWidthPercent = (1 / (ganttContainerRef.current?.clientWidth || 800)) * 100;
    let left = (startOffset / totalMs) * 100;
    let width = (duration / totalMs) * 100;
    
    if (width < minWidthPercent && duration > 0) {
      width = minWidthPercent;
    }
    
    left = Math.max(0, Math.min(100, left));
    width = Math.max(0, Math.min(100, width));
    if (left + width > 100) width = 100 - left;
    
    return { left: `${left}%`, width: `${width}%` };
  }, [safeMinDate, safeMaxDate]);

  // ========== PROFESSIONAL PRINT HANDLER ==========
  const handlePrint = async () => {
    addLog(`=== PRINT STARTED: ${printPaperSize} ${printOrientation} ===`);
    
    if (!printRef.current || !ganttContainerRef.current) {
      addLog('❌ Print reference not found');
      alert('Print error: Could not find chart to print');
      return;
    }

    try {
      const loadingToast = document.createElement('div');
      loadingToast.innerHTML = 'Generating PDF... Please wait';
      loadingToast.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#333; color:white; padding:10px 20px; border-radius:8px; z-index:9999;';
      document.body.appendChild(loadingToast);

      const originalBodyClass = document.body.className;
      document.body.classList.add('print-mode');
      
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
      
      const ganttContent = ganttContainerRef.current.cloneNode(true) as HTMLElement;
      ganttContent.style.backgroundColor = 'white';
      ganttContent.style.color = 'black';
      
      const allElements = ganttContent.querySelectorAll('*');
      allElements.forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        htmlEl.classList.remove('dark', 'dark:bg-gray-800', 'dark:bg-gray-700', 'dark:text-white', 'dark:border-gray-700');
        htmlEl.style.backgroundColor = 'white';
        htmlEl.style.color = 'black';
        htmlEl.style.borderColor = '#e5e7eb';
      });
      
      const taskBars = ganttContent.querySelectorAll('[class*="bg-gradient"]');
      taskBars.forEach((bar: Element) => {
        const htmlBar = bar as HTMLElement;
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
      
      const canvas = await html2canvas(printContainer, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: printContainer.scrollWidth,
        windowHeight: printContainer.scrollHeight,
        useCORS: true,
        allowTaint: false
      });
      
      document.body.removeChild(printContainer);
      document.body.removeChild(loadingToast);
      document.body.className = originalBodyClass;
      
      addLog(`Canvas size: ${canvas.width}x${canvas.height}px`);
      
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
      
      let imgWidth = pdfWidth - 20;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      
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
      
      const pdf = new jsPDF({ 
        orientation: printOrientation, 
        unit: 'mm', 
        format: printPaperSize.toLowerCase() as any,
        compress: true,
        hotfixes: ['px_scaling']
      });
      
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
      pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${new Date().toLocaleString()} | Paper: ${printPaperSize} ${printOrientation} | Page 1 of 1`, 10, pdfHeight - 5);
      
      const fileName = `Gantt_${projectName || 'Project'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      addLog('✅ PDF generated successfully with white background');
      alert(`✅ Professional print PDF saved!\n\n📄 Paper: ${printPaperSize} ${printOrientation}\n📐 Scale: ${printScale}\nFile: ${fileName}`);
      
    } catch (error) {
      addLog(`❌ Print error: ${error}`);
      console.error('Print error:', error);
      alert('Error generating PDF. Please check console for details.');
    }
  };




  // ========== XML ESCAPE FUNCTIONS ==========
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

  // ========== GENERATE MS PROJECT XML ==========
  const generateMSProjectXML = (tasks: Task[], dependencies: Dependency[], projectName: string): string => {
    const projectStart = tasks.length > 0 
      ? tasks.reduce((min, t) => t.startDate < min ? t.startDate : min, tasks[0]?.startDate || new Date().toISOString().split('T')[0]) 
      : new Date().toISOString().split('T')[0];
    
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
      <WeekDay>
        <DayType>Tuesday</DayType>
        <DayWorking>1</DayWorking>
      </WeekDay>
      <WeekDay>
        <DayType>Wednesday</DayType>
        <DayWorking>1</DayWorking>
      </WeekDay>
      <WeekDay>
        <DayType>Thursday</DayType>
        <DayWorking>1</DayWorking>
      </WeekDay>
      <WeekDay>
        <DayType>Friday</DayType>
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
      <Duration>${Math.max(1, task.duration) * 480}</Duration>
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

  // ========== EXPORT TO MS PROJECT ==========
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

  // ========== IMPORT MS PROJECT FILE ==========
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
          
          let duration = Math.max(1, Math.ceil((new Date(finishDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
          if (isMilestone) duration = 0;
          
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
          
          if (fromTaskId && toTaskId && importedTasks.some(t => t.id === fromTaskId) && importedTasks.some(t => t.id === toTaskId)) {
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

  // ========== EXPORT TO CSV ==========
  const exportToCSV = () => {
    let csv = '"Task Name","WBS","Start","End","Duration","Progress","Priority","Assigned To","Cost"\n';
    tasks.forEach(task => {
      csv += `"${task.name.replace(/"/g, '""')}","${task.wbs || ''}","${task.startDate}","${task.endDate}",${task.duration},${task.progress}%,${task.priority},"${task.assignedTo || ''}",${task.cost || 0}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gantt-${projectName || projectId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addLog(`Exported to CSV: ${tasks.length} tasks`);
    alert(`✅ Exported to CSV!\n\n📊 ${tasks.length} tasks exported.`);
  };

  // ========== EXPORT TO HIGH-RES IMAGE ==========
  const exportToHighResImage = async () => {
    if (!ganttContainerRef.current) return;
    try {
      addLog('Capturing high-res image...');
      
      // Temporarily remove zoom transform for clean capture
      const originalTransform = ganttContainerRef.current.style.transform;
      ganttContainerRef.current.style.transform = 'none';
      
      const canvas = await html2canvas(ganttContainerRef.current, { 
        scale: 4, 
        backgroundColor: '#ffffff', 
        logging: false,
        windowWidth: ganttContainerRef.current.scrollWidth,
        windowHeight: ganttContainerRef.current.scrollHeight
      });
      
      // Restore zoom
      ganttContainerRef.current.style.transform = originalTransform;
      
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

  // ========== COLUMN CONFIGURATION ==========
  const toggleColumnVisibility = (colId: string) => {
    setColumns(prev => prev.map(col => col.id === colId ? { ...col, visible: !col.visible } : col));
  };

  const resetColumnLayout = () => {
    setColumns(DEFAULT_COLUMNS);
    localStorage.removeItem(`gantt_columns_${projectId}`);
  };

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

  // Save column configuration to localStorage
  useEffect(() => {
    localStorage.setItem(`gantt_columns_${projectId}`, JSON.stringify(columns));
  }, [columns, projectId]);

  // Mouse handlers for resize/drag
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



  // ========== PROFESSIONAL MULTI-TAB EXCEL EXPORT ==========
  const exportToExcel = () => {
    addLog('Exporting to Professional Multi-Tab Excel format...');
    
    // Calculate project date range
    let projectStart: Date, projectEnd: Date;
    if (tasks.length > 0) {
      const startDates = tasks.map(t => new Date(t.startDate)).filter(d => !isNaN(d.getTime()));
      const endDates = tasks.map(t => new Date(t.endDate)).filter(d => !isNaN(d.getTime()));
      if (startDates.length > 0 && endDates.length > 0) {
        projectStart = new Date(Math.min(...startDates.map(d => d.getTime())));
        projectEnd = new Date(Math.max(...endDates.map(d => d.getTime())));
      } else {
        projectStart = new Date();
        projectEnd = new Date();
        projectEnd.setMonth(projectEnd.getMonth() + 6);
      }
    } else {
      projectStart = new Date();
      projectEnd = new Date();
      projectEnd.setMonth(projectEnd.getMonth() + 6);
    }
    
    const totalDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    const barWidth = Math.max(60, Math.min(120, Math.floor(totalDays / 2))); // Dynamic bar width based on project length
    const totalWeeks = Math.ceil(totalDays / 7);
    
    // Generate timeline markers with proper alignment
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
        for (let j = weekLabel.length; j < 4; j++) weekMarkerLine += ' ';
      } else {
        weekMarkerLine += '    ';
      }
      
      if (isMonthStart) {
        const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'short' });
        monthMarkerLine += monthLabel;
        for (let j = monthLabel.length; j < 4; j++) monthMarkerLine += ' ';
      } else {
        monthMarkerLine += '    ';
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
    htmlContent += '  if (event && event.target) event.target.classList.add("active");\n';
    htmlContent += '}\n';
    htmlContent += '</script>\n';
    htmlContent += '</head>\n';
    htmlContent += '<body>\n';
    
    // Sheet Tabs
    htmlContent += '<div class="sheet-tabs">\n';
    htmlContent += '<div class="sheet-tab active" onclick="showSheet(\'sheet1\')">📊 GANTT CHART</div>\n';
    htmlContent += '<div class="sheet-tab" onclick="showSheet(\'sheet2\')">📖 LEGEND &amp; SUMMARY</div>\n';
    htmlContent += '</div>\n';
    
    // ========== SHEET 1: GANTT CHART ==========
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
    
    // Week marker row
    htmlContent += '<tr style="background-color: #34495e;">\n';
    htmlContent += '<td colspan="10" style="background-color: #2c3e50; border: none;">&nbsp;</td>\n';
    htmlContent += '<td style="background-color: #2c3e50; padding: 5px 6px;">\n';
    htmlContent += '<div style="font-family: \'Courier New\', monospace; font-size: 9px; color: #ecf0f1; white-space: pre;">WEEK → ' + weekMarkerLine + '</div>\n';
    htmlContent += '</td>\n';
    htmlContent += '</tr>\n';
    
    // Month marker row
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



    // ========== SHEET 2: LEGEND & SUMMARY ==========
    htmlContent += '<div id="sheet2" class="sheet-content">\n';
    htmlContent += '<div style="padding: 20px;">\n';
    htmlContent += '<h2>📖 GANTT CHART LEGEND &amp; PROJECT SUMMARY</h2>\n';
    htmlContent += '<p style="color: #7f8c8d;">' + escapeHtml(projectName || 'Project') + ' | Generated: ' + new Date().toLocaleString() + '</p>\n';
    
    // Legend Section - Gantt Bar Symbols
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
    
    // Project Summary Statistics
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
    htmlContent += '<tr><td><strong>💰 Total Budget:</strong></td><td><strong>' + currencySymbol + ' ' + totalCostSum.toLocaleString() + '</strong></td></tr>\n';
    htmlContent += '<tr><td><strong>📅 Project Start:</strong></td><td>' + projectStart.toLocaleDateString() + '</td></tr>\n';
    htmlContent += '<tr><td><strong>📅 Project End:</strong></td><td>' + projectEnd.toLocaleDateString() + '</td></tr>\n';
    htmlContent += '<tr><td><strong>⏱️ Project Duration:</strong></td><td><strong>' + totalDays + ' days (' + totalWeeks + ' weeks)</strong></td></tr>\n';
    htmlContent += '</table>\n';
    htmlContent += '</div>\n';
    
    // Priority Distribution Chart
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

  // ========== DATA LOADING FROM BACKEND ==========
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

  // ========== EFFECTS FOR DATA LOADING AND SYNC ==========
  useEffect(() => {
    loadFromBackend();
    fetchProjectName();
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

  // Force recalculation when container becomes visible
  useEffect(() => {
    const checkAndRecalculate = () => {
      if (ganttContainerRef.current && ganttContainerRef.current.clientWidth > 0) {
        console.log('Container is now visible, width:', ganttContainerRef.current.clientWidth);
        window.dispatchEvent(new Event('resize'));
        return true;
      }
      return false;
    };
    
    if (!checkAndRecalculate()) {
      const intervals = [100, 200, 500, 1000];
      intervals.forEach(delay => {
        setTimeout(() => checkAndRecalculate(), delay);
      });
    }
  }, [tasks]);

  // Recalculate bar positions when zoom level changes
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
    return () => clearTimeout(timer);
  }, [zoomLevel]);




  // ========== RESIZE OBSERVER FOR CONTAINER SIZE CHANGES ==========
  useEffect(() => {
    if (!ganttContainerRef.current) return;
    
    const observer = new ResizeObserver(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    observer.observe(ganttContainerRef.current);
    
    return () => observer.disconnect();
  }, []);

  // ========== MUTATION OBSERVER FOR DOM CHANGES ==========
  useEffect(() => {
    if (!ganttContainerRef.current) return;
    
    const observer = new MutationObserver(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    observer.observe(ganttContainerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    return () => observer.disconnect();
  }, []);

  // ========== CLICK OUTSIDE HANDLER FOR MENUS ==========
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

  // ========== FULLSCREEN CHANGE LISTENER ==========
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
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

  // ========== KEYBOARD SHORTCUTS ==========
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z: Undo
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      // Ctrl+Y: Redo
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      // Ctrl+N: New Task
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        addNewTask();
      }
      // Ctrl+S: Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
      // Ctrl+D: Add Dependency
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setShowDependencyModal(true);
      }
      // Ctrl+P: Print
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        setShowPrintDialog(true);
      }
      // Delete: Delete selected task
      if (e.key === 'Delete' && selectedTask) {
        e.preventDefault();
        deleteSingleTask(selectedTask);
      }
      // Escape: Close modals
      if (e.key === 'Escape') {
        if (showTaskModal) setShowTaskModal(false);
        if (showDependencyModal) setShowDependencyModal(false);
        if (showColumnConfig) setShowColumnConfig(false);
        if (showPrintDialog) setShowPrintDialog(false);
        if (showExportMenu) setShowExportMenu(false);
        if (showImportMenu) setShowImportMenu(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTask, showTaskModal, showDependencyModal, showColumnConfig, showPrintDialog, showExportMenu, showImportMenu, undo, redo]);

  // ========== TASK CRUD OPERATIONS ==========
  
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

  // Add new task
  const addNewTask = () => {
    setEditingTaskId(null);
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

  // Save task (create or update)
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
        wbs: taskForm.parentId 
          ? `${tasks.find(t => t.id === taskForm.parentId)?.wbs || ''}.${Math.floor(Math.random() * 10)}` 
          : `${Math.floor(Math.random() * 10)}.0`
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

  // Delete single task and its sub-tasks
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

  // ========== DEPENDENCY MANAGEMENT ==========
  
  // Add dependency between tasks
  const addDependency = (fromTaskId: number, toTaskId: number, type: Dependency['type'] = 'finish-to-start') => {
    if (isStakeholder) return;
    // Check if dependency already exists
    const exists = dependencies.some(d => d.fromTaskId === fromTaskId && d.toTaskId === toTaskId);
    if (exists) {
      alert('⚠️ This dependency already exists!');
      return;
    }
    // Check for circular dependency
    const wouldCreateCycle = (current: number, target: number, visited: Set<number> = new Set()): boolean => {
      if (current === target) return true;
      if (visited.has(current)) return false;
      visited.add(current);
      const children = dependencies.filter(d => d.fromTaskId === current).map(d => d.toTaskId);
      return children.some(child => wouldCreateCycle(child, target, visited));
    };
    
    if (wouldCreateCycle(fromTaskId, toTaskId)) {
      alert('⚠️ Cannot add dependency - this would create a circular reference!');
      return;
    }
    
    const newId = dependencies.length > 0 ? Math.max(...dependencies.map(d => d.id)) + 1 : 1;
    setDependencies([...dependencies, { id: newId, fromTaskId, toTaskId, type }]);
    saveToHistory();
    addLog(`Added dependency: ${tasks.find(t => t.id === fromTaskId)?.name} → ${tasks.find(t => t.id === toTaskId)?.name}`);
  };

  // Remove dependency
  const removeDependency = (dependencyId: number) => {
    if (isStakeholder) return;
    setDependencies(dependencies.filter(d => d.id !== dependencyId));
    saveToHistory();
    addLog(`Removed dependency ID: ${dependencyId}`);
  };

  // Update task progress
  const updateTaskProgress = (taskId: number, newProgress: number) => {
    if (isStakeholder) return;
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, progress: newProgress } : task));
  };

  // Toggle expand/collapse for parent tasks
  const toggleExpand = (taskId: number) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  // ========== UI HELPER FUNCTIONS ==========
  
  // Get task bar color based on priority and progress
  const getTaskBarColor = (task: Task) => {
    if (task.isMilestone) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (task.progress === 100) return 'bg-gradient-to-r from-emerald-500 to-green-600';
    if (task.priority === 'urgent') return 'bg-gradient-to-r from-red-500 to-red-700';
    if (task.priority === 'high') return 'bg-gradient-to-r from-orange-500 to-orange-700';
    if (task.priority === 'medium') return 'bg-gradient-to-r from-amber-500 to-amber-700';
    return 'bg-gradient-to-r from-blue-500 to-blue-700';
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      default: return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
    }
  };




  // ========== FORMATTING FUNCTIONS ==========
  
  // Format date for display (MMM DD)
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

  // Format budget in millions or billions
  const formatBudgetInMillions = (amount: number): string => {
    if (isNaN(amount) || amount === 0) return `${currencySymbol} 0`;
    
    const millions = amount / 1000000;
    
    if (millions >= 1000) {
      const billions = millions / 1000;
      return `${currencySymbol} ${billions.toLocaleString(undefined, { maximumFractionDigits: 1 })}B`;
    }
    
    return `${currencySymbol} ${millions.toLocaleString(undefined, { maximumFractionDigits: 1 })}M`;
  };

  // Get days remaining until end date
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

  // Check if task is overdue
  const isTaskOverdue = (task: Task) => {
    try {
      const endDate = new Date(task.endDate);
      return endDate < new Date() && task.progress < 100;
    } catch {
      return false;
    }
  };

  // Calculate project progress percentage
  const getProjectProgress = useCallback(() => {
    if (tasks.length === 0) return 0;
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / tasks.length);
  }, [tasks]);

  // ========== VISIBLE TASKS FILTERING ==========
  
  const getVisibleTasks = useCallback((): Task[] => {
    let filtered = [...tasks];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => t.name.toLowerCase().includes(term));
    }
    
    // Apply quick filters
    if (quickFilter === 'overdue') {
      filtered = filtered.filter(t => isTaskOverdue(t));
    }
    if (quickFilter === 'this-week') {
      const today = new Date();
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + 7);
      filtered = filtered.filter(t => {
        const endDate = new Date(t.endDate);
        return endDate >= today && endDate <= endOfWeek && t.progress < 100;
      });
    }
    if (quickFilter === 'next-week') {
      const today = new Date();
      const nextWeekStart = new Date(today);
      nextWeekStart.setDate(today.getDate() + 7);
      const nextWeekEnd = new Date(today);
      nextWeekEnd.setDate(today.getDate() + 14);
      filtered = filtered.filter(t => {
        const endDate = new Date(t.endDate);
        return endDate >= nextWeekStart && endDate <= nextWeekEnd && t.progress < 100;
      });
    }
    if (quickFilter === 'milestones') {
      filtered = filtered.filter(t => t.isMilestone);
    }
    if (quickFilter === 'high-priority') {
      filtered = filtered.filter(t => t.priority === 'high' || t.priority === 'urgent');
    }
    
    // Build tree structure with expanded/collapsed logic
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
  }, [tasks, searchTerm, quickFilter, expandedTasks]);

  const visibleTasks = getVisibleTasks();
  
  // ========== COLUMN CONFIGURATION ==========
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
  const visibleColumns = sortedColumns.filter(c => c.visible);
  
  // ========== STATISTICS ==========
  const totalCost = tasks.reduce((sum, t) => sum + (t.cost || 0), 0);
  const completedTasks = tasks.filter(t => t.progress === 100).length;
  const overdueTasks = tasks.filter(t => isTaskOverdue(t)).length;
  const projectProgress = getProjectProgress();

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <Loader2 size={48} className="animate-spin text-amber-500" />
        <p className="mt-3 text-gray-500 dark:text-gray-400">Loading Professional Gantt Chart...</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Please wait while we load your project data</p>
      </div>
    );
  }

  // ========== FORCE RESIZE ON MOUNT AND UPDATES ==========
  useEffect(() => {
    const timer = setTimeout(() => {
      forceResizeSync();
    }, 100);
    return () => clearTimeout(timer);
  }, [forceResizeSync, visibleTasks.length, zoomLevel]);

  // ========== SYNC TIMELINE WITH BARS ON SCROLL ==========
  useEffect(() => {
    const ganttContainer = ganttContainerRef.current;
    if (!ganttContainer) return;
    
    const handleScroll = () => {
      // Sync any horizontal scrolling between header and body if needed
      const timelineHeader = ganttContainer.querySelector('.timeline-header') as HTMLElement;
      const ganttBody = ganttContainer.querySelector('.gantt-body') as HTMLElement;
      if (timelineHeader && ganttBody) {
        timelineHeader.scrollLeft = ganttBody.scrollLeft;
      }
    };
    
    ganttContainer.addEventListener('scroll', handleScroll);
    return () => ganttContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // ========== MEMOIZED VALUES FOR PERFORMANCE ==========
  const taskBarPositions = useMemo(() => {
    const positions: Record<number, { left: string; width: string }> = {};
    tasks.forEach(task => {
      positions[task.id] = calculateBarPosition(task.startDate, task.endDate);
    });
    return positions;
  }, [tasks, calculateBarPosition]);

  // Get safe timeline headers with fallback
  const safeTimelineHeaders = useMemo(() => {
    if (timelineHeaders && timelineHeaders.length > 0) {
      return timelineHeaders;
    }
    // Fallback headers
    return [{ date: new Date(), label: 'Today', width: 100, startOffset: 0, endOffset: 86400000 }];
  }, [timelineHeaders]);

  // ========== SORTED AND VISIBLE COLUMNS FOR RENDERING ==========
  const renderableColumns = useMemo(() => {
    return visibleColumns.map(col => ({
      ...col,
      render: (task: Task) => {
        switch (col.id) {
          case 'name':
            return task.name;
          case 'start':
            return formatDate(task.startDate);
          case 'end':
            return formatDate(task.endDate);
          case 'duration':
            return `${task.duration}d`;
          case 'progress':
            return `${task.progress}%`;
          case 'priority':
            return task.priority;
          case 'cost':
            return formatCurrency(task.cost || 0);
          case 'assignedTo':
            return task.assignedTo || '—';
          case 'wbs':
            return task.wbs || '—';
          default:
            return (task as any)[col.id] || '—';
        }
      }
    }));
  }, [visibleColumns, formatDate, formatCurrency]);





  // ========== MAIN JSX RENDER ==========
  return (
    <div 
      ref={fullscreenRef} 
      className="space-y-3" 
      style={{ 
        height: isFullscreen ? '100vh' : 'auto', 
        overflow: isFullscreen ? 'hidden' : 'visible',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* ========== PROFESSIONAL TOOLBAR ========== */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md sticky top-0 z-30 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between p-2 gap-1 border-b border-gray-200 dark:border-gray-700">
          
          {/* Left Section - Task Management */}
          <div className="flex items-center gap-1 flex-wrap">
            {/* Add Task Button */}
            <button 
              onClick={addNewTask} 
              className="px-2 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm flex items-center gap-1 transition"
              title="Add New Task (Ctrl+N)"
            >
              <Plus size={14} /> Task
            </button>
            
            {/* Add Dependency Button */}
            <button 
              onClick={() => setShowDependencyModal(true)} 
              className="px-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm flex items-center gap-1 transition"
              title="Add Dependency (Ctrl+D)"
            >
              <Link size={14} /> Link
            </button>
            
            {/* Save Button with Auto-save Status */}
            <div className="relative">
              <button 
                onClick={handleManualSave} 
                disabled={saving || autoSaveStatus === 'saving'}
                className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm flex items-center gap-1 transition disabled:opacity-50"
                title="Save Gantt Chart (Ctrl+S)"
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
              
              {/* Unsaved Changes Indicator */}
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
            
            {/* Clear All Button */}
            <button 
              onClick={clearAllTasks} 
              className="px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center gap-1 transition"
              title="Clear All Tasks"
            >
              <Eraser size={14} /> Clear
            </button>
            
            {/* Sample Data Button */}
            <button 
              onClick={loadSampleData} 
              className="px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1 transition"
              title="Load Sample Project"
            >
              <Sparkles size={14} /> Sample
            </button>
            
            {/* Divider */}
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>
            
            {/* Export Dropdown */}
            <div className="relative export-menu-container">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)} 
                className="px-2 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm flex items-center gap-1 transition"
              >
                <Download size={14} /> Export ▼
              </button>
              {showExportMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded border border-gray-200 dark:border-gray-700 min-w-[180px] z-20">
                  <button 
                    onClick={() => { exportToMSProject(); closeExportMenu(); }} 
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    📊 MS Project XML
                  </button>
                  <button 
                    onClick={() => { exportToExcel(); closeExportMenu(); }} 
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    📑 Excel (Multi-Tab)
                  </button>
                  <button 
                    onClick={() => { handlePrint(); closeExportMenu(); }} 
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    📄 PDF (Professional)
                  </button>
                  <button 
                    onClick={() => { exportToHighResImage(); closeExportMenu(); }} 
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    🖼️ High-Res PNG
                  </button>
                  <button 
                    onClick={() => { exportToCSV(); closeExportMenu(); }} 
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    📊 CSV (Simple)
                  </button>
                </div>
              )}
            </div>
            
            {/* Import Dropdown */}
            <div className="relative import-menu-container">
              <button 
                onClick={() => setShowImportMenu(!showImportMenu)} 
                className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm flex items-center gap-1 transition"
              >
                <Upload size={14} /> Import ▼
              </button>
              {showImportMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded border border-gray-200 dark:border-gray-700 min-w-[160px] z-20">
                  <button 
                    onClick={() => { fileInputRef.current?.click(); closeImportMenu(); }} 
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    📁 MS Project XML
                  </button>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept=".xml" 
                    onChange={importMSProject} 
                    className="hidden" 
                  />
                </div>
              )}
            </div>
            
            {/* Print Dialog Button */}
            <button 
              onClick={() => setShowPrintDialog(true)} 
              className="px-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm flex items-center gap-1 transition"
              title="Print Gantt Chart (Ctrl+P)"
            >
              <Printer size={14} /> Print
            </button>
            
            {/* Column Config Button */}
            <button 
              onClick={() => setShowColumnConfig(true)} 
              className="px-2 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm flex items-center gap-1 transition"
              title="Customize Columns"
            >
              <Eye size={14} /> Columns
            </button>
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700 rounded p-0.5">
              <button 
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))} 
                className="p-1.5 rounded hover:bg-white/50"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-xs w-12 text-center dark:text-white">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button 
                onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))} 
                className="p-1.5 rounded hover:bg-white/50"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button 
                onClick={toggleFullscreen} 
                className="p-1.5 rounded hover:bg-white/50"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
            
            {/* Undo/Redo Buttons */}
            <div className="flex gap-0.5">
              <button 
                onClick={undo} 
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" 
                title="Undo (Ctrl+Z)"
                disabled={historyIndex <= 0}
              >
                <Undo size={14} />
              </button>
              <button 
                onClick={redo} 
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" 
                title="Redo (Ctrl+Y)"
                disabled={historyIndex >= history.length - 1}
              >
                <Redo size={14} />
              </button>
            </div>
          </div>
          
          {/* Right Section - Search and Filters */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-7 pr-2 py-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-36 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            
            {/* Quick Filter Buttons */}
            <div className="flex gap-0.5 text-xs">
              <button 
                onClick={() => setQuickFilter('all')} 
                className={`px-2 py-1 rounded transition ${quickFilter === 'all' ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                All
              </button>
              <button 
                onClick={() => setQuickFilter('overdue')} 
                className={`px-2 py-1 rounded flex items-center gap-1 transition ${quickFilter === 'overdue' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                <AlertTriangle size={10} /> Overdue
              </button>
              <button 
                onClick={() => setQuickFilter('milestones')} 
                className={`px-2 py-1 rounded transition ${quickFilter === 'milestones' ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                <Star size={10} /> Milestones
              </button>
              <button 
                onClick={() => setQuickFilter('high-priority')} 
                className={`px-2 py-1 rounded transition ${quickFilter === 'high-priority' ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                <Flag size={10} /> High
              </button>
            </div>
          </div>
        </div>

        {/* ========== STATS DASHBOARD ========== */}
        <div className="grid grid-cols-6 gap-2 p-2 text-xs bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <span className="text-gray-500 dark:text-gray-400">Tasks:</span> 
            <strong className="dark:text-white ml-1">{tasks.length}</strong>
          </div>
          <div className="text-center">
            <span className="text-gray-500 dark:text-gray-400">Completed:</span> 
            <strong className="text-emerald-600 ml-1">{completedTasks}</strong>
          </div>
          <div className="text-center">
            <span className="text-gray-500 dark:text-gray-400">Overdue:</span> 
            <strong className="text-red-600 ml-1">{overdueTasks}</strong>
          </div>
          <div className="text-center">
            <span className="text-gray-500 dark:text-gray-400">Dependencies:</span> 
            <strong className="dark:text-white ml-1">{dependencies.length}</strong>
          </div>
          <div className="text-center">
            <span className="text-gray-500 dark:text-gray-400">Budget:</span> 
            <strong className="text-cyan-600 ml-1">{formatBudgetInMillions(totalCost)}</strong>
          </div>
          <div className="text-center">
            <span className="text-gray-500 dark:text-gray-400">Progress:</span> 
            <strong className="text-emerald-600 ml-1">{projectProgress}%</strong>
          </div>
        </div>
      </div>


      {/* ========== PRINT DIALOG MODAL ========== */}
      {showPrintDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold dark:text-white">Professional Print Settings</h3>
              <button 
                onClick={() => setShowPrintDialog(false)} 
                className="dark:text-gray-400 hover:dark:text-white transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {/* Paper Size Selection */}
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Paper Size</label>
                <select 
                  value={printPaperSize} 
                  onChange={(e) => setPrintPaperSize(e.target.value as any)} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                >
                  <option value="A0">A0 (841 x 1189 mm) - Architectural</option>
                  <option value="A1">A1 (594 x 841 mm) - Large Poster</option>
                  <option value="A2">A2 (420 x 594 mm) - Medium</option>
                  <option value="A3">A3 (297 x 420 mm) - Small</option>
                  <option value="A4">A4 (210 x 297 mm) - Letter</option>
                </select>
              </div>
              
              {/* Orientation Selection */}
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Orientation</label>
                <select 
                  value={printOrientation} 
                  onChange={(e) => setPrintOrientation(e.target.value as any)} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                >
                  <option value="landscape">Landscape (Recommended for Gantt)</option>
                  <option value="portrait">Portrait</option>
                </select>
              </div>
              
              {/* Scale Selection */}
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Scaling</label>
                <select 
                  value={printScale} 
                  onChange={(e) => setPrintScale(e.target.value as any)} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                >
                  <option value="fit">Fit to Page (Recommended)</option>
                  <option value="actual">Actual Size</option>
                  <option value="shrink">Shrink to Fit</option>
                </select>
              </div>
              
              {/* Print Preview Info */}
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-xs">
                <p className="text-blue-700 dark:text-blue-300">
                  💡 <strong>Tip:</strong> For best results, use A2 or A3 Landscape with Fit to Page scaling.
                  The PDF will be generated with a clean white background and professional formatting.
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowPrintDialog(false)} 
                  className="flex-1 px-4 py-2 border rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePrint} 
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
                >
                  Generate PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== COLUMN CONFIGURATION MODAL ========== */}
      {showColumnConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold dark:text-white">Customize Columns</h3>
              <button 
                onClick={() => setShowColumnConfig(false)} 
                className="dark:text-gray-400 hover:dark:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {[...columns].sort((a, b) => a.order - b.order).map(col => (
                <div 
                  key={col.id} 
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded group"
                >
                  <div 
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                    onMouseDown={(e) => startDrag(col.id, e.clientX, col.order)}
                  >
                    <GripVertical size={14} />
                  </div>
                  <input 
                    type="checkbox" 
                    checked={col.visible} 
                    onChange={() => toggleColumnVisibility(col.id)} 
                    className="rounded"
                  />
                  <span className="flex-1 text-sm dark:text-gray-300">{col.label}</span>
                  <span className="text-xs text-gray-400">{col.width}px</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button 
                onClick={resetColumnLayout} 
                className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Reset to Default
              </button>
              <button 
                onClick={() => setShowColumnConfig(false)} 
                className="px-3 py-1.5 bg-amber-600 text-white rounded text-sm hover:bg-amber-700 transition"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== DEPENDENCY MODAL ========== */}
      {showDependencyModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold dark:text-white">Add Task Dependency</h3>
              <button 
                onClick={() => setShowDependencyModal(false)} 
                className="dark:text-gray-400 hover:dark:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {/* Predecessor Selection */}
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Predecessor <span className="text-gray-400">(must finish first)</span>
                </label>
                <select 
                  value={selectedDependency.fromTaskId || ''} 
                  onChange={(e) => setSelectedDependency({...selectedDependency, fromTaskId: parseInt(e.target.value)})} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">-- Select Predecessor Task --</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.name} {task.isMilestone ? '⭐' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Successor Selection */}
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Successor <span className="text-gray-400">(depends on predecessor)</span>
                </label>
                <select 
                  value={selectedDependency.toTaskId || ''} 
                  onChange={(e) => setSelectedDependency({...selectedDependency, toTaskId: parseInt(e.target.value)})} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">-- Select Successor Task --</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.name} {task.isMilestone ? '⭐' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Dependency Type Info */}
              <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-3">
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  <strong>🔗 Finish to Start (FS)</strong> - The successor task cannot start until the predecessor task finishes.
                  <br />
                  <span className="text-indigo-500">Example: "Concrete Pouring" cannot start until "Steel Reinforcement" is complete.</span>
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowDependencyModal(false)} 
                  className="flex-1 px-4 py-2 border rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => { 
                    if (selectedDependency.fromTaskId && selectedDependency.toTaskId) { 
                      addDependency(selectedDependency.fromTaskId, selectedDependency.toTaskId); 
                      setShowDependencyModal(false); 
                      setSelectedDependency({ fromTaskId: null, toTaskId: null });
                    } else { 
                      alert('⚠️ Please select both a predecessor and a successor task'); 
                    } 
                  }} 
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Add Dependency
                </button>
              </div>
            </div>
            
            {/* Existing Dependencies List */}
            {dependencies.length > 0 && (
              <div className="mt-4 pt-3 border-t dark:border-gray-700">
                <h4 className="text-xs font-medium mb-2 dark:text-white">
                  Existing Dependencies ({dependencies.length})
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {dependencies.map(dep => {
                    const from = tasks.find(t => t.id === dep.fromTaskId);
                    const to = tasks.find(t => t.id === dep.toTaskId);
                    return (
                      <div key={dep.id} className="flex justify-between items-center p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded text-xs">
                        <span className="truncate dark:text-gray-300">
                          {from?.name || '?'} → {to?.name || '?'}
                        </span>
                        <button 
                          onClick={() => removeDependency(dep.id)} 
                          className="text-red-500 hover:text-red-700 transition"
                          title="Remove dependency"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== TASK MODAL (ADD/EDIT) ========== */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold dark:text-white">
                {editingTaskId !== null ? '✏️ Edit Task' : '➕ Add New Task'}
              </h3>
              <button 
                onClick={() => { setShowTaskModal(false); setEditingTaskId(null); }} 
                className="dark:text-gray-400 hover:dark:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {/* Task Name Input */}
              <input 
                type="text" 
                placeholder="e.g., Foundation Excavation, Steel Reinforcement, Roofing" 
                value={taskForm.name} 
                onChange={(e) => setTaskForm({...taskForm, name: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none" 
              />
              
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Start Date</label>
                  <input 
                    type="date" 
                    value={taskForm.startDate} 
                    onChange={(e) => setTaskForm({...taskForm, startDate: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">End Date</label>
                  <input 
                    type="date" 
                    value={taskForm.endDate} 
                    onChange={(e) => setTaskForm({...taskForm, endDate: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  />
                </div>
              </div>
              
              {/* Parent Task Selection */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Parent Task (Optional)</label>
                <select 
                  value={taskForm.parentId || ''} 
                  onChange={(e) => setTaskForm({...taskForm, parentId: e.target.value ? parseInt(e.target.value) : null})} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">-- No Parent (Root Task) --</option>
                  {tasks.filter(t => t.parentId === null).map(task => (
                    <option key={task.id} value={task.id}>{task.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Priority Selection */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Priority</label>
                <select 
                  value={taskForm.priority} 
                  onChange={(e) => setTaskForm({...taskForm, priority: e.target.value as any})} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="low">🟢 Low - Can be deferred</option>
                  <option value="medium">🟡 Medium - Normal schedule</option>
                  <option value="high">🔴 High - Important for success</option>
                  <option value="urgent">⚠️ Urgent - Critical path</option>
                </select>
              </div>
              
              {/* Cost Input */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Cost ({currencySymbol})</label>
                <input 
                  type="number" 
                  placeholder="e.g., 50000, 150000, 500000" 
                  value={taskForm.cost} 
                  onChange={(e) => setTaskForm({...taskForm, cost: parseInt(e.target.value) || 0})} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500" 
                  step="1000"
                  min="0"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  💡 Examples: 50,000 (materials), 150,000 (labor), 500,000 (equipment)
                </p>
              </div>
              
              {/* Assigned To Input */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Assigned To</label>
                <input 
                  type="text" 
                  placeholder="e.g., John M. - Site Manager, Sarah K. - Architect" 
                  value={taskForm.assignedTo} 
                  onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                />
              </div>
              
              {/* Progress Slider */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Progress: {taskForm.progress}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={taskForm.progress} 
                  onChange={(e) => setTaskForm({...taskForm, progress: parseInt(e.target.value)})} 
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-5">
              <button 
                onClick={() => { setShowTaskModal(false); setEditingTaskId(null); }} 
                className="px-4 py-2 border rounded-lg dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTask} 
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
              >
                {editingTaskId !== null ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ========== PRINT CONTAINER (HIDDEN - FOR PDF CAPTURE) ========== */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="print-container" style={{ padding: '20px', background: 'white', width: '100%' }}>
          <div style={{ marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>Project Gantt Chart</h1>
            <p style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
              Project: {projectName} | Generated: {new Date().toLocaleString()} | Paper: {printPaperSize} {printOrientation}
            </p>
          </div>
          <div dangerouslySetInnerHTML={{ __html: ganttContainerRef.current?.outerHTML || '' }} />
        </div>
      </div>

      {/* ========== MAIN GANTT CHART CONTAINER ========== */}
      <div 
        ref={ganttContainerRef} 
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto shadow-md" 
        style={{ 
          maxHeight: isFullscreen ? 'calc(100vh - 60px)' : 'calc(100vh - 180px)',
          minWidth: '100%',
          width: '100%',
          display: 'block',
          position: 'relative'
        }}
      >
        <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', minWidth: 'max-content' }}>
          
          {/* ========== TABLE HEADER ========== */}
          <div className="flex border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/90 sticky top-0 z-10">
            {/* Column Headers */}
            {visibleColumns.map((col) => (
              <div 
                key={col.id} 
                className="flex-shrink-0 px-2 py-2 font-semibold text-xs text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 relative select-none"
                style={{ width: col.width }}
              >
                {col.label}
                {/* Resize Handle */}
                <div 
                  className="absolute right-0 top-0 w-0.5 h-full cursor-ew-resize hover:bg-amber-400 active:bg-amber-600 transition"
                  onMouseDown={(e) => startResize(col.id, e.clientX, col.width)}
                />
              </div>
            ))}
            
            {/* Timeline Header */}
            <div className="flex-1 flex">
              {safeTimelineHeaders.map((header, idx) => (
                <div 
                  key={idx} 
                  className="text-center py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 truncate"
                  style={{ width: `${header.width}%`, minWidth: '40px' }}
                  title={header.date.toLocaleDateString()}
                >
                  {header.label}
                </div>
              ))}
            </div>
            
            {/* Actions Header (Empty spacer) */}
            <div className="w-16 flex-shrink-0"></div>
          </div>

          {/* ========== TASK ROWS ========== */}
          {visibleTasks.map((task) => {
            const isParent = tasks.some(t => t.parentId === task.id);
            const { left, width } = taskBarPositions[task.id] || calculateBarPosition(task.startDate, task.endDate);
            const isOverdue = isTaskOverdue(task);
            const barColor = getTaskBarColor(task);
            
            return (
              <div 
                key={task.id} 
                className={`flex border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer ${selectedTask === task.id ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`} 
                onClick={() => setSelectedTask(task.id)}
              >
                {/* Data Columns */}
                {visibleColumns.map((col) => (
                  <div 
                    key={col.id} 
                    className="flex-shrink-0 px-2 py-1.5 text-xs border-r border-gray-100 dark:border-gray-800 truncate"
                    style={{ width: col.width }}
                  >
                    {col.id === 'name' ? (
                      <div className="flex items-center gap-1">
                        {/* Expand/Collapse Button for Parent Tasks */}
                        {isParent && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleExpand(task.id); }} 
                            className="text-gray-400 hover:text-amber-500 transition"
                          >
                            {expandedTasks.has(task.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </button>
                        )}
                        {/* Task Name with Indentation */}
                        <span className={`${task.parentId === null ? "font-semibold" : "ml-4"} truncate dark:text-gray-200`}>
                          {task.name}
                        </span>
                        {/* Milestone Icon */}
                        {task.isMilestone && <Star size={10} className="text-purple-400 flex-shrink-0" />}
                        {/* Dependency Icon */}
                        {dependencies.some(d => d.toTaskId === task.id) && <Link2 size={10} className="text-indigo-400 flex-shrink-0" />}
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
                          <select 
                            value={task.progress} 
                            onChange={(e) => updateTaskProgress(task.id, parseInt(e.target.value))} 
                            className="text-xs px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-200 w-full focus:outline-none focus:ring-1 focus:ring-amber-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {[0, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100].map(p => (
                              <option key={p} value={p}>{p}%</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`font-mono font-medium ${task.progress === 100 ? 'text-emerald-600' : 'text-gray-600'}`}>
                            {task.progress}%
                          </span>
                        )}
                      </div>
                    ) : col.id === 'start' ? (
                      <span className="dark:text-gray-300">{formatDate(task.startDate)}</span>
                    ) : col.id === 'end' ? (
                      <span className={`dark:text-gray-300 ${isOverdue && task.progress < 100 ? 'text-red-500 font-medium' : ''}`}>
                        {formatDate(task.endDate)}
                      </span>
                    ) : col.id === 'duration' ? (
                      <span className="dark:text-gray-300">{task.duration}d</span>
                    ) : col.id === 'wbs' ? (
                      <span className="font-mono dark:text-gray-300">{task.wbs || '—'}</span>
                    ) : col.id === 'assignedTo' ? (
                      <span className="dark:text-gray-300">{task.assignedTo || '—'}</span>
                    ) : (
                      <span className="dark:text-gray-300">{(task as any)[col.id] || '—'}</span>
                    )}
                  </div>
                ))}
                
                {/* Timeline Bar Area */}
                <div className="flex-1 relative py-1">
                  <div className="relative h-7 bg-gray-100 dark:bg-gray-700/50 rounded overflow-hidden">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex">
                      {safeTimelineHeaders.map((_, idx) => (
                        <div key={idx} className="flex-1 border-r border-gray-200 dark:border-gray-700/50"></div>
                      ))}
                    </div>
                    
                    {/* Task Bar or Milestone */}
                    {task.isMilestone || task.duration === 0 ? (
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-500 shadow-md"
                        style={{ left: `calc(${left} - 6px)` }}
                      >
                        <Star size={8} className="text-white absolute top-0.5 left-0.5" />
                      </div>
                    ) : (
                      <div 
                        className={`absolute top-0.5 h-6 rounded-md shadow-sm transition-all cursor-pointer ${barColor} ${isOverdue ? 'ring-2 ring-red-400' : ''}`} 
                        style={{ left: left, width: width }}
                        title={`${task.name}: ${formatDate(task.startDate)} - ${formatDate(task.endDate)} (${task.progress}% complete)`}
                      >
                        {/* Progress Fill */}
                        <div 
                          className="absolute inset-0 bg-white/25 rounded-md transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                        {/* Progress Percentage Label */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[9px] font-medium text-white drop-shadow-sm">
                            {task.progress}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons (Edit/Delete) */}
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
                {!isStakeholder && task.isMilestone && (
                  <div className="w-16 flex-shrink-0 flex items-center justify-center">
                    <span className="text-[9px] text-purple-500">Milestone</span>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* ========== EMPTY STATE ========== */}
          {visibleTasks.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 dark:text-gray-400 mb-3">No tasks available. Get started below:</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button 
                  onClick={addNewTask} 
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg flex items-center gap-2 hover:bg-amber-700 transition"
                >
                  <Plus size={16} /> Add First Task
                </button>
                <button 
                  onClick={loadSampleData} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                >
                  <Sparkles size={16} /> Load Sample Project
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition"
                >
                  <Upload size={16} /> Import MS Project
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                💡 Tip: You can also press Ctrl+N to add a new task quickly
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== END OF PROJECT GANTT COMPONENT ==========