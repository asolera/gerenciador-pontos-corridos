import { Team, Round, Match } from '../types';

export const generateSchedule = (teams: Team[], doubleRound: boolean): Round[] => {
  if (teams.length < 2) return [];

  let schedulerTeams = [...teams];
  // If odd number of teams, add a dummy team for calculation (bye)
  if (schedulerTeams.length % 2 !== 0) {
    schedulerTeams.push({ id: 'dummy', name: 'dummy' });
  }

  const numTeams = schedulerTeams.length;
  const numRounds = numTeams - 1;
  const halfSize = numTeams / 2;
  const rounds: Round[] = [];

  // Generate first turn (Circle Method / Berger Table)
  for (let roundIdx = 0; roundIdx < numRounds; roundIdx++) {
    const matches: Match[] = [];

    for (let i = 0; i < halfSize; i++) {
      const teamA = schedulerTeams[i];
      const teamB = schedulerTeams[numTeams - 1 - i];

      // Exclude dummy matches (byes)
      if (teamA.id !== 'dummy' && teamB.id !== 'dummy') {
        // Switch home/away every round for the first pair to balance slightly better, 
        // though standard circle method keeps index 0 fixed.
        // Simple logic: index 0 plays home on even rounds, away on odd.
        if (i === 0 && roundIdx % 2 === 1) {
             matches.push({
                id: crypto.randomUUID(),
                homeTeamId: teamB.id,
                awayTeamId: teamA.id,
                homeScore: null,
                awayScore: null
            });
        } else {
            matches.push({
                id: crypto.randomUUID(),
                homeTeamId: teamA.id,
                awayTeamId: teamB.id,
                homeScore: null,
                awayScore: null
            });
        }
      }
    }

    rounds.push({
      number: roundIdx + 1,
      matches: matches
    });

    // Rotate teams: Keep first team fixed, rotate the rest clockwise
    // [0, 1, 2, 3] -> [0, 3, 1, 2] (Moving last to second position)
    const fixedTeam = schedulerTeams[0];
    const rotatingTeams = schedulerTeams.slice(1);
    const lastTeam = rotatingTeams.pop();
    if (lastTeam) {
        rotatingTeams.unshift(lastTeam);
    }
    schedulerTeams = [fixedTeam, ...rotatingTeams];
  }

  // Generate second turn (return matches) if requested
  if (doubleRound) {
    const returnRounds: Round[] = rounds.map(round => ({
      number: round.number + numRounds,
      matches: round.matches.map(m => ({
        id: crypto.randomUUID(),
        homeTeamId: m.awayTeamId,
        awayTeamId: m.homeTeamId,
        homeScore: null,
        awayScore: null
      }))
    }));
    return [...rounds, ...returnRounds];
  }

  return rounds;
};

export const calculateStandings = (teams: Team[], rounds: Round[]): any[] => {
    // This logic is handled in the component for real-time updates, 
    // but could be extracted here if needed.
    return []; 
};