import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ProjectContextType {
  currentProjectId: number | null;
  setCurrentProjectId: (id: number | null) => void;
  currentProjectName: string;
  setCurrentProjectName: (name: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState<string>('');
  const location = useLocation();

  useEffect(() => {
    const match = location.pathname.match(/\/stakeholder\/projects\/(\d+)/);
    if (match) {
      setCurrentProjectId(parseInt(match[1]));
    } else if (!location.pathname.includes('/stakeholder/projects/')) {
      setCurrentProjectId(null);
      setCurrentProjectName('');
    }
  }, [location]);

  return (
    <ProjectContext.Provider value={{ currentProjectId, setCurrentProjectId, currentProjectName, setCurrentProjectName }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}