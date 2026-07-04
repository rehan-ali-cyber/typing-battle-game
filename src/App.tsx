import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useCodeBattle } from "./hooks/useCodeBattle";
import { useTypingBattle } from "./hooks/useTypingBattle";
import { attackDirection } from "./lib/combat";
import { audioManager } from "./lib/audio";
import type { AttackEvent, CharacterState, CodeLevel, FighterStats, GameMode, MatchPhase, Team, TypingDifficulty, CodeRunResult } from "./types/game";
import { fetchOnlineQuotes, fetchOnlineJokes } from "./data/sentences";
import { fetchOnlineSnippets } from "./data/codeSnippets";
import { api } from "./lib/api";
import { SignIn, SignUp, UserProfile, useUser, useClerk } from "@clerk/clerk-react";


const modeLabels: Record<GameMode, string> = {
  typing: "Typing Combat",
  code: "Code Combat"
};

const difficultyCards: Array<{
  id: TypingDifficulty;
  title: string;
  badge: string;
  mark: string;
  color: string;
  wpm: string;
  accuracy: string;
  note: string;
}> = [
  { id: "easy", title: "Training Dummy", badge: "Easy", mark: "turtle", color: "#12a85d", wpm: "15-22", accuracy: "80%", note: "slow wand, forgiving aim" },
  { id: "medium", title: "Seasoned Warrior", badge: "Medium", mark: "swords", color: "#df7f12", wpm: "40-50", accuracy: "91%", note: "steady pressure, real duel" },
  { id: "hard", title: "Grand Champion", badge: "Hard", mark: "flame", color: "#e4342f", wpm: "85-100+", accuracy: "98%", note: "ultra fast spellwork, sharp timing" }
];

function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function DoodleIcon({ type }: { type: "sword" | "shield" | "bolt" | "star" | "keyboard" | "python" | "flame" | "turtle" | "pencil" | "play" | "swords" }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      {type === "sword" && <path d="M12 52l10-2 28-34 6-6-3 10-34 28zM18 44l8 8M9 56l10-10" />}
      {type === "swords" && <path d="M15 52l9-3 27-34 6-6-3 10-33 27zM49 52l-9-3-27-34-6-6 3 10 33 27zM20 43l8 8M44 43l-8 8" />}
      {type === "shield" && <path d="M32 7l21 8c-1 20-7 34-21 42C18 49 12 35 11 15zM32 14v35" />}
      {type === "bolt" && <path d="M37 5L16 35h15l-6 24 23-34H33z" />}
      {type === "star" && <path d="M32 6l7 17 18 2-14 12 5 18-16-10-16 10 5-18L7 25l18-2z" />}
      {type === "keyboard" && <path d="M10 22h44v26H10zM16 29h4M25 29h4M34 29h4M43 29h4M16 38h4M25 38h14M44 38h4" />}
      {type === "python" && <path d="M29 12h13c5 0 8 3 8 8v8H28c-6 0-10 4-10 10v3H9V30c0-6 5-11 11-11h9zM35 52H22c-5 0-8-3-8-8v-8h22c6 0 10-4 10-10v-3h9v11c0 6-5 11-11 11h-9zM39 19h1M24 45h1" />}
      {type === "flame" && <path d="M33 56c-12-3-20-12-17-24 2-8 10-12 9-24 9 6 10 14 8 20 6-4 8-9 8-15 10 9 13 20 6 31-3 6-8 10-14 12z" />}
      {type === "turtle" && <path d="M17 40c1-11 8-18 19-18 10 0 17 7 18 18H17zM12 38h7M53 38h5M25 40l-4 8M45 40l5 8M31 22c-2-8 8-10 11-3M32 31h4M41 31h4" />}
      {type === "pencil" && <path d="M12 49l5-15L44 7l13 13-27 27zM43 8l13 13M17 34l13 13M12 49l12-4" />}
      {type === "play" && <path d="M22 14l28 18-28 18z" />}
    </svg>
  );
}

function PaperDoodles() {
  return (
    <svg className="paper-doodles" viewBox="0 0 1400 900" preserveAspectRatio="none" aria-hidden="true">
      <path className="margin-line" d="M64 0v900" />
      <g className="soft-doodle">
        <path d="M112 144c25-34 83-20 84 21 38-11 77 27 41 50-69 9-138 3-189-6-18-35 28-62 64-65z" />
        <path d="M978 124c22-31 70-19 70 17 32-10 66 22 36 43-58 8-116 3-159-5-15-30 24-53 53-55z" />
        <path d="M36 842l110-105 83 87 78-102 85 90M1145 820l96-92 61 91 55-48 31 42" />
        <path d="M620 70l-22 42M606 86l29-4M704 116l9 15M717 112l-17 19M210 392l8 14M223 390l-17 17" />
      </g>
    </svg>
  );
}

function ProgressBar({ value, max = 100, color, label, compact = false }: { value: number; max?: number; color: string; label: string; compact?: boolean }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  const [trail, setTrail] = useState(percent);

  useEffect(() => {
    if (percent < trail) {
      const timeout = window.setTimeout(() => setTrail(percent), 450);
      return () => window.clearTimeout(timeout);
    } else {
      setTrail(percent);
    }
  }, [percent, trail]);

  return (
    <div className={`bar-row ${compact ? "compact" : ""}`}>
      <span>{label}</span>
      <div className="doodle-bar">
        <div className="bar-trail" style={{ width: `${trail}%`, background: "#ff0844" }} />
        <div className="bar-main" style={{ width: `${percent}%`, background: color }} />
      </div>
      <b>{label === "HP" ? `${Math.ceil(value)}/${max}` : `${Math.round(percent)}%`}</b>
    </div>
  );
}

function Avatar({ team }: { team: Team }) {
  return (
    <div className={`avatar ${team}`}>
      <svg viewBox="0 0 76 76" aria-hidden="true">
        <circle cx="38" cy="34" r="18" />
        <path d="M16 34c4-20 30-28 45-10M21 24c13 8 17-16 32 3M25 20c10 5 16 4 28 9M29 35l7-4M48 31l7 4M33 45c5 3 11 3 16 0" />
        <path d="M38 52v16M25 70c8-9 20-10 29 0M13 59c11-6 17-8 25-7M63 59c-10-6-17-8-25-7" />
      </svg>
    </div>
  );
}

function StatCards({ mode, fighter, side }: { mode: GameMode; fighter: FighterStats; side: Team }) {
  const primary = mode === "typing" ? ["WPM", fighter.wpm] : ["FIXES", fighter.fixes];
  const secondary = mode === "typing" ? ["ACC", `${fighter.accuracy}%`] : ["BUGS", fighter.bugsFound];
  const tertiary = mode === "typing" ? ["BEST", fighter.longestCombo] : ["BANK", fighter.bank];
  return (
    <div className={`stat-cards ${side}`}>
      {[primary, secondary, tertiary].map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <b>{value}</b>
        </div>
      ))}
    </div>
  );
}

