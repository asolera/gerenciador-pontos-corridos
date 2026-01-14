import React, { useState, useEffect } from 'react';
import { Project, Round, Team } from '../types';
import { ChevronLeft, ChevronRight, Save, XCircle } from 'lucide-react';

interface SidebarRightProps {
  project: Project | undefined;
  onUpdateMatch: (matchId: string, homeScore: number | null, awayScore: number | null) => void;
}

const SidebarRight: React.FC<SidebarRightProps> = ({ project, onUpdateMatch }) => {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  // Reset round index when project changes
  useEffect(() => {
    setCurrentRoundIndex(0);
  }, [project?.id]);

  if (!project || !project.isConfigured || project.rounds.length === 0) {
    return (
      <div className="w-80 bg-white border-l border-slate-200 h-screen p-6 flex flex-col items-center justify-center text-slate-400 text-center">
        <XCircle size={48} className="mb-4 opacity-20" />
        <p>Nenhuma rodada disponível. Configure o projeto primeiro.</p>
      </div>
    );
  }

  const rounds = project.rounds;
  const currentRound = rounds[currentRoundIndex];

  const handlePrev = () => {
    setCurrentRoundIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentRoundIndex(prev => Math.min(rounds.length - 1, prev + 1));
  };

  const getTeamName = (id: string) => {
    return project.settings.teams.find(t => t.id === id)?.name || 'Desconhecido';
  };

  return (
    <div className="w-80 bg-white border-l border-slate-200 h-screen flex flex-col shadow-xl z-10">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4 bg-slate-50">
        <button 
          onClick={handlePrev} 
          disabled={currentRoundIndex === 0}
          className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex flex-col items-center">
            <span className="font-bold text-slate-800 uppercase text-sm">Rodada</span>
            <span className="text-2xl font-black text-brand-600">{currentRound.number}</span>
        </div>

        <button 
          onClick={handleNext} 
          disabled={currentRoundIndex === rounds.length - 1}
          className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Matches List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {currentRound.matches.map((match) => (
          <div key={match.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 w-24 truncate text-right" title={getTeamName(match.homeTeamId)}>
                {getTeamName(match.homeTeamId)}
              </span>
              <span className="text-[10px] text-slate-300 mx-1">vs</span>
              <span className="text-xs font-semibold text-slate-500 w-24 truncate text-left" title={getTeamName(match.awayTeamId)}>
                {getTeamName(match.awayTeamId)}
              </span>
            </div>
            
            <div className="flex justify-center items-center gap-3">
              <input
                type="number"
                min="0"
                placeholder="-"
                value={match.homeScore ?? ''}
                onChange={(e) => {
                    const val = e.target.value === '' ? null : parseInt(e.target.value);
                    onUpdateMatch(match.id, val, match.awayScore);
                }}
                className="w-12 h-10 text-center text-lg font-bold border rounded bg-white text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
              <span className="text-slate-400 font-bold">x</span>
              <input
                type="number"
                min="0"
                placeholder="-"
                value={match.awayScore ?? ''}
                onChange={(e) => {
                    const val = e.target.value === '' ? null : parseInt(e.target.value);
                    onUpdateMatch(match.id, match.homeScore, val);
                }}
                className="w-12 h-10 text-center text-lg font-bold border rounded bg-white text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 bg-white border-t border-slate-200 text-center">
        <p className="text-xs text-slate-400">
           Alterações são salvas automaticamente
        </p>
      </div>
    </div>
  );
};

export default SidebarRight;