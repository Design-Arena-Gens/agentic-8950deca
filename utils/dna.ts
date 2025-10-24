export interface DnaBlueprint {
  signatureTrope: string;
  supportTrope: string;
  palette: string;
  lighting: string;
  texture: string;
  cinematography: string;
  soundtrack: string;
  energy: string;
  fx: string;
  slogan: string;
}

export interface RemixResult {
  original: string;
  adapted: string;
  injectedTropes: string[];
}

const DEFAULT_TROPES = [
  "laser grid skylines",
  "synthwave hero poses",
  "VHS tracking static",
  "retro mecha transformations",
  "bubblegum pop idol teams",
  "villains with neon capes",
  "arcade boss battles",
  "chromed hover vehicles",
  "midnight mall chases",
  "neon-lit rain storms"
];

const COLOR_DNAS = [
  "chrome cyan vs magenta clash",
  "pulsing ultraviolet spectra",
  "teal horizon with magenta sun",
  "sunset sherbet gradients",
  "emerald gridlines over midnight navy",
  "tangerine flare streaks"
];

const LIGHTING_MOODS = [
  "backlit by endless neon signage",
  "punchy rim lights carved by moonlit skylines",
  "flooded with laser-sliced volumetrics",
  "drenched in sodium-vapor glow",
  "fractured by kaleidoscopic spotlight rigs"
];

const TEXTURES = [
  "grainy VHS bleed",
  "cel-shaded airbrush gradients",
  "anisotropic chrome reflections",
  "hand-painted ozone streaks",
  "inked speedlines and halftones"
];

const CINEMATOGRAPHY = [
  "low-angle hero glide cam",
  "hyper-zoomed dolly crash",
  "parallax skyline pan",
  "rotoscope spin reveal",
  "freeze-frame title card smash"
];

const SOUNDTRACKS = [
  "FM synth arpeggios",
  "arena rock power chords",
  "electro-funk drum machine",
  "neo-noir saxophone riffs",
  "hyperpop vocoder chants"
];

const ENERGY = [
  "sugar rush rebellion",
  "heavy metal mythos",
  "buddy-cop bravado",
  "youthquake insurgence",
  "high-gloss mecha opera"
];

const FX = [
  "lightning bolt overlays",
  "spectral lens flares",
  "rotoscoped energy halos",
  "side-scrolling speed trails",
  "prismatic particle bursts"
];

const SLOGANS = [
  "Power up the nostalgia core",
  "Roll the tape, rewrite the genome",
  "Synth the ink, ignite the frame",
  "From storyboard to time warp",
  "Neon genes, infinite scenes"
];

const adjectivePool = [
  "radical",
  "turbo-charged",
  "laser-forged",
  "hypercolor",
  "retro-futurist",
  "storm-chasing"
];

const structureFragments = [
  "frame-filling vaporwave haze",
  "hero anthem crescendo",
  "freeze-frame slogan punch",
  "galactic arena showdown",
  "montage of rebellious camaraderie",
  "gravity-defying transformation sequence"
];

const endingTags = [
  "rendered in golden-hour grain",
  "sealed with synth brass flourish",
  "looped on midnight broadcast",
  "forged on an arcade cabinet marquee",
  "broadcast in pan-and-scan glory"
];

const MAX_PROMPT_LENGTH = 360;

function pickRandom<T>(pool: readonly T[], random: () => number): T {
  return pool[Math.floor(random() * pool.length)];
}

function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export interface DnaContext {
  blueprint: DnaBlueprint;
  tropes: string[];
}

export function deriveTropes(rawInput: string): string[] {
  const tokens = rawInput
    .split(/[,\n;]+/)
    .map((token) => token.replace(/[\-*•–]/g, " "))
    .map((token) => token.replace(/\s{2,}/g, " "))
    .map((token) => token.trim())
    .filter(Boolean);

  const normalized = new Map<string, string>();

  for (const token of tokens) {
    const key = token.toLowerCase();
    if (!normalized.has(key)) {
      normalized.set(key, token);
    }
  }

  if (normalized.size === 0) {
    return [...DEFAULT_TROPES];
  }

  return Array.from(normalized.values());
}

export function createBlueprint(
  tropes: string[],
  random: () => number = Math.random
): DnaBlueprint {
  const pickTrope = () => tropes[Math.floor(random() * tropes.length)];

  const signatureTrope = pickTrope();
  let supportTrope = pickTrope();

  if (tropes.length > 1) {
    while (supportTrope === signatureTrope) {
      supportTrope = pickTrope();
    }
  }

  const blueprint: DnaBlueprint = {
    signatureTrope: signatureTrope,
    supportTrope,
    palette: pickRandom(COLOR_DNAS, random),
    lighting: pickRandom(LIGHTING_MOODS, random),
    texture: pickRandom(TEXTURES, random),
    cinematography: pickRandom(CINEMATOGRAPHY, random),
    soundtrack: pickRandom(SOUNDTRACKS, random),
    energy: pickRandom(ENERGY, random),
    fx: pickRandom(FX, random),
    slogan: pickRandom(SLOGANS, random)
  };

  return blueprint;
}

function ensureLength(prompt: string): string {
  if (prompt.length <= MAX_PROMPT_LENGTH) {
    return prompt;
  }

  return `${prompt.slice(0, MAX_PROMPT_LENGTH - 3)}...`;
}

export function remixPrompt(
  basePrompt: string,
  context: DnaContext,
  random: () => number = Math.random
): RemixResult {
  const { blueprint, tropes } = context;
  const injectedTrope = pickRandom(tropes, random);
  const extraFlavor = pickRandom(structureFragments, random);
  const adjective = pickRandom(adjectivePool, random);
  const ending = pickRandom(endingTags, random);

  const original = basePrompt.trim();
  const capitalizedOriginal =
    original.charAt(0).toUpperCase() + original.slice(1);

  const adapted = ensureLength(
    `${capitalizedOriginal} is reborn as a ${adjective} ${toTitleCase(
      blueprint.signatureTrope
    )} showcase, staged with ${blueprint.lighting} across a ${
      blueprint.palette
    } palette. ${extraFlavor} collides with ${toTitleCase(
      injectedTrope
    )} while ${blueprint.texture} wraps every cel. ${
      blueprint.cinematography
    } tracks the action against ${blueprint.soundtrack} pulses, channeling ${
      blueprint.energy
    }. Effects shimmer with ${blueprint.fx}, ${ending}.`
  );

  return {
    original,
    adapted,
    injectedTropes: Array.from(
      new Set([blueprint.signatureTrope, blueprint.supportTrope, injectedTrope])
    )
  };
}

export function summarizeBlueprint(blueprint: DnaBlueprint): Array<{
  label: string;
  value: string;
}> {
  return [
    { label: "Signature Trope", value: blueprint.signatureTrope },
    { label: "Secondary Trope", value: blueprint.supportTrope },
    { label: "Palette", value: blueprint.palette },
    { label: "Lighting", value: blueprint.lighting },
    { label: "Texture", value: blueprint.texture },
    { label: "Cinematography", value: blueprint.cinematography },
    { label: "Soundtrack", value: blueprint.soundtrack },
    { label: "Energy", value: blueprint.energy },
    { label: "FX", value: blueprint.fx },
    { label: "Slogan", value: blueprint.slogan }
  ];
}
