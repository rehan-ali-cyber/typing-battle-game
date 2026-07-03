import { useCallback, useEffect, useRef, useState } from "react";
import { typingAiTick } from "../lib/ai";
import { applyDamage, createFighter, typingDamage } from "../lib/combat";
import { calculateAccuracy, calculateWpm, energyForCharacter, pickSentence } from "../lib/typing";
import { audioManager } from "../lib/audio";
import type { AttackEvent, FighterStats, TypingDifficulty, TypingSentence } from "../types/game";


interface TypingBattleState {
  player: FighterStats;
  ai: FighterStats;
  sentence: TypingSentence;
  typed: string;
  errorPositions: number[];
  attacks: AttackEvent[];
  winner?: "player" | "ai";
  elapsedMs: number;
}

export function useTypingBattle(active: boolean, rating: number, isMultiplayer = false) {
  const [state, setState] = useState<TypingBattleState>(() => ({
    player: createFighter(),
    ai: createFighter(),
    sentence: pickSentence(),
    typed: "",
    errorPositions: [],
    attacks: [],
    elapsedMs: 0
  }));
  const startedAt = useRef<number>(Date.now());
  const typedTotals = useRef({ total: 0, correct: 0 });
  const attackId = useRef(1);
  const penaltyRef = useRef(0);

  const reset = useCallback(() => {
    startedAt.current = Date.now();
    typedTotals.current = { total: 0, correct: 0 };
    penaltyRef.current = 0;
    setState({
      player: createFighter(),
      ai: createFighter(),
      sentence: pickSentence(),
      typed: "",
      errorPositions: [],
      attacks: [],
      elapsedMs: 0
    });
  }, []);

  const pushAttack = useCallback((from: "player" | "ai", damage: number, critical = false, ultimate = false) => {
    const id = attackId.current++;
    
    // Play attack sound immediately
    if (from === "player") {
      if (ultimate) audioManager.playCast();
      else audioManager.playSlash();
    } else {
      audioManager.playCast(); // AI staff cast
    }

    let isBlocked = false;
    let newWinner: "player" | "ai" | undefined = undefined;

    setState((current) => {
      const defender = from === "player" ? current.ai : current.player;
      isBlocked = defender.shield && Math.random() < 0.55;
      const nextPlayer: FighterStats =
        from === "ai"
          ? applyDamage(current.player, damage, isBlocked)
          : { ...current.player, state: ultimate ? "ultimate" : "release", biggestHit: Math.max(current.player.biggestHit, damage) };
      const nextAi: FighterStats =
        from === "player"
          ? applyDamage(current.ai, damage, isBlocked)
          : { ...current.ai, state: "release", biggestHit: Math.max(current.ai.biggestHit, damage) };
      const winner = nextAi.hp <= 0 ? "player" : nextPlayer.hp <= 0 ? "ai" : current.winner;
      newWinner = winner;
      return {
        ...current,
        player: winner === "player" ? { ...nextPlayer, state: "victory" } : winner === "ai" ? { ...nextPlayer, state: "defeat" } : nextPlayer,
        ai: winner === "ai" ? { ...nextAi, state: "victory" } : winner === "player" ? { ...nextAi, state: "defeat" } : nextAi,
        attacks: [...current.attacks.slice(-5), { id, from, damage, critical, ultimate, blocked: isBlocked }],
        winner
      };
    });

    // Play hit/block sound after projectile travel time (approx 280ms)
    window.setTimeout(() => {
      if (isBlocked) {
        audioManager.playBlock();
      } else {
        audioManager.playHit();
      }
      
      // If a winner was declared, play victory/defeat sound
      if (newWinner) {
        if (newWinner === "player") {
          audioManager.playVictory();
        } else {
          audioManager.playDefeat();
        }
      }
    }, 280);

    window.setTimeout(() => {
      setState((current) =>
        current.winner
          ? current
          : {
              ...current,
              player: { ...current.player, state: current.player.energy > 74 ? "charging" : "idle" },
              ai: { ...current.ai, state: current.ai.energy > 74 ? "charging" : "idle" }
            }
      );
    }, ultimate ? 850 : 360);
  }, []);


  const handleInput = useCallback(
    (value: string) => {
      if (!active || state.winner) return;
      if (value.length < state.typed.length) {
        setState((current) => ({ ...current, typed: value.slice(0, current.sentence.text.length) }));
        return;
      }
      const nextChar = value[value.length - 1];
      const index = value.length - 1;
      const expected = state.sentence.text[index];
      if (expected === undefined) return;

      const correct = nextChar === expected;
      if (correct) {
        audioManager.playKey();
      } else {
        audioManager.playError();
      }
      typedTotals.current.total += 1;
      if (correct) typedTotals.current.correct += 1;
      const elapsed = Date.now() - startedAt.current;
      const accuracy = calculateAccuracy(typedTotals.current.correct, typedTotals.current.total);
      const wpm = calculateWpm(typedTotals.current.correct, elapsed);


      setState((current) => {
        const nextCombo = correct ? current.player.combo + 1 : 0;
        const energyGain = correct ? energyForCharacter(nextChar, nextCombo, penaltyRef.current) : 0;
        penaltyRef.current = correct ? Math.max(0, penaltyRef.current - 0.55) : 2.3;
        const nextEnergy = Math.min(100, current.player.energy + energyGain);
        const completed = value.length >= current.sentence.text.length;
        const perfect = completed && correct && current.errorPositions.length === 0;
        const nextErrors = correct ? current.errorPositions : [...current.errorPositions, index];
        return {
          ...current,
          typed: completed ? "" : value,
          errorPositions: completed ? [] : nextErrors,
          sentence: completed ? pickSentence(current.sentence.id) : current.sentence,
          player: {
            ...current.player,
            combo: nextCombo,
            longestCombo: Math.max(current.player.longestCombo, nextCombo),
            energy: perfect ? 0 : nextEnergy,
            wpm,
            accuracy,
            ultimateReady: current.player.ultimateReady || perfect,
            state: correct ? (nextEnergy > 74 ? "charging" : "idle") : "error"
          }
        };
      });

      window.setTimeout(() => {
        setState((current) => {
          if (current.winner) return current;
          if (current.player.energy >= 100) {
            const { damage, critical } = typingDamage(current.player.accuracy, current.player.combo);
            window.setTimeout(() => pushAttack("player", damage, critical), 0);
            return { ...current, player: { ...current.player, energy: 0, state: "windup" }, typed: "", errorPositions: [], sentence: pickSentence(current.sentence.id) };
          }
          if (current.player.ultimateReady && value.length >= state.sentence.text.length && current.errorPositions.length === 0) {
            const { damage } = typingDamage(current.player.accuracy, current.player.combo, true);
            window.setTimeout(() => pushAttack("player", damage, true, true), 0);
            return { ...current, player: { ...current.player, ultimateReady: false, state: "ultimate" } };
          }
          return current;
        });
      }, 0);
    },
    [active, pushAttack, state.errorPositions.length, state.sentence.text, state.typed.length, state.winner]
  );

  useEffect(() => {
    if (!active || isMultiplayer) return;
    const interval = window.setInterval(() => {
      setState((current) => {
        if (current.winner) return current;
        const tick = typingAiTick(rating, 250);
        const energy = Math.min(100, current.ai.energy + tick.energyGain);
        if (energy >= 100) {
          const combo = current.ai.combo + Math.floor(4 + Math.random() * 8);
          const { damage, critical } = typingDamage(tick.accuracy, combo);
          window.setTimeout(() => pushAttack("ai", damage, critical), 0);
          return {
            ...current,
            elapsedMs: Date.now() - startedAt.current,
            ai: { ...current.ai, energy: 0, combo, longestCombo: Math.max(current.ai.longestCombo, combo), wpm: tick.wpm, accuracy: tick.accuracy, state: "windup" },
            player: { ...current.player, shield: Math.random() < 0.12 }
          };
        }
        return {
          ...current,
          elapsedMs: Date.now() - startedAt.current,
          ai: { ...current.ai, energy, wpm: tick.wpm, accuracy: tick.accuracy, state: energy > 74 ? "charging" : "idle" },
        };
      });
    }, 250);
    return () => window.clearInterval(interval);
  }, [active, rating, pushAttack]);

  const triggerUltimate = useCallback(() => {
    if (!state.player.ultimateReady || state.winner) return;
    const { damage } = typingDamage(state.player.accuracy, state.player.combo, true);
    pushAttack("player", damage, true, true);
    setState((current) => ({
      ...current,
      player: { ...current.player, ultimateReady: false, state: "ultimate" }
    }));
  }, [pushAttack, state.player.ultimateReady, state.player.accuracy, state.player.combo, state.winner]);

  return { state, reset, handleInput, pushAttack, triggerUltimate };
}
