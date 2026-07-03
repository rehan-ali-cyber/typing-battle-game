// Continuous Rating AI Profiles (0 to 100 scale)
// R=1: very easy, 9 WPM, 45% accuracy
// R=100: king rating, 125 WPM, 100% accuracy

export function typingAiTick(rating: number, deltaMs: number) {
  const t = Math.max(0, Math.min(1, (rating - 1) / 99));
  const targetWpm = 9 + t * 116;
  const targetAccuracy = 45 + t * 55;
  const energyRate = 0.08 + t * 1.42;

  const jitter = 0.85 + Math.random() * 0.3;
  return {
    energyGain: energyRate * deltaMs * 0.06 * jitter,
    wpm: Math.round(targetWpm * jitter),
    accuracy: Math.round(Math.max(20, Math.min(100, targetAccuracy - Math.random() * 6)))
  };
}

export function codeAiProfile(rating: number) {
  const t = Math.max(0, Math.min(1, (rating - 1) / 99));
  const solveMs = 18000 - t * 13500;
  const accuracy = 0.40 + t * 0.60;
  const points = Math.round(15 + t * 50);

  const jitter = 0.82 + Math.random() * 0.36;
  return {
    solveMs: Math.round(solveMs * jitter),
    accuracy: Math.max(0.2, Math.min(1, accuracy + (Math.random() - 0.5) * 0.2)),
    points
  };
}

export function baseCodePoints(level: number) {
  return level === 1 ? 55 : level === 2 ? 85 : 125;
}
