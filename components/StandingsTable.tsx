import React, { useMemo } from 'react';
import { Project, StandingsRow, Match } from '../types';
import { Trophy, Activity, CalendarRange } from 'lucide-react';

interface StandingsTableProps {
  project: Project;
}

const StandingsTable: React.FC<StandingsTableProps> = ({ project }) => {
  const standings = useMemo(() => {
    const stats: Record<string, StandingsRow> = {};

    // Initialize stats
    project.settings.teams.forEach(team => {
      stats[team.id] = {
        teamId: team.id,
        teamName: team.name,
        played: 0,
        points: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      };
    });

    // Calculate stats from rounds
    project.rounds.forEach(round => {
      round.matches.forEach(match => {
        // Skip unplayed matches
        if (match.homeScore === null || match.awayScore === null) return;

        const home = stats[match.homeTeamId];
        const away = stats[match.awayTeamId];
        
        if (!home || !away) return; // Should not happen

        home.played++;
        away.played++;
        home.goalsFor += match.homeScore;
        home.goalsAgainst += match.awayScore;
        away.goalsFor += match.awayScore;
        away.goalsAgainst += match.homeScore;

        if (match.homeScore > match.awayScore) {
          home.won++;
          home.points += 3;
          away.lost++;
        } else if (match.homeScore < match.awayScore) {
          away.won++;
          away.points += 3;
          home.lost++;
        } else {
          home.drawn++;
          home.points += 1;
          away.drawn++;
          away.points += 1;
        }
      });
    });

    // Calculate final GD
    Object.values(stats).forEach(stat => {
      stat.goalDifference = stat.goalsFor - stat.goalsAgainst;
    });

    // Sort: Points > Wins > GD > GF > Name
    return Object.values(stats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.won !== a.won) return b.won - a.won;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.teamName.localeCompare(b.teamName);
    });
  }, [project]);

  const totalTeams = standings.length;
  const relegationCount = project.settings.relegationCount;
  const relegationThresholdIndex = totalTeams - relegationCount;

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
      <div className="p-6 bg-white border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-4">
         <div>
            <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-slate-800">{project.name}</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700 border border-brand-200">
                    <CalendarRange size={12} />
                    {project.rounds.length} Rodadas
                </span>
            </div>
            <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                <Activity size={14} /> Classificação em Tempo Real
            </p>
         </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-xs">
              <tr>
                <th className="px-4 py-3 w-12 text-center">#</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3 text-center w-12" title="Pontos">P</th>
                <th className="px-4 py-3 text-center w-12 hidden sm:table-cell" title="Jogos">J</th>
                <th className="px-4 py-3 text-center w-12 hidden sm:table-cell" title="Vitórias">V</th>
                <th className="px-4 py-3 text-center w-12 hidden sm:table-cell" title="Empates">E</th>
                <th className="px-4 py-3 text-center w-12 hidden sm:table-cell" title="Derrotas">D</th>
                <th className="px-4 py-3 text-center w-12 hidden md:table-cell" title="Gols Pró">GP</th>
                <th className="px-4 py-3 text-center w-12 hidden md:table-cell" title="Gols Contra">GC</th>
                <th className="px-4 py-3 text-center w-12" title="Saldo de Gols">SG</th>
                <th className="px-4 py-3 text-center w-16 hidden lg:table-cell">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {standings.map((row, index) => {
                const isChampion = index === 0;
                const isRelegation = index >= relegationThresholdIndex && relegationCount > 0;
                
                let rowClass = "hover:bg-slate-50 transition-colors";
                let posClass = "bg-slate-100 text-slate-500";
                
                if (isChampion) posClass = "bg-yellow-100 text-yellow-700 font-bold";
                if (isRelegation) rowClass += " bg-red-50 hover:bg-red-100";
                
                const efficiency = row.played > 0 ? ((row.points / (row.played * 3)) * 100).toFixed(1) : '0.0';

                return (
                  <tr key={row.teamId} className={rowClass}>
                    <td className="p-0">
                        <div className={`h-full w-full py-3 flex items-center justify-center ${posClass}`}>
                            {isChampion && <Trophy size={14} className="mr-1 text-yellow-600" />}
                            {index + 1}
                        </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700 flex items-center gap-2">
                        {row.teamName}
                        {isRelegation && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Zona de Rebaixamento"></span>}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900 bg-slate-50/50">{row.points}</td>
                    <td className="px-4 py-3 text-center text-slate-600 hidden sm:table-cell">{row.played}</td>
                    <td className="px-4 py-3 text-center text-green-600 hidden sm:table-cell">{row.won}</td>
                    <td className="px-4 py-3 text-center text-slate-500 hidden sm:table-cell">{row.drawn}</td>
                    <td className="px-4 py-3 text-center text-red-500 hidden sm:table-cell">{row.lost}</td>
                    <td className="px-4 py-3 text-center text-slate-500 hidden md:table-cell">{row.goalsFor}</td>
                    <td className="px-4 py-3 text-center text-slate-500 hidden md:table-cell">{row.goalsAgainst}</td>
                    <td className="px-4 py-3 text-center font-medium hidden sm:table-cell">
                        <span className={row.goalDifference > 0 ? 'text-green-600' : row.goalDifference < 0 ? 'text-red-600' : 'text-slate-500'}>
                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </span>
                    </td>
                    {/* Fallback for small screens to show SG in last column if needed, but keeping standard layout */}
                    <td className="px-4 py-3 text-center font-medium table-cell sm:hidden">
                       {row.goalDifference}
                    </td>
                     <td className="px-4 py-3 text-center text-slate-400 text-xs hidden lg:table-cell">
                        {efficiency}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
           <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded-sm"></span> Líder
           </div>
           {relegationCount > 0 && (
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-50 border border-red-100 rounded-sm"></span> Zona de Rebaixamento
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default StandingsTable;