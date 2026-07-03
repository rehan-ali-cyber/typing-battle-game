import { useCallback, useEffect, useRef, useState } from "react";
import { codeAiProfile, baseCodePoints } from "../lib/ai";
import { applyDamage, codeDamage, createFighter } from "../lib/combat";
import { runPythonSnippet } from "../lib/codeRunner";
import { snippetsForLevel } from "../data/codeSnippets";
import { audioManager } from "../lib/audio";
import type { AttackEvent, CodeLevel, CodeRunResult, CodeSnippet, FighterStats } from "../types/game";


interface CodeBattleState {
  player: FighterStats;
  ai: FighterStats;
  snippet: CodeSnippet;
  code: string;
  attacks: AttackEvent[];
  lastRun?: CodeRunResult;
  message: string;
  winner?: "player" | "ai";
  elapsedMs: number;
}

function pickSnippet(level: CodeLevel, previousId?: string) {
  const snippets = snippetsForLevel(level).filter((snippet) => snippet.id !== previousId);
  return snippets[Math.floor(Math.random() * snippets.length)];
}

export function useCodeBattle(active: boolean, rating: number, isMultiplayer = false) {
  const level: CodeLevel = rating < 35 ? 1 : rating < 70 ? 2 : 3;
  const [state, setState] = useState<CodeBattleState>(() => {
    const snippet = pickSnippet(level);
    return {
      player: createFighter(),
      ai: createFighter(),
      snippet,
      code: snippet.starterCode,
      attacks: [],
      message: "Refill Required",
      elapsedMs: 0
    };
  });
  const startedAt = useRef(Date.now());
  const snippetStartedAt = useRef(Date.now());
  const attackId = useRef(1);
  const aiTimer = useRef<number | undefined>(undefined);

  const reset = useCallback(() => {
    const snippet = pickSnippet(level);
    startedAt.current = Date.now();
    snippetStartedAt.current = Date.now();
    setState({
      player: createFighter(),
      ai: createFighter(),
      snippet,
      code: snippet.starterCode,
      attacks: [],
      winner: undefined,
      message: "Refill Required",
      elapsedMs: 0
    });
  }, [level]);

  const nextSnippet = useCallback((previousId: string) => {
    const snippet = pickSnippet(level, previousId);
    snippetStartedAt.current = Date.now();
    setState((current) => ({ ...current, snippet, code: snippet.starterCode, lastRun: undefined }));
  }, [level]);

  const pushAttack = useCallback((from: "player" | "ai", damage: number, critical = false) => {
    const id = attackId.current++;
    
    // Play attack sound immediately
    if (from === "player") {
      audioManager.playSlash();
    } else {
      audioManager.playCast();
    }

    let isBlocked = false;
    let newWinner: "player" | "ai" | undefined = undefined;

    setState((current) => {
      const defender = from === "player" ? current.ai : current.player;
      isBlocked = defender.shield && Math.random() < 0.5;
      const nextPlayer: FighterStats =
        from === "ai"
          ? applyDamage(current.player, damage, isBlocked)
          : { ...current.player, bank: 0, state: "release", biggestHit: Math.max(current.player.biggestHit, damage) };
      const nextAi: FighterStats =
        from === "player"
          ? applyDamage(current.ai, damage, isBlocked)
          : { ...current.ai, bank: 0, state: "release", biggestHit: Math.max(current.ai.biggestHit, damage) };
      const winner = nextAi.hp <= 0 ? "player" : nextPlayer.hp <= 0 ? "ai" : current.winner;
      newWinner = winner;
      return {
        ...current,
        player: winner === "player" ? { ...nextPlayer, state: "victory" } : winner === "ai" ? { ...nextPlayer, state: "defeat" } : nextPlayer,
        ai: winner === "ai" ? { ...nextAi, state: "victory" } : winner === "player" ? { ...nextAi, state: "defeat" } : nextAi,
        attacks: [...current.attacks.slice(-5), { id, from, damage, critical, blocked: isBlocked }],
        message: from === "player" ? "Refill Required" : current.message,
        winner
      };
    });

    // Play hit/block sound after projectile travel
    window.setTimeout(() => {
      if (isBlocked) {
        audioManager.playBlock();
      } else {
        audioManager.playHit();
      }
      
      // If winner, play victory/defeat
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
              player: { ...current.player, state: current.player.bank > 0 ? "charging" : "idle" },
              ai: { ...current.ai, state: current.ai.bank > 0 ? "charging" : "idle" }
            }
      );
    }, 380);
  }, []);

  const submit = useCallback(async () => {
    if (!active || state.winner) return;
    setState((current) => ({ ...current, message: "Running..." }));
    const result = await runPythonSnippet(state.snippet, state.code);
    const accuracy = result.total === 0 ? 0 : result.passed / result.total;
    const elapsed = Date.now() - snippetStartedAt.current;
    const budget = level === 1 ? 24000 : level === 2 ? 32000 : 44000;
    const speedMultiplier = Math.max(0.65, 1.25 - elapsed / budget);
    const points = Math.round(baseCodePoints(level) * accuracy * speedMultiplier);
    const bugFound = state.snippet.hasBug && result.passed === result.total ? 1 : 0;
    
    // Play sound depending on run result
    if (result.passed === result.total) {
      audioManager.playVictory();
    } else {
      audioManager.playError();
    }

    setState((current) => ({
      ...current,
      lastRun: result,
      message: result.timedOut ? "That took too long - check for infinite loops" : result.passed === result.total ? "Bug Squashed! You can now Strike or load Next Challenge." : `${result.passed} of ${result.total} cases passed`,
      player: {
        ...current.player,
        bank: current.player.bank + points,
        energy: Math.min(100, current.player.bank + points),
        accuracy: Math.round(accuracy * 100),
        fixes: current.player.fixes + (result.passed === result.total ? 1 : 0),
        bugsFound: current.player.bugsFound + bugFound,
        state: points > 0 ? "charging" : "error"
      }
    }));
  }, [active, level, nextSnippet, state.code, state.snippet, state.winner]);

  const attack = useCallback(() => {
    if (state.player.bank <= 0 || state.winner) {
      setState((current) => ({ ...current, message: "Refill Required" }));
      return;
    }
    const { damage, critical } = codeDamage(state.player.bank);
    setState((current) => ({ ...current, player: { ...current.player, state: "windup" } }));
    window.setTimeout(() => pushAttack("player", damage, critical), 180);
  }, [pushAttack, state.player.bank, state.winner]);


  useEffect(() => {
    if (!active || isMultiplayer) return;
    const schedule = () => {
      const profile = codeAiProfile(rating);
      aiTimer.current = window.setTimeout(() => {
        setState((current) => {
          if (current.winner) return current;
          const gained = Math.round(profile.points * profile.accuracy);
          const bank = current.ai.bank + gained;
          if (bank > 80 + level * 25 || Math.random() < 0.35) {
            const { damage, critical } = codeDamage(bank);
            window.setTimeout(() => pushAttack("ai", damage, critical), 0);
            return {
              ...current,
              ai: { ...current.ai, bank, energy: Math.min(100, bank), accuracy: Math.round(profile.accuracy * 100), fixes: current.ai.fixes + 1, bugsFound: current.ai.bugsFound + 1, state: "windup" },
              player: { ...current.player, shield: Math.random() < 0.16 },
              elapsedMs: Date.now() - startedAt.current
            };
          }
          return {
            ...current,
            ai: { ...current.ai, bank, energy: Math.min(100, bank), accuracy: Math.round(profile.accuracy * 100), fixes: current.ai.fixes + 1, state: "charging" },
            elapsedMs: Date.now() - startedAt.current
          };
        });
        schedule();
      }, profile.solveMs);
    };
    schedule();
    const clock = window.setInterval(() => setState((current) => ({ ...current, elapsedMs: Date.now() - startedAt.current })), 1000);
    return () => {
      if (aiTimer.current) window.clearTimeout(aiTimer.current);
      window.clearInterval(clock);
    };
  }, [active, level, rating, pushAttack]);

  return {
    state,
    reset,
    setCode: (code: string) => setState((current) => ({ ...current, code })),
    submit,
    attack,
    nextSnippet: () => nextSnippet(state.snippet.id),
    pushAttack
  };
}
