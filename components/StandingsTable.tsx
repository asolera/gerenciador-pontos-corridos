import React, { useMemo } from 'react';
import { Project, StandingsRow, Match } from '../types';
import { Trophy, Activity, CalendarRange, ArrowUpDown, ArrowUp, ArrowDown, Medal } from 'lucide-react';
import TeamHistoryModal from './TeamHistoryModal';

interface StandingsTableProps {
  project: Project;
}

type SortKey = keyof StandingsRow | 'efficiency';

const StandingsTable: React.FC<StandingsTableProps> = ({ project }) => {
  const [selectedTeamId, setSelectedTeamId] = React.useState<string | null>(null);
  const [sortConfig, setSortConfig] = React.useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'points',
    direction: 'desc'
  });

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={12} className="opacity-30 ml-1 inline" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp size={12} className="ml-1 inline text-brand-600" />
      : <ArrowDown size={12} className="ml-1 inline text-brand-600" />;
  };

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

    // Sort function
    return Object.values(stats)
      .map(stat => ({
        ...stat,
        efficiency: stat.played > 0 ? (stat.points / (stat.played * 3)) * 100 : 0
      }))
      .sort((a, b) => {
        const { key, direction } = sortConfig;
        const multiplier = direction === 'asc' ? 1 : -1;

        if (key === 'teamName') {
          return a.teamName.localeCompare(b.teamName) * multiplier;
        }

        // Helper for numeric sort
        const valA = a[key as keyof typeof a];
        const valB = b[key as keyof typeof b];

        if (valA !== valB) {
          return ((valA as number) - (valB as number)) * multiplier;
        }

        // Tie-breakers (Standard logic irrespective of sort direction, or maybe strictly standard?)
        // Let's keep standard tie-breakers for consistency unless we are sorting by that specific column
        if (key !== 'points' && b.points !== a.points) return b.points - a.points;
        if (key !== 'won' && b.won !== a.won) return b.won - a.won;
        if (key !== 'goalDifference' && b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (key !== 'goalsFor' && b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.teamName.localeCompare(b.teamName);
      });
  }, [project, sortConfig]);

  const totalTeams = standings.length;
  const relegationCount = project.settings.relegationCount;
  const relegationThresholdIndex = totalTeams - relegationCount;

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
      <div className="p-6 bg-white border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-3xl font-bold text-slate-800">{project.name}</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-medium bg-brand-100 text-brand-700 border border-brand-200">
              <CalendarRange size={12} />
              {project.rounds.length} Rodadas
            </span>
          </div>
          <p className="text-slate-500 text-base flex items-center gap-1 mt-1">
            <Activity size={14} /> Classificação em Tempo Real
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
          <table className="w-full text-base text-left">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-sm">
              <tr>
                <th className="px-4 py-3 w-12 text-center">#</th>
                <th
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200 transition-colors select-none"
                  onClick={() => handleSort('teamName')}
                >
                  Time <SortIcon column="teamName" />
                </th>
                <th
                  className="px-4 py-3 text-center w-12 cursor-pointer hover:bg-slate-200 transition-colors select-none"
                  title="Pontos"
                  onClick={() => handleSort('points')}
                >
                  P <SortIcon column="points" />
                </th>
                <th
                  className="px-4 py-3 text-center w-12 hidden sm:table-cell cursor-pointer hover:bg-slate-200 transition-colors select-none"
                  title="Jogos"
                  onClick={() => handleSort('played')}
                >
                  J <SortIcon column="played" />
                </th>
                <th
                  className="px-4 py-3 text-center w-12 hidden sm:table-cell cursor-pointer hover:bg-slate-200 transition-colors select-none"
                  title="Vitórias"
                  onClick={() => handleSort('won')}
                >
                  V <SortIcon column="won" />
                </th>
                <th
                  className="px-4 py-3 text-center w-12 hidden sm:table-cell cursor-pointer hover:bg-slate-200 transition-colors select-none"
                  title="Empates"
                  onClick={() => handleSort('drawn')}
                >
                  E <SortIcon column="drawn" />
                </th>
                <th
                  className="px-4 py-3 text-center w-12 hidden sm:table-cell cursor-pointer hover:bg-slate-200 transition-colors select-none"
                  title="Derrotas"
                  onClick={() => handleSort('lost')}
                >
                  D <SortIcon column="lost" />
                </th>
                <th
                  className="px-4 py-3 text-center w-12 hidden md:table-cell cursor-pointer hover:bg-slate-200 transition-colors select-none"
                  title="Gols Pró"
                  onClick={() => handleSort('goalsFor')}
                >
                  GP <SortIcon column="goalsFor" />
                </th>
                <th
                  className="px-4 py-3 text-center w-12 hidden md:table-cell cursor-pointer hover:bg-slate-200 transition-colors select-none"
                  title="Gols Contra"
                  onClick={() => handleSort('goalsAgainst')}
                >
                  GC <SortIcon column="goalsAgainst" />
                </th>
                <th
                  className="px-4 py-3 text-center w-12 cursor-pointer hover:bg-slate-200 transition-colors select-none"
                  title="Saldo de Gols"
                  onClick={() => handleSort('goalDifference')}
                >
                  SG <SortIcon column="goalDifference" />
                </th>
                <th
                  className="px-4 py-3 text-center w-16 hidden lg:table-cell cursor-pointer hover:bg-slate-200 transition-colors select-none"
                  onClick={() => handleSort('efficiency')}
                >
                  % <SortIcon column="efficiency" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {standings.map((row, index) => {
                const isChampion = index === 0;
                const isRunnerUp = index === 1;
                const isThirdPlace = index === 2;
                const isRelegation = index >= relegationThresholdIndex && relegationCount > 0;

                let rowClass = "hover:bg-slate-50 transition-colors";
                let posClass = "bg-slate-100 text-slate-500";

                if (isChampion) {
                  posClass = "bg-yellow-100 text-yellow-700 font-bold";
                  rowClass += " bg-yellow-50/50 hover:bg-yellow-100/50";
                } else if (isRunnerUp) {
                  posClass = "bg-slate-200 text-slate-700 font-bold";
                  rowClass += " bg-slate-50 hover:bg-slate-100";
                } else if (isThirdPlace) {
                  posClass = "bg-orange-100 text-orange-800 font-bold";
                  rowClass += " bg-orange-50/50 hover:bg-orange-100/50";
                }

                if (isRelegation) rowClass += " bg-red-50 hover:bg-red-100";



                return (
                  <tr key={row.teamId} className={rowClass}>
                    <td className="p-0">
                      <div className={`h-full w-full py-3 flex items-center justify-center ${posClass}`}>
                        {isChampion && <Trophy size={14} className="mr-1 text-yellow-600" />}
                        {isRunnerUp && <Medal size={14} className="mr-1 text-slate-500" />}
                        {isThirdPlace && <Medal size={14} className="mr-1 text-orange-700" />}
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      <button
                        onClick={() => setSelectedTeamId(row.teamId)}
                        className="flex items-center gap-2 hover:text-brand-600 hover:underline transition-colors text-left"
                        title="Ver histórico de partidas"
                      >
                        {row.teamName}
                        {isRelegation && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Zona de Rebaixamento"></span>}
                      </button>
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
                    <td className="px-4 py-3 text-center text-slate-400 text-sm hidden lg:table-cell">
                      {row.efficiency.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
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

      <TeamHistoryModal
        isOpen={!!selectedTeamId}
        onClose={() => setSelectedTeamId(null)}
        project={project}
        teamId={selectedTeamId}
      />
    </div >
  );
};

export default StandingsTable;