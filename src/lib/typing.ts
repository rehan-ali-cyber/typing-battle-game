import { typingSentences } from "../data/sentences";
import type { TypingSentence } from "../types/game";

export function pickSentence(previousId?: string): TypingSentence {
  const options = typingSentences.filter((sentence) => sentence.id !== previousId);
  return options[Math.floor(Math.random() * options.length)];
}

export function calculateAccuracy(correct: number, total: number) {
  if (total === 0) return 100;
  return Math.max(0, Math.round((correct / total) * 100));
}

export function calculateWpm(correctChars: number, elapsedMs: number) {
  if (elapsedMs <= 0) return 0;
  return Math.round(correctChars / 5 / (elapsedMs / 60000));
}

export function energyForCharacter(ch: string, combo: number, penalty: number) {
  const hardWordBonus = /[A-Z0-9;:,-]/.test(ch) ? 0.7 : 0;
  const lengthBonus = combo > 0 && combo % 12 === 0 ? 1.4 : 0;
  return Math.max(0.4, 4 + hardWordBonus + lengthBonus - penalty);
}
