import React, { useState, useEffect } from 'react';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import StandingsTable from './components/StandingsTable';
import ConfigurationPanel from './components/ConfigurationPanel';
import { Project, Team } from './types';
import { generateSchedule } from './utils/scheduler';

const STORAGE_KEY = 'pontos_corridos_projects';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProjects(parsed);
        if (parsed.length > 0) {
          setCurrentProjectId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    }
  }, []);

  // Save to LocalStorage whenever projects change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const handleCreateProject = (name: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      isConfigured: false,
      settings: {
        doubleRound: true,
        relegationCount: 4,
        teams: []
      },
      rounds: []
    };
    setProjects(prev => [...prev, newProject]);
    setCurrentProjectId(newProject.id);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
        // If we are deleting the currently selected project, deselect it first
        if (currentProjectId === id) {
            setCurrentProjectId(null);
        }
        setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleImportProject = (project: Project) => {
    // Check if ID exists, if so, replace, otherwise add
    setProjects(prev => {
      const exists = prev.some(p => p.id === project.id);
      if (exists) {
        return prev.map(p => p.id === project.id ? project : p);
      }
      return [...prev, project];
    });
    setCurrentProjectId(project.id);
  };

  const handleExportProject = (project: Project) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${project.name.replace(/\s+/g, '_')}_config.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleSaveConfiguration = (projectId: string, doubleRound: boolean, relegationCount: number, teams: Team[]) => {
    const rounds = generateSchedule(teams, doubleRound);
    
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          isConfigured: true,
          settings: {
            doubleRound,
            relegationCount,
            teams
          },
          rounds
        };
      }
      return p;
    }));
  };

  const handleUpdateMatch = (matchId: string, homeScore: number | null, awayScore: number | null) => {
    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        return {
          ...p,
          rounds: p.rounds.map(r => ({
            ...r,
            matches: r.matches.map(m => {
              if (m.id === matchId) {
                return { ...m, homeScore, awayScore };
              }
              return m;
            })
          }))
        };
      }
      return p;
    }));
  };

  const currentProject = projects.find(p => p.id === currentProjectId);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <SidebarLeft 
        isOpen={leftSidebarOpen}
        toggleSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
        projects={projects}
        currentProjectId={currentProjectId}
        onSelectProject={setCurrentProjectId}
        onCreateProject={handleCreateProject}
        onImportProject={handleImportProject}
        onExportProject={handleExportProject}
        onDeleteProject={handleDeleteProject}
      />

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {currentProject ? (
          currentProject.isConfigured ? (
             <>
               <StandingsTable project={currentProject} />
               <SidebarRight project={currentProject} onUpdateMatch={handleUpdateMatch} />
             </>
          ) : (
             <ConfigurationPanel project={currentProject} onSaveConfiguration={handleSaveConfiguration} />
          )
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
             <div className="text-6xl mb-4">⚽</div>
             <h2 className="text-xl font-semibold">Selecione ou crie um projeto</h2>
             <p className="text-sm">Utilize o menu lateral para começar.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;