import React, { useState } from 'react';
import { Project, Team } from '../types';
import { Plus, Trash, Play, Users, List, Type } from 'lucide-react';

interface ConfigurationPanelProps {
  project: Project;
  onSaveConfiguration: (projectId: string, doubleRound: boolean, relegationCount: number, teams: Team[]) => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ project, onSaveConfiguration }) => {
  const [doubleRound, setDoubleRound] = useState(true);
  const [relegationCount, setRelegationCount] = useState(4);
  const [teams, setTeams] = useState<Team[]>([]);
  
  // Input states
  const [inputMode, setInputMode] = useState<'single' | 'bulk'>('bulk');
  const [newTeamName, setNewTeamName] = useState('');
  const [bulkTeamsInput, setBulkTeamsInput] = useState('');
  
  const addTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeamName.trim()) {
      const newTeam: Team = {
        id: crypto.randomUUID(),
        name: newTeamName.trim()
      };
      setTeams([...teams, newTeam]);
      setNewTeamName('');
    }
  };

  const addBulkTeams = () => {
    if (!bulkTeamsInput.trim()) return;
    
    const lines = bulkTeamsInput.split(/\r?\n/);
    const newTeams: Team[] = [];
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed) {
            newTeams.push({
                id: crypto.randomUUID(),
                name: trimmed
            });
        }
    });

    setTeams([...teams, ...newTeams]);
    setBulkTeamsInput('');
  };

  const removeTeam = (id: string) => {
    setTeams(teams.filter(t => t.id !== id));
  };

  const clearAllTeams = () => {
    if (confirm('Tem certeza que deseja remover todos os times da lista?')) {
        setTeams([]);
    }
  };

  const handleSave = () => {
    if (teams.length < 2) {
      alert("Adicione pelo menos 2 times.");
      return;
    }
    if (relegationCount >= teams.length) {
        alert("O número de rebaixados não pode ser maior ou igual ao número de times.");
        return;
    }
    onSaveConfiguration(project.id, doubleRound, relegationCount, teams);
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-100 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-brand-600 p-6 text-white shrink-0">
          <h2 className="text-2xl font-bold flex items-center gap-2">
             <Users /> Configuração do Campeonato
          </h2>
          <p className="opacity-80 text-sm mt-1">Configure as regras e participantes para: <strong>{project.name}</strong></p>
        </div>

        <div className="p-6 space-y-8 flex-1 overflow-auto">
          
          {/* Settings Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">Regras Gerais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-white">
                <input 
                  type="checkbox" 
                  checked={doubleRound} 
                  onChange={(e) => setDoubleRound(e.target.checked)}
                  className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 bg-white"
                />
                <div>
                    <span className="block font-medium text-slate-800">Turno e Returno</span>
                    <span className="text-xs text-slate-500">Ida e volta (todos contra todos 2x)</span>
                </div>
              </label>

              <div className="p-4 border rounded-lg bg-white">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                   Número de Rebaixados
                </label>
                <input 
                  type="number" 
                  min="0"
                  max={Math.max(0, teams.length - 1)}
                  value={relegationCount}
                  onChange={(e) => setRelegationCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-white text-slate-900 border-slate-300 rounded-md shadow-sm focus:border-brand-500 focus:ring-brand-500 border p-2"
                />
              </div>
            </div>
          </div>

          {/* Teams Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b pb-2">
                <h3 className="text-lg font-semibold text-slate-700">Participantes <span className="text-sm font-normal text-slate-500">({teams.length})</span></h3>
                
                <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                    <button 
                        onClick={() => setInputMode('single')}
                        className={`p-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors ${inputMode === 'single' ? 'bg-white shadow text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Adicionar um por um"
                    >
                        <Type size={16} /> <span className="hidden sm:inline">Individual</span>
                    </button>
                    <button 
                        onClick={() => setInputMode('bulk')}
                        className={`p-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors ${inputMode === 'bulk' ? 'bg-white shadow text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
                        title="Adicionar lista"
                    >
                        <List size={16} /> <span className="hidden sm:inline">Lista</span>
                    </button>
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                {inputMode === 'single' ? (
                    <form onSubmit={addTeam} className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Nome do Time (ex: Flamengo)" 
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        className="flex-1 bg-white text-slate-900 border border-slate-300 rounded px-4 py-2 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                    <button 
                        type="submit" 
                        disabled={!newTeamName.trim()}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
                    >
                        <Plus size={18} /> Adicionar
                    </button>
                    </form>
                ) : (
                    <div className="flex flex-col gap-2">
                        <textarea
                            placeholder="Cole a lista de times aqui (um nome por linha)...&#10;Time A&#10;Time B&#10;Time C"
                            value={bulkTeamsInput}
                            onChange={(e) => setBulkTeamsInput(e.target.value)}
                            rows={5}
                            className="w-full bg-white text-slate-900 border border-slate-300 rounded p-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm"
                        />
                        <div className="flex justify-end">
                             <button 
                                onClick={addBulkTeams}
                                disabled={!bulkTeamsInput.trim()}
                                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded font-medium flex items-center gap-2 disabled:opacity-50 transition-colors text-sm"
                            >
                                <Plus size={16} /> Processar Lista
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* List of added teams */}
            <div className="border rounded-lg divide-y divide-slate-100 bg-white shadow-sm">
              <div className="p-2 bg-slate-50 border-b flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Times Adicionados</span>
                  {teams.length > 0 && (
                      <button onClick={clearAllTeams} className="text-xs text-red-500 hover:underline">Limpar tudo</button>
                  )}
              </div>
              <div className="max-h-60 overflow-y-auto">
                {teams.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 italic text-sm">
                        A lista de participantes está vazia. <br/>Use as opções acima para adicionar times.
                    </div>
                ) : (
                    teams.map((team, index) => (
                    <div key={team.id} className="flex justify-between items-center p-2 px-4 hover:bg-slate-50 transition-colors">
                        <span className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 text-[10px] flex items-center justify-center font-bold">
                                {index + 1}
                            </span>
                            <span className="font-medium text-slate-700">{team.name}</span>
                        </span>
                        <button 
                            onClick={() => removeTeam(team.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                            title="Remover time"
                        >
                            <Trash size={14} />
                        </button>
                    </div>
                    ))
                )}
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t flex justify-end shrink-0">
             <button 
                onClick={handleSave}
                disabled={teams.length < 2}
                className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
             >
                <Play size={20} fill="currentColor" /> Gerar Campeonato
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;