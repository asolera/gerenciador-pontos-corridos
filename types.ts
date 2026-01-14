export interface Team {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
}

export interface Round {
  number: number;
  matches: Match[];
}

export interface ProjectSettings {
  doubleRound: boolean; // Turno e Returno
  relegationCount: number;
  teams: Team[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  isConfigured: boolean;
  settings: ProjectSettings;
  rounds: Round[];
}

export interface StandingsRow {
  teamId: string;
  teamName: string;
  played: number;
  points: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}