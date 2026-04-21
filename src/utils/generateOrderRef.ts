/**
 * Generates a short, unique, easy-to-type order reference.
 * Format: 4 uppercase letters + 2 digits  e.g. "BOLT42", "KITE07"
 * The combination gives 26^4 × 100 = 45,697,600 possible values,
 * making accidental collisions extremely unlikely for active orders.
 */
const WORDS = [
  "BOLT","KITE","STAR","GLOW","WAVE","FIRE","MINT","JADE","ROSE","BLUE",
  "GOLD","LIME","TEAL","RUBY","SAGE","AQUA","COAL","DAWN","DUSK","ECHO",
  "FERN","HAZE","IRIS","JAZZ","KEEN","LARK","MIST","NOVA","OPAL","PINE",
  "QUIZ","REEF","SILK","TIDE","UMBER","VINE","WREN","YARN","ZEAL","APEX",
  "BARK","CAVE","DUNE","EDGE","FLUX","GUST","HALO","ICON","JOLT","KNOT",
  "LAVA","MESA","NEON","ONYX","PEAR","QUAY","RAMP","SNOW","TUFT","WICK",
];

export function generateOrderRef(): string {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  const digits = String(Math.floor(Math.random() * 90) + 10); // 10–99
  return `${word}${digits}`;
}
