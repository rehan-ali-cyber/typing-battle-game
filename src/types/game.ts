export type Team = "player" | "ai";
export type GameMode = "typing" | "code";
export type MatchPhase = "lobby" | "multiplayer-setup" | "difficulty" | "code-level" | "mode" | "countdown" | "playing" | "results";
export type CharacterState =
  | "idle"
  | "charging"
  | "error"
  | "windup"
  | "release"
  | "hit"
  | "block"
  | "ultimate"
  | "victory"
  | "defeat";

export type TypingDifficulty = "easy" | "medium" | "hard";
export type CodeLevel = 1 | 2 | 3;

export interface FighterStats {
  hp: number;
  maxHp: number;
  energy: number;
  bank: number;
  combo: number;
  longestCombo: number;
  wpm: number;
  accuracy: number;
  fixes: number;
  bugsFound: number;
  biggestHit: number;
  state: CharacterState;
  shield: boolean;
  ultimateReady: boolean;
}

export interface AttackEvent {
  id: number;
  from: Team;
  damage: number;
  critical?: boolean;
  ultimate?: boolean;
  blocked?: boolean;
}

export interface TypingSentence {
  id: string;
  text: string;
}

export interface CodeTestCase {
  call: string;
  expected: unknown;
}

export interface CodeSnippet {
  id: string;
  level: CodeLevel;
  title: string;
  task: string;
  starterCode: string;
  tests: CodeTestCase[];
  hasBug: boolean;
}

export interface CodeTestCaseResult {
  call: string;
  expected: any;
  actual?: any;
  error?: string;
  passed: boolean;
}

export interface CodeRunResult {
  passed: number;
  total: number;
  timedOut?: boolean;
  runtimeError?: boolean;
  cases?: CodeTestCaseResult[];
}

