"use client";

import { ChangeEvent, useMemo, useState } from "react";
import {
  createBlueprint,
  deriveTropes,
  remixPrompt,
  summarizeBlueprint,
  type DnaBlueprint,
  type RemixResult
} from "../utils/dna";
import { extractPromptsFromPdf } from "../utils/pdf";

const SAMPLE_PROMPTS = [
  "A confident explorer standing before a portal to another neon dimension, holding an analog camera",
  "Two rival pilots racing hover bikes through a rain-bathed synth cityscape",
  "A ragtag idol squad rehearsing choreography atop a skyscraper helipad",
  "A shapeshifting guardian emerging from a cosmic arcade cabinet"
];

const DEFAULT_TROPE_COPY = `laser grid skylines, synthwave hero poses, VHS tracking static,
retro mecha transformations, bubblegum pop idol teams`;

interface GenerationState {
  blueprint: DnaBlueprint | null;
  results: RemixResult[];
  generatedAt: number | null;
}

export default function MainPage() {
  const [tropesText, setTropesText] = useState<string>(DEFAULT_TROPE_COPY);
  const [promptBook, setPromptBook] = useState<string[]>(SAMPLE_PROMPTS);
  const [fileName, setFileName] = useState<string>("Sample prompt deck loaded");
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [{ blueprint, results, generatedAt }, setGenerationState] =
    useState<GenerationState>({ blueprint: null, results: [], generatedAt: null });

  const derivedTropes = useMemo(() => deriveTropes(tropesText), [tropesText]);

  const promptCount = promptBook.length;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file containing your prompt catalogue.");
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const prompts = await extractPromptsFromPdf(file);
      if (prompts.length === 0) {
        setError(
          "Could not find any prompts in that PDF. Make sure prompts are separated by new lines or bullet points."
        );
        return;
      }

      setPromptBook(prompts);
      setFileName(`${file.name} • ${prompts.length} prompts extracted`);
      setGenerationState({ blueprint: null, results: [], generatedAt: null });
    } catch (err) {
      console.error(err);
      setError(
        "Something went wrong while decoding the PDF. Try a different file or re-export your prompt book."
      );
    } finally {
      setIsParsing(false);
      event.target.value = "";
    }
  };

  const handleGenerate = async () => {
    if (promptBook.length === 0) {
      setError("Upload a prompt PDF or keep the sample prompts to remix.");
      return;
    }

    setError(null);
    setIsGenerating(true);

    await new Promise((resolve) => setTimeout(resolve, 80));

    const blueprintInstance = createBlueprint(derivedTropes);
    const context = { blueprint: blueprintInstance, tropes: derivedTropes };

    const remixed = promptBook.slice(0, 24).map((prompt) => remixPrompt(prompt, context));

    setGenerationState({
      blueprint: blueprintInstance,
      results: remixed,
      generatedAt: Date.now()
    });

    setIsGenerating(false);
  };

  const blueprintCards = useMemo(() => {
    if (!blueprint) {
      return [];
    }
    return summarizeBlueprint(blueprint);
  }, [blueprint]);

  return (
    <div className="app-shell">
      <section className="panel hero">
        <h1 className="hero-title">1980s Animation DNA Lab</h1>
        <p className="hero-subtitle">
          Upload your image prompt PDF, feed in the tropes you love, and mutate every line into a
          luminous 1980s cartoon treatment. The lab weaves lighting, palettes, soundtrack energy,
          and VHS grit to form a unique animation genome.
        </p>
        <div className="status-bar">
          <span className="status-pill">Prompts ready: {promptCount}</span>
          {generatedAt ? (
            <span className="status-pill">
              Blueprint stamped: {new Date(generatedAt).toLocaleTimeString()}
            </span>
          ) : (
            <span className="status-pill">Load a PDF or remix the sample stack</span>
          )}
          {blueprint && <span className="status-pill">{blueprint.slogan}</span>}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">1. Feed the prompt archive</h2>
          <span className="panel-hint">PDF only • max 10MB • bullets or line breaks</span>
        </div>
        <div className="grid-two">
          <label className="pdf-upload">
            <input type="file" accept="application/pdf" onChange={handleFileChange} />
            <strong>{isParsing ? "Decoding nostalgia DNA…" : "Drop or select your PDF"}</strong>
            <p>{fileName}</p>
          </label>
          <div>
            <h3 className="panel-title">Tropes to amplify</h3>
            <p className="panel-hint">
              Separate with commas or new lines. We&apos;ll randomize their expression through every
              prompt.
            </p>
            <textarea
              className="textarea"
              value={tropesText}
              onChange={(event) => setTropesText(event.target.value)}
              placeholder={DEFAULT_TROPE_COPY}
            />
            <div className="tag-cloud" aria-live="polite">
              {derivedTropes.slice(0, 10).map((trope) => (
                <span className="tag" key={trope}>
                  {trope}
                </span>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="generate-button"
          disabled={isGenerating || isParsing}
          onClick={handleGenerate}
        >
          {isGenerating ? "Synthesizing DNA" : "Generate animation DNA"}
        </button>
        {error && <p className="panel-hint" style={{ color: "#ff9dd7" }}>{error}</p>}
      </section>

      {blueprintCards.length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title">2. Genome blueprint</h2>
            <span className="panel-hint">A shared tonal bible for every adapted prompt</span>
          </div>
          <div className="dnagraphics">
            <div className="dnagraphics-row">
              {blueprintCards.slice(0, 5).map(({ label, value }) => (
                <div className="dnagraphic-card" key={label}>
                  <strong>{label}</strong>
                  <br />
                  {value}
                </div>
              ))}
            </div>
            <div className="dnagraphics-row">
              {blueprintCards.slice(5).map(({ label, value }) => (
                <div className="dnagraphic-card" key={label}>
                  <strong>{label}</strong>
                  <br />
                  {value}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">3. Adapted prompt reels</h2>
          <span className="panel-hint">Remixed up to 24 prompts at a time</span>
        </div>
        {results.length === 0 ? (
          <p className="empty-state">
            Run a generation to see your prompts reforged into a Saturday morning broadcast lineup.
          </p>
        ) : (
          <div className="results-grid">
            {results.map((result, index) => (
              <article className="result-card" key={`${result.original}-${index}`}>
                <h3 className="result-title">Scene {index + 1}</h3>
                <div className="badge">
                  DNA Blend <i>{result.injectedTropes.join(" • ")}</i>
                </div>
                <p className="result-chunk">
                  <strong>Original:</strong> {result.original}
                </p>
                <p className="result-chunk">
                  <strong>Adapted:</strong> {result.adapted}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer>
        Crafted for remixing dense prompt books into bespoke 1980s animation DNA. Upload, mutate,
        and storyboard.
      </footer>
    </div>
  );
}
