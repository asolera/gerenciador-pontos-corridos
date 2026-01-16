import React, { useRef } from 'react';
import { Project } from '../types';
import { FolderPlus, Upload, Download, ChevronLeft, Menu, Trash2 } from 'lucide-react';

interface SidebarLeftProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  projects: Project[];
  currentProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string) => void;
  onImportProject: (project: Project) => void;
  onExportProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

const SidebarLeft: React.FC<SidebarLeftProps> = ({
  isOpen,
  toggleSidebar,
  projects,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  onImportProject,
  onExportProject,
  onDeleteProject
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newProjectName, setNewProjectName] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName);
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          const project = JSON.parse(json) as Project;
          // Basic validation
          if (project.id && project.name && project.rounds) {
            onImportProject(project);
          } else {
            alert('Arquivo inválido: Estrutura do projeto incorreta.');
          }
        } catch (error) {
          alert('Erro ao ler arquivo JSON.');
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    if (event.target) event.target.value = '';
  };

  const selectedProject = projects.find(p => p.id === currentProjectId);

  return (
    <div className={`flex flex-col bg-slate-900 text-white transition-all duration-300 h-screen ${isOpen ? 'w-80' : 'w-16'} border-r border-slate-700`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800 h-16">
        {isOpen && <h1 className="font-bold text-xl truncate">Pontos Corridos</h1>}
        <button onClick={toggleSidebar} className="p-1 hover:bg-slate-700 rounded transition-colors">
          {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {isOpen ? (
          <>
            {/* Project Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-400 uppercase">Projeto Atual</label>
              <select
                value={currentProjectId || ''}
                onChange={(e) => onSelectProject(e.target.value)}
                className="bg-white text-slate-900 border border-slate-300 rounded p-2 text-base focus:outline-none focus:border-brand-500"
              >
                <option value="" disabled>Selecione um projeto</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(!isCreating)}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white py-2 px-3 rounded text-base font-medium transition-colors"
              >
                <FolderPlus size={16} /> Novo
              </button>
              {selectedProject && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteProject(selectedProject.id);
                  }}
                  className="flex-shrink-0 flex items-center justify-center gap-2 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white py-2 px-3 rounded text-base font-medium transition-colors"
                  title="Excluir projeto atual"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Create Form */}
            {isCreating && (
              <form onSubmit={handleCreateSubmit} className="bg-slate-800 p-3 rounded border border-slate-700 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Nome do Campeonato"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="bg-white text-slate-900 border border-slate-300 rounded px-2 py-1 text-base focus:outline-none focus:border-brand-500"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsCreating(false)} className="text-sm text-slate-400 hover:text-white">Cancelar</button>
                  <button type="submit" disabled={!newProjectName.trim()} className="text-sm bg-brand-600 px-2 py-1 rounded text-white disabled:opacity-50">Criar</button>
                </div>
              </form>
            )}

            <hr className="border-slate-800" />

            {/* Import/Export */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-400 uppercase">Dados</label>

              <button
                type="button"
                onClick={() => selectedProject && onExportProject(selectedProject)}
                disabled={!selectedProject}
                className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 text-base text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Download size={18} /> Exportar Projeto
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 text-base text-slate-300 transition-colors"
              >
                <Upload size={18} /> Importar Projeto
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
          </>
        ) : (
          /* Collapsed View Icons */
          <div className="flex flex-col items-center gap-4 mt-2">
            <button onClick={() => toggleSidebar()} title="Projetos" className="p-2 bg-slate-800 rounded-full hover:bg-brand-600 transition-colors">
              <FolderPlus size={20} />
            </button>
            {selectedProject && (
              <button onClick={() => onExportProject(selectedProject)} title="Exportar" className="p-2 hover:text-brand-400 transition-colors">
                <Download size={20} />
              </button>
            )}
            <button onClick={() => fileInputRef.current?.click()} title="Importar" className="p-2 hover:text-brand-400 transition-colors">
              <Upload size={20} />
            </button>
          </div>
        )}
      </div>

      {isOpen && selectedProject && (
        <div className="p-4 text-sm text-slate-500 border-t border-slate-800">
          ID: {selectedProject.id.slice(0, 8)}...
        </div>
      )}
    </div>
  );
};

export default SidebarLeft;