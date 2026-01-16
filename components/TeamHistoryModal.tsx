import React from 'react';
import { Project, Match, Team } from '../types';
import { X, Calendar } from 'lucide-react';

interface TeamHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    teamId: string | null;
}

const TeamHistoryModal: React.FC<TeamHistoryModalProps> = ({ isOpen, onClose, project, teamId }) => {
    if (!isOpen || !teamId) return null;

    const team = project.settings.teams.find(t => t.id === teamId);
    if (!team) return null;

    const getOpponent = (match: Match) => {
        const opponentId = match.homeTeamId === teamId ? match.awayTeamId : match.homeTeamId;
        return project.settings.teams.find(t => t.id === opponentId)?.name || 'Desconhecido';
    };

    const getMatchDetails = (match: Match) => {
        const isHome = match.homeTeamId === teamId;
        const myScore = isHome ? match.homeScore : match.awayScore;
        const opponentScore = isHome ? match.awayScore : match.homeScore;

        let result: 'win' | 'loss' | 'draw' | 'pending' = 'pending';
        if (myScore !== null && opponentScore !== null) {
            if (myScore > opponentScore) result = 'win';
            else if (myScore < opponentScore) result = 'loss';
            else result = 'draw';
        }

        return { isHome, myScore, opponentScore, result };
    };

    // Coleta todas as partidas do time em todos as rodadas
    const teamMatches = project.rounds.flatMap(round =>
        round.matches
            .filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId)
            .map(m => ({ ...m, roundNumber: round.number }))
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-4 border-b bg-slate-50 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            {team.name}
                        </h3>
                        <p className="text-sm text-slate-500">Histórico de Partidas</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-4 py-3 text-center w-16">Rd</th>
                                <th className="px-4 py-3 text-right w-1/3">Mandante</th>
                                <th className="px-2 py-3 text-center w-20">Placar</th>
                                <th className="px-4 py-3 text-left w-1/3">Visitante</th>
                                <th className="px-4 py-3 text-center w-24">Resultado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {teamMatches.map((match) => {
                                const { isHome, myScore, opponentScore, result } = getMatchDetails(match);
                                const opponentName = getOpponent(match);

                                let rowBg = "hover:bg-slate-50";
                                let resultBadge = <span className="text-slate-400 text-xs font-medium">-</span>;

                                if (result === 'win') {
                                    resultBadge = <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Vitória</span>;
                                    rowBg = "bg-green-50/30 hover:bg-green-50/60";
                                } else if (result === 'loss') {
                                    resultBadge = <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">Derrota</span>;
                                    rowBg = "bg-red-50/30 hover:bg-red-50/60";
                                } else if (result === 'draw') {
                                    resultBadge = <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">Empate</span>;
                                }

                                return (
                                    <tr key={match.id} className={`${rowBg} transition-colors`}>
                                        <td className="px-4 py-3 text-center text-slate-400 text-sm font-medium">
                                            {match.roundNumber}
                                        </td>
                                        <td className={`px-4 py-3 text-right text-base ${isHome ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                                            {isHome ? team.name : opponentName}
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1 font-mono font-bold text-lg bg-white border rounded px-2 py-0.5 shadow-sm">
                                                <span className={isHome ? 'text-slate-900' : 'text-slate-500'}>{match.homeScore ?? '-'}</span>
                                                <span className="text-slate-300 text-sm">:</span>
                                                <span className={!isHome ? 'text-slate-900' : 'text-slate-500'}>{match.awayScore ?? '-'}</span>
                                            </div>
                                        </td>
                                        <td className={`px-4 py-3 text-left text-base ${!isHome ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                                            {isHome ? opponentName : team.name}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {resultBadge}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {teamMatches.length === 0 && (
                        <div className="p-8 text-center text-slate-400">
                            Nenhuma partida encontrada.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t text-center">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamHistoryModal;
