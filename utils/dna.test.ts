import { describe, expect, it } from "vitest";
import {
  createBlueprint,
  deriveTropes,
  remixPrompt,
  summarizeBlueprint,
  type DnaBlueprint
} from "./dna";

const mockRandomSequence = (sequence: number[]): (() => number) => {
  let cursor = 0;
  return () => {
    const value = sequence[cursor % sequence.length];
    cursor += 1;
    return value;
  };
};

describe("deriveTropes", () => {
  it("normalizes and deduplicates user-supplied tropes", () => {
    const input = "laser grid skylines, Laser Grid Skylines\nretro mecha - transformations; •cereal mascots";
    const result = deriveTropes(input);
    expect(result).toHaveLength(3);
    expect(result.map((value) => value.toLowerCase())).toEqual([
      "laser grid skylines",
      "retro mecha transformations",
      "cereal mascots"
    ]);
  });

  it("returns defaults when empty", () => {
    const result = deriveTropes("\n \t  ");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("createBlueprint", () => {
  it("produces a deterministic blueprint when provided a seeded RNG", () => {
    const tropes = ["laser", "mecha", "idol"];
    const random = mockRandomSequence([0.1, 0.2, 0.3, 0.4, 0.5, 0.6]);
    const blueprint = createBlueprint(tropes, random);
    expect(blueprint.signatureTrope).toBe("laser");
    expect(blueprint.supportTrope).toBe("mecha");
    expect(blueprint.palette.length).toBeGreaterThan(0);
  });
});

describe("remixPrompt", () => {
  it("injects blueprint information and returns a structured adaptation", () => {
    const tropes = ["laser grid", "villain capes", "hover bikes"];
    const blueprint: DnaBlueprint = {
      signatureTrope: "laser grid",
      supportTrope: "villain capes",
      palette: "chrome cyan vs magenta clash",
      lighting: "backlit by endless neon signage",
      texture: "grainy VHS bleed",
      cinematography: "low-angle hero glide cam",
      soundtrack: "FM synth arpeggios",
      energy: "sugar rush rebellion",
      fx: "lightning bolt overlays",
      slogan: "Power up the nostalgia core"
    };

    const random = mockRandomSequence([0.2, 0.4, 0.6, 0.8]);
    const result = remixPrompt("test hero prompt", { blueprint, tropes }, random);

    expect(result.original).toBe("test hero prompt");
    expect(result.injectedTropes).toContain("laser grid");
    expect(result.adapted).toContain("chrome cyan vs magenta clash");
    expect(result.adapted).toContain("FM synth arpeggios");
  });
});

describe("summarizeBlueprint", () => {
  it("converts blueprint to labelled entries", () => {
    const blueprint = createBlueprint(["laser"], mockRandomSequence([0.1]));
    const summary = summarizeBlueprint(blueprint);
    expect(summary.find((entry) => entry.label === "Signature Trope")?.value).toBe(
      blueprint.signatureTrope
    );
  });
});
