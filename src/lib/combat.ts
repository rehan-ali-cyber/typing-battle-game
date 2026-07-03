import type { FighterStats, Team } from "../types/game";

export const MAX_HP = 100;

export function createFighter(): FighterStats {
  return {
    hp: MAX_HP,
    maxHp: MAX_HP,
    energy: 0,
    bank: 0,
    combo: 0,
    longestCombo: 0,
    wpm: 0,
    accuracy: 100,
    fixes: 0,
    bugsFound: 0,
    biggestHit: 0,
    state: "idle",
    shield: false,
    ultimateReady: false
  };
}

export function typingDamage(accuracy: number, combo: number, ultimate = false) {
  const base = ultimate ? 28 : 12;
  const accuracyMultiplier = Math.max(0.45, accuracy / 100);
  const comboBonus = Math.min(0.75, combo * 0.018);
  const critChance = Math.min(0.35, combo * 0.012);
  const critical = Math.random() < critChance || ultimate;
  const critMultiplier = critical ? (ultimate ? 1.85 : 1.45) : 1;
  return {
    damage: Math.round(base * accuracyMultiplier * (1 + comboBonus) * critMultiplier),
    critical
  };
}

export function codeDamage(bank: number) {
  const damage = Math.max(5, Math.round(7 + bank * 0.16 + Math.sqrt(bank) * 2.4));
  return {
    damage,
    critical: bank >= 130
  };
}

export function applyDamage(target: FighterStats, amount: number, blocked = false): FighterStats {
  const actual = blocked ? Math.ceil(amount * 0.45) : amount;
  return {
    ...target,
    hp: Math.max(0, target.hp - actual),
    state: blocked ? "block" : "hit"
  };
}

export function attackDirection(from: Team) {
  return from === "player" ? 1 : -1;
}