function TopHud({
  mode,
  player,
  ai,
  round,
  elapsedMs,
  rating,
  playerName = "Player 1",
  opponentNameOverride
}: {
  mode: GameMode;
  player: FighterStats;
  ai: FighterStats;
  round: number;
  elapsedMs: number;
  rating: number;
  playerName?: string;
  opponentNameOverride?: string;
}) {
  const opponentName = opponentNameOverride || getRatingRank(rating).title;
  return (
    <header className="top-hud">
      <section className="fighter-hud">
        <Avatar team="player" />
        <div className="hud-copy">
          <h2>{playerName}</h2>
          <ProgressBar value={player.hp} max={player.maxHp} color="#5fc35f" label="HP" />
          <ProgressBar value={mode === "typing" ? player.energy : Math.min(100, player.bank)} color="#276ef1" label={mode === "typing" ? "Energy" : "Bank"} />
          <StatCards mode={mode} fighter={player} side="player" />
        </div>
      </section>
      <section className="round-card">
        <span>{mode === "typing" ? "Typing Combat" : "Code Combat"}</span>
        <b>{formatClock(elapsedMs)}</b>
        <em>ROUND {round}</em>
      </section>
      <section className="fighter-hud enemy-side">
        <div className="hud-copy">
          <h2>{opponentName}</h2>
          <ProgressBar value={ai.hp} max={ai.maxHp} color="#5fc35f" label="HP" />
          <ProgressBar value={mode === "typing" ? ai.energy : Math.min(100, ai.bank)} color="#e63d35" label={mode === "typing" ? "Energy" : "Bank"} />
          <StatCards mode={mode} fighter={ai} side="ai" />
        </div>
        <Avatar team="ai" />
      </section>
    </header>
  );
}

function DoodleCharacter({ 
  team, 
  state, 
  power,
  isWinner,
  isLoser
}: { 
  team: Team; 
  state: CharacterState; 
  power: number;
  isWinner?: boolean;
  isLoser?: boolean;
}) {
  const color = team === "player" ? "#276ef1" : "#e63d35";
  const flip = team === "ai" ? "scale(-1,1)" : "";
  const face = attackDirection(team);
  
  const bubbleText = useMemo(() => {
    if (isWinner) return team === "player" ? "FINAL SLICE!!! ⚔️" : "COMPILING DESTRUCTION!!! 🌀";
    if (isLoser) return "🥶 F-F-FREEZING...!!!";
    switch (state) {
      case "charging": return team === "player" ? "Powering up! ⚡" : "Chanting loops... 🌀";
      case "error": return team === "player" ? "Ah, typo! ✍️" : "Oops, a bug! 🐛";
      case "windup": return "Here it comes! ⚔️";
      case "release": return "Take that! 💥";
      case "ultimate": return "ULTIMATE BURST! ⭐";
      case "hit": return "Ouch! 🤕";
      case "block": return "Deflected! 🛡️";
      case "victory": return "Easy win! 🎉";
      case "defeat": return "Noooo... 😭";
      default: return "";
    }
  }, [state, team, isWinner, isLoser]);

  const svgContent = (
    <svg viewBox="0 0 260 250" aria-hidden="true">
      <g transform={flip ? `translate(260 0) ${flip}` : undefined}>
        <ellipse className="shadow-sketch" cx="107" cy="226" rx="68" ry="11" />
        <path className="motion-scribble" d="M40 62c26-27 69-37 112-14M33 74c37-26 72-30 116-20M55 42c34-18 65-20 95-6" />
        <path className="cape" d="M133 95c28 11 59 28 78 58-35 3-67-7-91-29" />
        <circle className="head" cx="103" cy="70" r="35" />
        <path className="hair" d="M67 62c17-35 57-41 76-12M71 47c10 7 17-18 29 2M90 34c12 8 17 1 30 12M113 35c12 4 18 10 25 28M74 70c27-9 44-10 69 1" />
        <path className="face" d="M86 73l12-7M119 66l13 7M96 90c10 5 21 5 31-1" />
        <path className="torso" d="M102 107l-22 70M108 107l41 67M90 137l-57 38M126 136l57 38M80 176l-31 38M149 174l34 38" />
        <path className="shirt-hatch" d="M94 117l24 8M90 130l35 12M86 144l41 15" />
        {team === "player" ? (
          <g className="weapon sword">
            <path d="M131 137l93-36-40 57z" />
            <path d="M35 175l100-39M26 170l20 13M126 132l13 15" />
          </g>
        ) : (
          <g className="weapon staff">
            <path d="M151 89l51 119M137 81l25-12 15 20-11 23-24-4z" />
            <circle cx="153" cy="88" r="16" />
            <path d="M153 56v14M130 89h-16M174 89h18M139 68l-10-10M169 69l11-12" />
          </g>
        )}
        <path className="team-glow" d="M51 218c28-17 91-19 128 0" />
      </g>
    </svg>
  );

  const characterClasses = [
    "doodle-character",
    team,
    isWinner ? "final-winner" : "",
    isLoser ? "final-loser" : "",
    !isWinner && !isLoser ? `state-${state}` : ""
  ].filter(Boolean).join(" ");

  if (isLoser) {
    return (
      <div className={characterClasses} style={{ "--team-color": color, "--power": power, "--face": face } as CSSProperties}>
        {bubbleText && (
          <div className="doodle-speech-bubble">
            {bubbleText}
          </div>
        )}
        <div className="loser-split-wrapper">
          <div className="loser-part part-1">{svgContent}</div>
          <div className="loser-part part-2">{svgContent}</div>
          <div className="loser-part part-3">{svgContent}</div>
          <div className="loser-part part-4">{svgContent}</div>
          <div className="loser-part part-5">{svgContent}</div>
          <div className="neon-slice-line slice-1" />
          <div className="neon-slice-line slice-2" />
          <div className="neon-slice-line slice-3" />
          <div className="neon-slice-line slice-4" />
        </div>
      </div>
    );
  }

  return (
    <div className={characterClasses} style={{ "--team-color": color, "--power": power, "--face": face } as CSSProperties}>
      {bubbleText && (
        <div className="doodle-speech-bubble">
          {bubbleText}
        </div>
      )}
      {svgContent}
    </div>
  );
}

function BackgroundDoodles() {
  return (
    <svg className="background-doodles" viewBox="0 0 1400 430" preserveAspectRatio="none" aria-hidden="true">
      <g className="far-lines">
        <path d="M0 332c181-7 360 7 530-3 220-13 499 12 870 0" />
        <path d="M26 300l110-126 116 102 88-92 136 112 117-155 152 169 126-129 136 113 119-75 132 82 146-91" />
        <path d="M108 309l82-70 67 63M770 311l86-92 102 89M1124 309l89-72 118 72" />
      </g>
      <g className="castle">
        <path d="M638 315V190h130v125M658 190v-59h37v59M715 190v-78h42v78M628 132l46-49 47 49M699 111l39-52 47 52M664 238h27M724 238h25M696 315v-57c0-26 32-26 32 0v57" />
        <path d="M704 59v-47M706 15c31-2 30-19 62-9-18 10-25 22-62 21" />
        <path d="M650 168h30M700 168h30M748 168h30" />
      </g>
      <g className="trees">
        <path d="M78 306c-38-14-31-54 6-50 8-41 65-37 69 5 33-6 51 31 22 51-35 5-67 3-97-6zM119 309v50M1172 308c-34-13-26-49 8-45 9-35 58-32 61 4 30-5 46 28 19 45-31 5-60 3-88-4zM1211 309v50" />
      </g>
      <g className="clouds">
        <path d="M186 90c23-31 69-19 69 17 32-12 67 21 38 42-61 8-123 2-167-5-16-31 25-53 60-54zM1028 70c27-38 83-22 82 20 37-14 78 24 42 49-72 10-145 2-198-7-19-38 33-63 74-62z" />
      </g>
      <g className="ground-hatch">
        <path d="M0 365h1400M0 382h1400M40 380l-32 24M104 380l-33 25M168 380l-33 25M232 380l-33 25M296 380l-33 25M360 380l-33 25M424 380l-33 25M488 380l-33 25M552 380l-33 25M616 380l-33 25M680 380l-33 25M744 380l-33 25M808 380l-33 25M872 380l-33 25M936 380l-33 25M1000 380l-33 25M1064 380l-33 25M1128 380l-33 25M1192 380l-33 25M1256 380l-33 25M1320 380l-33 25M1384 380l-33 25" />
      </g>
    </svg>
  );
}

function AmbientParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + "%",
      top: Math.random() * 100 + "%",
      delay: (Math.random() * 5).toFixed(2) + "s",
      duration: (10 + Math.random() * 20).toFixed(2) + "s",
      opacity: Math.random() * 0.5 + 0.2,
      scale: Math.random() * 0.8 + 0.2
    }));
  }, []);

  return (
    <div className="ambient-particles">
      {particles.map(p => (
        <div 
          key={p.id} 
          className="particle" 
          style={{ 
            left: p.left, 
            top: p.top, 
            animationDelay: p.delay, 
            animationDuration: p.duration,
            '--opacity': p.opacity,
            '--scale': p.scale
          } as CSSProperties} 
        />
      ))}
    </div>
  );
}

function ImpactLayer({ attacks }: { attacks: AttackEvent[] }) {
  return (
    <div className="impact-layer">
      {attacks.map((attack) => {
        const hitX = attack.from === "player" ? "61%" : "39%";
        const travelClass = attack.from === "player" ? "from-player" : "from-ai";
        const color = attack.from === "player" ? "#276ef1" : "#e63d35";
        return (
          <div key={attack.id} className={`attack-event ${travelClass} ${attack.critical ? "critical" : ""} ${attack.ultimate ? "ultimate" : ""}`} style={{ "--impact-color": color, "--hit-x": hitX } as CSSProperties}>
            <div className="projectile">
              <span />
              <i />
            </div>
            <div className="impact">
              <svg viewBox="0 0 180 120" aria-hidden="true">
                <path d="M8 62l42-12 4-39 28 32 31-26-7 42 63 4-59 19 16 31-42-24-31 24 8-38z" />
                <path d="M28 22l19 17M136 18l-18 25M151 92l-28-7M38 102l24-22" />
              </svg>
              <b>{attack.blocked ? "DEFLECT" : `${attack.critical ? "CRIT " : ""}-${attack.damage}`}</b>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Battlefield({ player, ai, attacks, mode, winner }: { player: FighterStats; ai: FighterStats; attacks: AttackEvent[]; mode: GameMode; winner?: "player" | "ai" }) {
  return (
    <main className={`battlefield mode-${mode} ${winner ? `has-winner winner-${winner}` : ""}`}>
      <div className={`cinematic-overlay ${player.state === "ultimate" || ai.state === "ultimate" ? "active" : ""}`} />
      <div className="neon-grid-floor" />
      <AmbientParticles />
      <BackgroundDoodles />
      <div className="arena-label">
        <DoodleIcon type={mode === "typing" ? "keyboard" : "python"} />
        <span>{mode === "typing" ? "speed duel" : "bug hunt"}</span>
      </div>
      <DoodleCharacter 
        team="player" 
        state={player.state} 
        power={mode === "typing" ? player.energy : Math.min(100, player.bank)} 
        isWinner={winner === "player"}
        isLoser={winner === "ai"}
      />
      <DoodleCharacter 
        team="ai" 
        state={ai.state} 
        power={mode === "typing" ? ai.energy : Math.min(100, ai.bank)} 
        isWinner={winner === "ai"}
        isLoser={winner === "player"}
      />
      <ImpactLayer attacks={attacks} />
    </main>
  );
}

function ToolButton({
  type,
  active,
  disabled,
  label,
  onClick
}: {
  type: "sword" | "shield" | "bolt" | "star";
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button className={`tool-button tool-btn-${type} ${active ? "active" : ""}`} disabled={disabled} title={label} aria-label={label} onClick={onClick}>
      <DoodleIcon type={type} />
      {active && type === "sword" ? <small>READY</small> : null}
    </button>
  );
}

function TypingPanel({
  sentence,
  typed,
  errorPositions,
  onInput,
  player,
  triggerUltimate
}: {
  sentence: string;
  typed: string;
  errorPositions: number[];
  onInput: (value: string) => void;
  player: FighterStats;
  triggerUltimate?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) {
        return;
      }
      inputRef.current?.focus();
    };

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("textarea") || target.closest("input")) {
        return;
      }
      inputRef.current?.focus();
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    document.addEventListener("click", handleDocumentClick);

    // Initial focus
    inputRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [sentence]);

  return (
    <section className="bottom-panel typing-panel">
      <div className="tool-rail">
        <ToolButton type="sword" active={player.energy >= 100} label="Attack ready" />
        <ToolButton type="shield" active={player.shield} label="Block state" />
      </div>
      <div className="typing-area">
        <div className="target-sentence" onClick={() => inputRef.current?.focus()}>
          {sentence.split("").map((ch, index) => {
            const typedChar = typed[index];
            const wrong = errorPositions.includes(index);
            const current = index === typed.length;
            return (
              <span key={`${ch}-${index}`} className={wrong ? "wrong" : typedChar === ch ? "correct" : current ? "current" : ""}>
                {ch}
              </span>
            );
          })}
          <i />
        </div>
        <input ref={inputRef} value={typed} onChange={(event) => onInput(event.target.value)} spellCheck={false} autoCapitalize="off" />
      </div>
      <div className="tool-rail">
        <ToolButton type="bolt" active={player.energy > 74} label="Special energy" />
        <ToolButton 
          type="star" 
          active={player.ultimateReady} 
          disabled={!player.ultimateReady} 
          label="Ultimate" 
          onClick={triggerUltimate}
        />
      </div>
    </section>
  );
}

function CodePanel({
  code,
  onCode,
  onSubmit,
  onAttack,
  player,
  task,
  title,
  message,
  running,
  level,
  lastRun,
  nextSnippet
}: {
  code: string;
  onCode: (code: string) => void;
  onSubmit: () => void;
  onAttack: () => void;
  player: FighterStats;
  task: string;
  title: string;
  message: string;
  running: boolean;
  level: CodeLevel;
  lastRun?: CodeRunResult;
  nextSnippet: () => void;
}) {
  const lines = code.split("\n");
  const isSolved = lastRun && lastRun.passed === lastRun.total;
  return (
    <section className="bottom-panel code-panel">
      <div className="task-strip">
        <b>Task - Level {level}</b>
        <span>{task}</span>
        <em>{message}</em>
      </div>
      <div className="editor-shell">
        <div className="line-numbers">{lines.map((_, index) => <span key={index}>{index + 1}</span>)}</div>
        <textarea
          value={code}
          onChange={(event) => {
            onCode(event.target.value);
            audioManager.playKey();
          }}
          spellCheck={false}
        />
      </div>
      <div className="code-actions">
        <div className="bank-card">
          <span>Attack Bank</span>
          <b>{player.bank}</b>
          <ProgressBar value={Math.min(100, player.bank)} color="#276ef1" label="Bank" compact />
        </div>
        <button 
          className={`attack-button ${player.bank > 0 ? "strike-ready" : ""}`} 
          onClick={onAttack} 
          disabled={player.bank <= 0}
        >
          <DoodleIcon type="sword" />
          <span>{player.bank > 0 ? "Strike!" : "Refill First"}</span>
        </button>
        {isSolved ? (
          <button className="submit-button next-challenge-button" onClick={nextSnippet}>
            <DoodleIcon type="play" />
            <span>Next Bug ➔</span>
          </button>
        ) : (
          <button className="submit-button" onClick={onSubmit} disabled={running}>
            <DoodleIcon type="play" />
            <span>Run & Submit</span>
          </button>
        )}
      </div>
      {lastRun && lastRun.cases && (
        <div className="test-cases-list">
          {lastRun.cases.map((testCase, idx) => (
            <div key={idx} className={`test-case-item ${testCase.passed ? 'passed' : 'failed'}`}>
              <span className="bullet">{testCase.passed ? "✓" : "✗"}</span>
              <code className="test-call">{testCase.call}</code>
              <span className="expected-got">
                Expected: <code>{JSON.stringify(testCase.expected)}</code>
                {testCase.passed ? "" : <> | Got: <code>{testCase.error ? `Error: ${testCase.error}` : JSON.stringify(testCase.actual)}</code></>}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ComboStrip({ player, ai, mode }: { player: FighterStats; ai: FighterStats; mode: GameMode }) {
  const pKey = mode === "typing" ? player.combo : player.fixes;
  const aKey = mode === "typing" ? ai.combo : ai.bugsFound;
  return (
    <footer className="combo-strip">
      <b key={`p-${pKey}`} className="player-combo pop-effect">{mode === "typing" ? `COMBO x${player.combo}` : `FIXES ${player.fixes}`}</b>
      <span>VS</span>
      <b key={`a-${aKey}`} className="ai-combo pop-effect">{mode === "typing" ? `x${ai.combo} COMBO` : `${ai.bugsFound} BUGS`}</b>
    </footer>
  );
}

function getRatingRank(rating: number) {
  if (rating === 100) return { title: "KING OF BITS 👑", color: "#ffe259", mark: "star" };
  if (rating >= 80) return { title: "Compiler Overlord 🌀", color: "#e4342f", mark: "flame" };
  if (rating >= 60) return { title: "Byte Commander ⚡", color: "#a855f7", mark: "swords" };
  if (rating >= 40) return { title: "Syntax Gladiator ⚔️", color: "#df7f12", mark: "swords" };
  if (rating >= 20) return { title: "Logic Knight 🛡️", color: "#3b82f6", mark: "shield" };
  return { title: "Beginner Cadet 🐢", color: "#12a85d", mark: "turtle" };
}

function RatingScreen({
  rating,
  onStart,
  onBack
}: {
  rating: number;
  onStart: () => void;
  onBack: () => void;
}) {
  const rank = getRatingRank(rating);
  const t = (rating - 1) / 99;
  
  // Dynamic preview calculations
  const wpm = Math.round(9 + t * 116);
  const accuracy = Math.round(45 + t * 55);
  const solveTime = (18 - t * 13.5).toFixed(1);
  const codeLevel = rating < 35 ? 1 : rating < 70 ? 2 : 3;

  return (
    <section className="start-sheet rating-select-sheet">
      <PaperDoodles />
      
      <div className="rating-calibration-layout">
        <div className="calibration-left-col">
          <div className="sheet-header">
            <div className="brand-mark-mini" style={{ color: rank.color, filter: `drop-shadow(0 0 10px ${rank.color}33)` }}>
              <DoodleIcon type={rank.mark as any} />
            </div>
            <div className="header-text">
              <h1>Ladder <span>Calibration</span></h1>
              <p className="screen-subtitle">Your Rating is locked. Defeat opponents to rise on the ladder.</p>
            </div>
          </div>
          
          <div className="rating-control-box">
            <div className="slider-wrapper">
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={rating} 
                disabled
                className="rating-slider"
                style={{ "--slider-color": rank.color, opacity: 0.85 } as CSSProperties}
              />
              <div className="rating-bubble" style={{ left: `calc(${t * 100}% - 22px)`, background: rank.color }}>
                {rating}
              </div>
            </div>
          </div>
          
          <div className="mp-actions">
            <button className="ghost-button" onClick={onBack}>
              <span>Back to Modes</span>
            </button>
            <button 
              className="primary-button choose-button" 
              onClick={onStart} 
              style={{ 
                margin: 0, 
                background: rank.color, 
                borderColor: rank.color, 
                color: "#08090f",
                fontWeight: "900",
                boxShadow: `0 0 20px ${rank.color}aa`,
                textShadow: "none"
              } as CSSProperties}
            >
              <DoodleIcon type="play" />
              <span>Enter Arena ➔</span>
            </button>
          </div>
        </div>
        
        <div className="calibration-right-col">
          <div className="rating-preview-card" style={{ borderColor: rank.color } as CSSProperties}>
            <div className="preview-header">
              <span style={{ background: `${rank.color}22`, color: rank.color }}>My Rank</span>
              <h2 style={{ color: rank.color }}>{rank.title}</h2>
            </div>
            
            <div className="preview-stats-grid">
              <div className="stat-col">
                <strong>Target Speed</strong>
                <span>Speed: <b>{wpm} WPM</b></span>
                <span>Accuracy: <b>{accuracy}%</b></span>
              </div>
              <div className="stat-col line-divide">
                <strong>Bug Combat</strong>
                <span>Solve Speed: <b>{solveTime}s</b></span>
                <span>Complexity: <b>Level {codeLevel}</b></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModeScreen({ 
  onPick, 
  onBack
}: { 
  onPick: (mode: GameMode) => void; 
  onBack: () => void;
}) {
  return (
    <section className="start-sheet mode-select-sheet">
      <PaperDoodles />
      <div className="sheet-header">
        <div className="brand-mark-mini">
          <DoodleIcon type="swords" />
        </div>
        <div className="header-text">
          <h1>Choose Your Weapon</h1>
          <p className="screen-subtitle">Select your duel method in the arena.</p>
        </div>
      </div>
      <div className="mode-card-row">
        <button className="mode-card typing-mode" onClick={() => onPick("typing")}>
          <div className="mode-card-icon-wrap">
            <DoodleIcon type="keyboard" />
          </div>
          <div className="mode-card-content">
            <div className="mode-card-header">
              <h2>Typing Combat</h2>
              <strong>The Classic Duel</strong>
            </div>
            <p>Charge blue ink with clean sentences, combos, and perfect streaks.</p>
            <div className="tag-row">
              <span>Sentence typing</span>
              <span>Combo crits</span>
              <span>Ultimate star</span>
            </div>
          </div>
        </button>
        <button className="mode-card code-mode" onClick={() => onPick("code")}>
          <div className="mode-card-icon-wrap">
            <DoodleIcon type="python" />
          </div>
          <div className="mode-card-content">
            <div className="mode-card-header">
              <h2>Code Combat</h2>
              <strong>Python Bug Hunt</strong>
            </div>
            <p>Repair snippets, fill the attack bank, and cash it out in one huge hit.</p>
            <div className="tag-row">
              <span>Hidden tests</span>
              <span>Bank strategy</span>
              <span>Bug bursts</span>
            </div>
          </div>
        </button>
      </div>
      <button className="ghost-button" onClick={onBack} style={{ marginTop: "24px" }}>
        <span>➔ Back to Menu</span>
      </button>
    </section>
  );
}

function ResultsScreen({
  mode,
  winner,
  player,
  ai,
  onAgain,
  onMainMenu,
  rating,
  ratingChange,
  speedMatched
}: {
  mode: GameMode;
  winner: "player" | "ai";
  player: FighterStats;
  ai: FighterStats;
  onAgain: () => void;
  onMainMenu: () => void;
  rating: number;
  ratingChange: number;
  speedMatched: boolean;
}) {
  const rank = getRatingRank(rating);
  const oldRating = Math.max(1, rating - ratingChange);
  return (
    <section className="screen-card results" style={{ borderColor: rank.color } as CSSProperties}>
      <h1>{winner === "player" ? "Victory" : "Defeat"}</h1>
      
      <div className="results-grid">
        {mode === "typing" ? (
          <>
            <span>Final WPM</span><b>{player.wpm}</b>
            <span>Accuracy</span><b>{player.accuracy}%</b>
            <span>Longest Combo</span><b>{player.longestCombo}</b>
          </>
        ) : (
          <>
            <span>Bugs Fixed</span><b>{player.fixes}</b>
            <span>Average Accuracy</span><b>{player.accuracy}%</b>
            <span>Biggest Hit</span><b>{player.biggestHit}</b>
          </>
        )}
        <span>AI HP</span><b>{ai.hp}</b>
      </div>

      <div className="rating-update-card" style={{ border: `1px solid ${rank.color}25`, background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '8px', marginTop: '16px', textAlign: 'left' }}>
        <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', margin: '0 0 6px 0' }}>Arena Calibration</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.95rem', color: '#94a3b8' }}>Ladder Rating:</span>
          <b style={{ color: rank.color, fontSize: '1.15rem' }}>{oldRating} ➔ {rating}</b>
          <span style={{ 
            color: ratingChange >= 0 ? '#4ade80' : '#ff0844', 
            fontWeight: '900', 
            fontSize: '1rem',
            background: ratingChange >= 0 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 8, 68, 0.1)',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            {ratingChange >= 0 ? `+${ratingChange}` : ratingChange}
          </span>
        </div>
        <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4' }}>
          {winner === "player" 
            ? (speedMatched ? "⚡ SPEED MATCHED! Promoted to the next rating directly." : "✓ Duel Won! Rating adjusted upwards.")
            : "✗ Defeated! Rating adjusted downwards to match difficulty."
          }
        </p>
      </div>

      <div className="mp-actions" style={{ marginTop: "24px", display: "flex", gap: "12px", width: "100%" }}>
        <button className="ghost-button" onClick={onMainMenu} style={{ flex: 1 }}>
          <span>Main Menu</span>
        </button>
        <button 
          className="primary-button" 
          onClick={onAgain} 
          style={{ 
            flex: 1, 
            margin: 0, 
            background: rank.color, 
            borderColor: rank.color,
            color: "#08090f",
            fontWeight: "900",
            boxShadow: `0 0 20px ${rank.color}88`,
            textShadow: "none"
          } as CSSProperties}
        >
          <span>New Match</span>
        </button>
      </div>
    </section>
  );
}

function LobbyScreen({
  onSelectLocal,
  onSelectMultiplayer,
  user,
  onProfileClick,
  onLoginClick,
  publicReviews
}: {
  onSelectLocal: () => void;
  onSelectMultiplayer: () => void;
  user: any;
  onProfileClick: () => void;
  onLoginClick: () => void;
  publicReviews: any[];
}) {
  const rating = user?.unsafeMetadata?.rating || 1;
  return (
    <section className="start-sheet lobby-screen" style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column' }}>
      <div className="sheet-header">
        <div className="brand-mark-mini">
          <svg viewBox="0 0 76 76" fill="none" stroke="currentColor" strokeWidth="3.5">
            <path d="M12 52l10-2 28-34 6-6-3 10-34 28z" />
            <path d="M38 52v16" />
          </svg>
        </div>
        <div className="header-text" style={{ flex: 1 }}>
          <h1>TYPING BATTLE <span>ARENA</span></h1>
          <p className="screen-subtitle">Choose your arena path.</p>
        </div>
        {user ? (
          <button className="ghost-button" onClick={onProfileClick} style={{ padding: '0 16px', height: '44px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user.imageUrl ? (
              <img src={user.imageUrl} alt="Avatar" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
            ) : "👤"}
            <span>{user.username || user.firstName || "Player"} (Lvl {rating})</span>
          </button>
        ) : (
          <button className="primary-button" onClick={onLoginClick} style={{ padding: '0 16px', height: '44px', margin: 0 }}>
            <span>🔑 Login / Register</span>
          </button>
        )}
      </div>
      
      <div className="mode-card-row">
        <div className="mode-card typing-mode" onClick={onSelectLocal}>
          <div className="mode-card-icon-wrap">
            <svg viewBox="0 0 64 64">
              <path d="M10 22h44v26H10zM16 29h4M25 29h4M34 29h4M43 29h4M16 38h4M25 38h14M44 38h4" />
            </svg>
          </div>
          <div className="mode-card-content">
            <div className="mode-card-header">
              <h2>🤖 Local AI Duel</h2>
              <strong>Single Player</strong>
            </div>
            <p>Practice against AI bots. Calibrate difficulty, train WPM, and solve coding challenges at your own pace.</p>
          </div>
        </div>
        
        <div className="mode-card code-mode" onClick={onSelectMultiplayer}>
          <div className="mode-card-icon-wrap">
            <svg viewBox="0 0 64 64">
              <path d="M15 52l9-3 27-34 6-6-3 10-33 27z" />
              <path d="M49 52l-9-3-27-34-6-6 3 10 33 27z" />
            </svg>
          </div>
          <div className="mode-card-content">
            <div className="mode-card-header">
              <h2>⚔️ Room 1v1 Arena</h2>
              <strong>Online Multiplayer</strong>
            </div>
            <p>Battle a friend in real time! Enter a room code, type or code, and defeat your opponent directly.</p>
          </div>
        </div>
      </div>

      <div className="lobby-reviews-section">
        <h2>💬 Player Reviews</h2>
        <p className="subtitle">See what other coders and typists are saying about Typing Battle Arena.</p>
        {publicReviews.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>No reviews yet. Be the first to leave one in your profile!</div>
        ) : (
          <div className="reviews-slider-container">
            {publicReviews.map((rev) => (
              <div key={rev.id} className="review-card">
                <div className="review-card-header">
                  <div className="review-avatar">
                    {rev.user.profilePicture ? (
                      <img src={rev.user.profilePicture} alt={rev.user.username} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                    ) : (
                      rev.user.username.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="review-user-info">
                    <div className="review-username">{rev.user.username}</div>
                    <div className="review-user-rating">Arena Rank Lvl {rev.user.rating}</div>
                  </div>
                  <div className="review-stars">
                    {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                  </div>
                </div>
                <div className="review-body">{rev.review}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Clerk Custom Dark Cyber Appearance Settings
const clerkAppearance = {
  variables: {
    colorPrimary: "#00f2fe",
    colorBackground: "#0d101c",
    colorText: "#f8fafc",
    colorTextSecondary: "#94a3b8",
    colorInputBackground: "#161b30",
    colorInputText: "#f8fafc",
    colorBorder: "#232e4d",
  },
  elements: {
    card: {
      border: "1px solid #1e293b",
      boxShadow: "0 0 35px rgba(0, 242, 254, 0.15)",
      fontFamily: "'Outfit', sans-serif",
      background: "#0d101c"
    },
    headerTitle: {
      color: "#00f2fe",
      fontWeight: 900
    },
    socialButtonsBlockButton: {
      background: "#161b30",
      border: "1px solid #232e4d",
      color: "#f8fafc",
      '&:hover': {
        background: "#1e293b"
      }
    },
    formButtonPrimary: {
      background: "#00f2fe",
      color: "#08090f",
      fontWeight: 800,
      '&:hover': {
        background: "#00b2c2"
      }
    },
    footerActionText: {
      color: "#94a3b8"
    },
    footerActionLink: {
      color: "#00f2fe",
      '&:hover': {
        color: "#00b2c2"
      }
    }
  }
};

function LoginScreen({ onBack }: { onBack: () => void }) {
  return (
    <section className="start-sheet auth-screen-clerk" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <PaperDoodles />
      <button className="ghost-button" onClick={onBack} style={{ position: 'absolute', top: '20px', left: '20px', margin: 0 }}>
        ➔ Back to Lobby
      </button>
      <div style={{ marginTop: '50px' }}>
        <SignIn appearance={clerkAppearance} signUpUrl="/signup" fallbackRedirectUrl="/" />
      </div>
    </section>
  );
}

function SignupScreen({ onBack }: { onBack: () => void }) {
  return (
    <section className="start-sheet auth-screen-clerk" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <PaperDoodles />
      <button className="ghost-button" onClick={onBack} style={{ position: 'absolute', top: '20px', left: '20px', margin: 0 }}>
        ➔ Back to Lobby
      </button>
      <div style={{ marginTop: '50px' }}>
        <SignUp appearance={clerkAppearance} signInUrl="/login" fallbackRedirectUrl="/" />
      </div>
    </section>
  );
}

function ProfileScreen({ 
  user, 
  onLogout, 
  onBack, 
  setNotification
}: { 
  user: any; 
  onLogout: () => void; 
  onBack: () => void; 
  setNotification: (n: any) => void;
}) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "review" | "settings">("dashboard");
  const rating = user?.unsafeMetadata?.rating || 1;
  const rank = getRatingRank(rating);

  // Review states
  const [stars, setStars] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingReview) return;
    setSubmittingReview(true);
    try {
      const data = await api.post("/api/ratings", {
        username: user.username || user.firstName || "Player",
        profilePicture: user.imageUrl,
        rating: stars,
        review: reviewText
      });
      if (data.success) {
        setNotification({ type: "success", message: "Review submitted successfully!" });
        setReviewText("");
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to submit review." });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <section className="start-sheet profile-screen" style={{ width: '100%', maxWidth: '600px' }}>
      <PaperDoodles />
      
      <div className="sheet-header" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
        <div className="review-avatar" style={{ width: '60px', height: '60px', fontSize: '1.6rem' }}>
          {user.imageUrl ? (
            <img src={user.imageUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
          ) : (
            (user.username || user.firstName || "PL").slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="header-text" style={{ flex: 1 }}>
          <h1 style={{ color: '#f8fafc', margin: 0, fontSize: '1.8rem' }}>{user.username || user.firstName || "Player"}</h1>
          <p className="screen-subtitle" style={{ margin: '4px 0 0 0' }}>{user.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`profile-tab-btn ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
          📊 Dashboard
        </button>
        <button className={`profile-tab-btn ${activeTab === "review" ? "active" : ""}`} onClick={() => setActiveTab("review")}>
          ⭐️ Submit Review
        </button>
        <button className={`profile-tab-btn ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
          ⚙️ Settings
        </button>
      </div>

      <div className="profile-tab-content" style={{ minHeight: '240px' }}>
        {activeTab === "dashboard" && (
          <div className="profile-stats">
            <div className="rating-preview-card" style={{ borderColor: rank.color, background: 'rgba(255,255,255,0.02)' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 800 }}>Global Ladder Rating</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <b style={{ color: rank.color, fontSize: '3.5rem', lineHeight: 1 }}>{rating}</b>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>{rank.title}</span>
              </div>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '16px', lineHeight: 1.5 }}>
              Your global rating represents your skill in typing and coding duels. Defeat AI bots or real-world opponents to scale the ladder rankings.
            </p>
          </div>
        )}

        {activeTab === "review" && (
          <form onSubmit={handleReviewSubmit}>
            <h3 style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 800, margin: '0 0 4px 0' }}>Leave a Rating & Review</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 16px 0' }}>Share your dueling feedback. Your review will be featured in the lobby review slider!</p>
            
            <div className="star-rating-wrap">
              {[1, 2, 3, 4, 5].map((num) => (
                <button key={num} type="button" className="star-rating-btn" onClick={() => setStars(num)}>
                  <span style={{ color: num <= stars ? "#ffe259" : "rgba(255,255,255,0.15)" }}>★</span>
                </button>
              ))}
            </div>

            <div className="auth-form-group">
              <label>Review Comment</label>
              <textarea 
                required 
                rows={4} 
                className="auth-input" 
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
                value={reviewText} 
                onChange={e => setReviewText(e.target.value)} 
                placeholder="Write your review here..."
                disabled={submittingReview} 
              />
            </div>

            <button className="primary-button choose-button" type="submit" style={{ width: '100%', margin: '8px 0 0 0', background: '#00f2fe', color: '#000', borderColor: '#00f2fe' }} disabled={submittingReview}>
              <span>{submittingReview ? "Submitting..." : "Submit Review ➔"}</span>
            </button>
          </form>
        )}

        {activeTab === "settings" && (
          <div className="clerk-profile-settings-container" style={{ display: 'flex', justifyContent: 'center', background: '#161b30', borderRadius: '12px', padding: '10px', border: '1px solid #232e4d' }}>
            <UserProfile appearance={{
              ...clerkAppearance,
              elements: {
                ...clerkAppearance.elements,
                card: {
                  border: "none",
                  boxShadow: "none",
                  background: "transparent",
                  width: "100%"
                }
              }
            }} />
          </div>
        )}
      </div>

      <div className="mp-actions" style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
        <button className="ghost-button" onClick={onLogout} style={{ flex: 1 }}>Logout</button>
        <button className="primary-button choose-button" onClick={onBack} style={{ flex: 2, background: '#00f2fe', color: '#000', borderColor: '#00f2fe' }}>
          Back to Arena ➔
        </button>
      </div>
    </section>
  );
}



function MultiplayerSetupScreen({
  playerName,
  setPlayerName,
  roomCode,
  setRoomCode,
  mode,
  setMode,
  onJoin,
  onBack,
  status
}: {
  playerName: string;
  setPlayerName: (val: string) => void;
  roomCode: string;
  setRoomCode: (val: string) => void;
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  onJoin: () => void;
  onBack: () => void;
  status: string;
}) {
  return (
    <section className="start-sheet mp-setup-screen">
      <div className="sheet-header">
        <div className="brand-mark-mini">
          <svg viewBox="0 0 76 76" fill="none" stroke="currentColor" strokeWidth="3.5">
            <path d="M12 52l10-2 28-34 6-6-3 10-34 28z" />
            <path d="M38 52v16" />
          </svg>
        </div>
        <div className="header-text">
          <h1>ONLINE <span>1v1 MATCH</span></h1>
          <p className="screen-subtitle">No logins. Simply enter a matching code to connect.</p>
        </div>
      </div>
      
      <div className="mp-setup-layout">
        <div className="mp-left-col">
          <div className="form-group">
            <label>Your Name</label>
            <input 
              type="text" 
              placeholder="Enter your name..." 
              value={playerName} 
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={!!status}
            />
          </div>
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>Room Code</label>
            <input 
              type="text" 
              placeholder="e.g. 1234..." 
              value={roomCode} 
              onChange={(e) => setRoomCode(e.target.value)}
              disabled={!!status}
            />
          </div>
        </div>
        
        <div className="mp-right-col">
          <div className="form-group">
            <label>Arena Mode</label>
            <div className="mode-toggle-group">
              <button 
                className={`mode-toggle-btn ${mode === "typing" ? "selected" : ""}`}
                onClick={() => setMode("typing")}
                disabled={!!status}
              >
                ⌨️ Typing Duel
              </button>
              <button 
                className={`mode-toggle-btn ${mode === "code" ? "selected" : ""}`}
                onClick={() => setMode("code")}
                disabled={!!status}
              >
                🐍 Code Duel
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {status ? (
        <div className="mp-status-loader">
          <div className="spinner" />
          <span>{status}</span>
        </div>
      ) : (
        <div className="mp-actions">
          <button className="ghost-button" onClick={onBack}>
            <span>Back to Lobby</span>
          </button>
          <button className="primary-button choose-button" onClick={onJoin}>
            <span>Enter Matchmaking ➔</span>
          </button>
        </div>
      )}
    </section>
  );
}

export default function App() {
  const [phase, setPhase] = useState<MatchPhase>("login");
  const [mode, setMode] = useState<GameMode>("typing");
  const [rating, setRating] = useState<number>(() => {
    const saved = localStorage.getItem("arena_rating");
    return saved ? Math.max(1, Math.min(100, Number(saved))) : 1;
  });
  const [ratingChange, setRatingChange] = useState(0);
  const [speedMatched, setSpeedMatched] = useState(false);
  const hasProcessedResults = useRef(false);

  const [countdown, setCountdown] = useState(3);
  const [round, setRound] = useState(1);
  const [muted, setMuted] = useState(audioManager.getMuted());
  const [isShaking, setIsShaking] = useState(false);

  // Multiplayer stats
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [playerNameState, setPlayerNameState] = useState("");
  const [mpStatus, setMpStatus] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [opponentStats, setOpponentStats] = useState<FighterStats | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);

  const { user, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();

  // Authentication & Reviews states
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [publicReviews, setPublicReviews] = useState<any[]>([]);

  // 1. Sync rating from Clerk metadata when user loads and redirect to lobby
  useEffect(() => {
    if (clerkLoaded && user) {
      const metadataRating = user.unsafeMetadata?.rating;
      if (typeof metadataRating === "number") {
        setRating(metadataRating);
      }
      if (phase === "login" || phase === "signup") {
        setPhase("lobby");
      }
    }
  }, [user, clerkLoaded, phase]);

  // 2. Fetch public reviews when returning to Lobby Screen
  useEffect(() => {
    if (phase === "lobby") {
      api.get("/api/ratings")
        .then(data => {
          if (data.success) {
            setPublicReviews(data.ratings);
          }
        })
        .catch(err => {
          console.error("Failed to load reviews:", err);
        });
    }
  }, [phase]);

  // 3. Clear notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = window.setTimeout(() => setNotification(null), 4000);
      return () => window.clearTimeout(timer);
    }
  }, [notification]);

  // 4. Route Protection redirect hook
  useEffect(() => {
    const protectedPhases: MatchPhase[] = [
      "lobby",
      "profile", 
      "multiplayer-setup", 
      "mode", 
      "difficulty", 
      "code-level", 
      "countdown", 
      "playing", 
      "results"
    ];
    if (clerkLoaded && !user && protectedPhases.includes(phase)) {
      setPhase("login");
    }
  }, [phase, user, clerkLoaded]);

  useEffect(() => {
    fetchOnlineQuotes();
    fetchOnlineJokes();
    fetchOnlineSnippets();

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (phase === "countdown" || phase === "playing") {
      audioManager.startMusic();
    } else {
      audioManager.stopMusic();
    }
  }, [phase]);

  const typing = useTypingBattle(phase === "playing" && mode === "typing", rating, isMultiplayer);
  const code = useCodeBattle(phase === "playing" && mode === "code", rating, isMultiplayer);
  const active = mode === "typing" ? typing.state : code.state;
  const runningCode = code.state.message === "Running...";

  const renderedAiStats = isMultiplayer && opponentStats ? opponentStats : active.ai;

  const elapsedMs = useMemo(() => {
    if (phase === "countdown") return 45000;
    return active.elapsedMs;
  }, [active.elapsedMs, phase]);

  // Ladder progression result processor
  useEffect(() => {
    if (phase === "playing") {
      hasProcessedResults.current = false;
    }
    if (phase === "results" && active.winner && !hasProcessedResults.current) {
      hasProcessedResults.current = true;
      const t = (rating - 1) / 99;
      let matched = false;
      let change = 0;

      if (active.winner === "player") {
        if (mode === "typing") {
          const targetWpm = 9 + t * 116;
          matched = active.player.wpm >= targetWpm;
        } else {
          const targetSolveMs = (18 - t * 13.5) * 1000;
          const avgSolveMs = active.elapsedMs / Math.max(1, active.player.fixes);
          matched = avgSolveMs <= targetSolveMs;
        }
        change = matched ? 8 : 4;
      } else {
        change = -2;
      }

      setRatingChange(change);
      setSpeedMatched(matched);
      setRating((prev) => {
        const newVal = Math.max(1, Math.min(100, prev + change));
        localStorage.setItem("arena_rating", String(newVal));
        if (user) {
          user.update({
            unsafeMetadata: {
              ...user.unsafeMetadata,
              rating: newVal
            }
          }).catch(err => console.error("Failed to sync rating to Clerk:", err));
        }
        return newVal;
      });
    }
  }, [phase, active.winner, mode]);

  // Sync stats update
  useEffect(() => {
    if (!isMultiplayer || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({
      type: "game-event",
      payload: {
        type: "state-update",
        player: active.player
      }
    }));
  }, [active.player, isMultiplayer]);

  // Sync attack events
  const lastAttackLen = useRef(0);
  useEffect(() => {
    if (!isMultiplayer || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    if (active.attacks.length > lastAttackLen.current) {
      const newAttacks = active.attacks.slice(lastAttackLen.current);
      newAttacks.forEach((atk) => {
        if (atk.from === "player") {
          socketRef.current?.send(JSON.stringify({
            type: "game-event",
            payload: {
              type: "attack",
              damage: atk.damage,
              critical: atk.critical,
              ultimate: atk.ultimate
            }
          }));
        }
      });
      lastAttackLen.current = active.attacks.length;
    }
  }, [active.attacks.length, isMultiplayer]);

  const enterMatchmaking = () => {
    if (!playerNameState || !roomCode) {
      alert("Please fill in both Name and Room Code!");
      return;
    }
    setMpStatus("Connecting to Arena...");
    
    const backendUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:5001";
    const wsUrl = backendUrl.replace(/^http/, "ws") + "/ws-multiplayer";
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setMpStatus("Joined Room! Waiting for Opponent...");
      socket.send(JSON.stringify({
        type: "join",
        roomId: roomCode,
        name: playerNameState
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "error") {
        alert(data.message);
        socket.close();
        setMpStatus("");
      } else if (data.type === "opponent-joined") {
        setMpStatus("Opponent entered! Preparing duel...");
      } else if (data.type === "match-start") {
        setOpponentName(data.opponentName);
        setIsMultiplayer(true);
        setOpponentStats(null);
        lastAttackLen.current = 0;
        if (mode === "typing") typing.reset();
        else code.reset();
        setPhase("countdown");
      } else if (data.type === "game-event") {
        const payload = data.payload;
        if (payload.type === "state-update") {
          setOpponentStats(payload.player);
        } else if (payload.type === "attack") {
          if (mode === "typing") {
            typing.pushAttack("ai", payload.damage, payload.critical, payload.ultimate);
          } else {
            code.pushAttack("ai", payload.damage, payload.critical);
          }
        } else if (payload.type === "rematch-ready") {
          if (mode === "typing") typing.reset();
          else code.reset();
          setOpponentStats(null);
          lastAttackLen.current = 0;
          setPhase("countdown");
        }
      } else if (data.type === "opponent-left") {
        alert("Your opponent fled the field. Victory is yours!");
        setIsMultiplayer(false);
        socket.close();
        setPhase("lobby");
      }
    };

    socket.onerror = () => {
      alert("Multiplayer Server connection error.");
      setMpStatus("");
    };

    socket.onclose = () => {
      setIsMultiplayer(false);
    };
  };

  useEffect(() => {
    if (active.player.state === "hit" || renderedAiStats.state === "hit" || active.player.state === "error" || renderedAiStats.state === "error" || active.player.state === "ultimate" || renderedAiStats.state === "ultimate") {
      setIsShaking(true);
      const timer = window.setTimeout(() => setIsShaking(false), 350);
      return () => window.clearTimeout(timer);
    }
  }, [active.player.state, renderedAiStats.state]);

  useEffect(() => {
    if (phase !== "countdown") return;
    setCountdown(3);
    const interval = window.setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          setPhase("playing");
          return 0;
        }
        return value - 1;
      });
    }, 850);
    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === "playing" && active.winner) {
      const timeout = window.setTimeout(() => setPhase("results"), 800);
      return () => window.clearTimeout(timeout);
    }
  }, [active.winner, phase]);

  const beginMode = (nextMode: GameMode) => {
    setMode(nextMode);
    if (nextMode === "typing") {
      setPhase("difficulty");
    } else {
      setPhase("code-level");
    }
  };

  const startMatch = () => {
    setRound((value) => value + 1);
    if (mode === "typing") typing.reset();
    else code.reset();
    setPhase("countdown");
  };

  const handleAgain = () => {
    if (isMultiplayer) {
      if (mode === "typing") typing.reset();
      else code.reset();
      setOpponentStats(null);
      lastAttackLen.current = 0;
      setPhase("countdown");
      socketRef.current?.send(JSON.stringify({
        type: "game-event",
        payload: { type: "rematch-ready" }
      }));
    } else {
      if (mode === "typing") {
        setPhase("difficulty");
      } else {
        setPhase("code-level");
      }
    }
  };

  const leaveMultiplayer = () => {
    if (socketRef.current) socketRef.current.close();
    setIsMultiplayer(false);
    setMpStatus("");
    setPhase("lobby");
  };

  if (!clerkLoaded) {
    return (
      <div className="notebook-app center-screen">
        <PaperDoodles />
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#00f2fe", fontSize: "1.5rem", fontWeight: 800 }}>⚔️ DUEL ARENA</h2>
          <div className="spinner" style={{ margin: "24px auto" }} />
          <p style={{ color: "#64748b" }}>Restoring secure session...</p>
        </div>
      </div>
    );
  }

  const isPlayingLayout = phase === "countdown" || phase === "playing" || phase === "results";

  return (
    <div className={`notebook-app ${isPlayingLayout ? "arena-playing-layout" : ""} ${isShaking ? "shake-screen" : ""}`}>
      {(phase === "countdown" || phase === "playing" || phase === "results") && (
        <>
          <div className="top-menu-bar">
            <button 
              className="menu-btn leave-btn" 
              onClick={isMultiplayer ? leaveMultiplayer : () => setPhase("lobby")}
            >
              🚪 Leave Arena
            </button>
            <div className="menu-title">
              <span>⚔️ DUEL ARENA</span>
            </div>
            <button className="menu-btn mute-btn" onClick={() => { audioManager.toggleMute(); setMuted(audioManager.getMuted()); }}>
              {muted ? "🔇 Sound Off" : "🔊 Sound On"}
            </button>
          </div>

          <TopHud 
            mode={mode} 
            player={active.player} 
            ai={renderedAiStats} 
            round={round} 
            elapsedMs={elapsedMs} 
            rating={rating} 
            playerName={isMultiplayer ? playerNameState : "Player 1"}
            opponentNameOverride={isMultiplayer ? opponentName : undefined}
          />
          <Battlefield player={active.player} ai={renderedAiStats} attacks={active.attacks} mode={mode} winner={active.winner} />
        </>
      )}

      {phase === "lobby" && (
        <div className="center-screen">
          <LobbyScreen 
            onSelectLocal={() => setPhase("mode")} 
            onSelectMultiplayer={() => setPhase("multiplayer-setup")} 
            user={user}
            onProfileClick={() => setPhase("profile")}
            onLoginClick={() => setPhase("login")}
            publicReviews={publicReviews}
          />
        </div>
      )}

      {phase === "login" && (
        <div className="center-screen">
          <LoginScreen onBack={() => setPhase("lobby")} />
        </div>
      )}

      {phase === "signup" && (
        <div className="center-screen">
          <SignupScreen onBack={() => setPhase("lobby")} />
        </div>
      )}

      {phase === "profile" && user && (
        <div className="center-screen">
          <ProfileScreen 
            user={user}
            onLogout={async () => {
              await signOut();
              setPhase("login");
              setNotification({ type: "success", message: "Logged out successfully." });
            }}
            onBack={() => setPhase("lobby")}
            setNotification={setNotification}
          />
        </div>
      )}

      {phase === "multiplayer-setup" && (
        <div className="center-screen">
          <MultiplayerSetupScreen 
            playerName={playerNameState || (user ? (user.username || user.firstName || "") : "")}
            setPlayerName={setPlayerNameState}
            roomCode={roomCode}
            setRoomCode={setRoomCode}
            mode={mode}
            setMode={setMode}
            onJoin={enterMatchmaking}
            onBack={() => setPhase("lobby")}
            status={mpStatus}
          />
        </div>
      )}

      {(phase === "difficulty" || phase === "code-level") && (
        <div className="center-screen">
          <RatingScreen 
            rating={rating} 
            onStart={startMatch} 
            onBack={() => setPhase("mode")}
          />
        </div>
      )}

      {phase === "mode" && (
        <div className="center-screen">
          <ModeScreen 
            onPick={beginMode} 
            onBack={() => setPhase("lobby")}
          />
        </div>
      )}

      {phase === "countdown" && (
        <div className="countdown">
          <b>{countdown || "GO"}</b>
        </div>
      )}

      {phase === "playing" && mode === "typing" && (
        <>
          <TypingPanel 
            sentence={typing.state.sentence.text} 
            typed={typing.state.typed} 
            errorPositions={typing.state.errorPositions} 
            onInput={typing.handleInput} 
            player={typing.state.player} 
            triggerUltimate={typing.triggerUltimate}
          />
          <ComboStrip player={typing.state.player} ai={renderedAiStats} mode={mode} />
        </>
      )}

      {phase === "playing" && mode === "code" && (
        <>
          <CodePanel
            code={code.state.code}
            onCode={code.setCode}
            onSubmit={code.submit}
            onAttack={code.attack}
            player={code.state.player}
            title={code.state.snippet.title}
            task={code.state.snippet.task}
            message={code.state.message || code.state.snippet.title}
            running={runningCode}
            level={rating < 35 ? 1 : rating < 70 ? 2 : 3}
            lastRun={code.state.lastRun}
            nextSnippet={code.nextSnippet}
          />
          <ComboStrip player={code.state.player} ai={renderedAiStats} mode={mode} />
        </>
      )}

      {phase === "results" && active.winner && (
        <div className="center-screen overlay-results">
          <ResultsScreen 
            mode={mode} 
            winner={active.winner} 
            player={active.player} 
            ai={renderedAiStats} 
            onAgain={handleAgain} 
            onMainMenu={() => {
              if (isMultiplayer && socketRef.current) socketRef.current.close();
              setIsMultiplayer(false);
              setPhase("lobby");
            }}
            rating={rating}
            ratingChange={ratingChange}
            speedMatched={speedMatched}
          />
        </div>
      )}
      {notification && (
        <div className={`notification-toast ${notification.type}`} onClick={() => setNotification(null)}>
          <span>{notification.type === "success" ? "✓" : "✗"} {notification.message}</span>
        </div>
      )}
    </div>
  );
}
