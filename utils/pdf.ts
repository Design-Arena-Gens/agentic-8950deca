export async function extractPromptsFromPdf(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();

  const pdfjsLib = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker?url");

  if (pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default;
  }

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const strings = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .filter(Boolean);
    pages.push(strings.join(" "));
  }

  const merged = pages.join("\n\n");
  return splitTextIntoPrompts(merged);
}

export function splitTextIntoPrompts(source: string): string[] {
  const normalized = source
    .replace(/\r\n?/g, "\n")
    .replace(/\u2022/g, "-")
    .replace(/\u00b7/g, "-")
    .replace(/[\t]+/g, " ")
    .trim();

  const bulletBreaks = normalized
    .replace(/\n{3,}/g, "\n\n")
    .split(/\n(?=(?:\s*[-–—•\d]+\s))/);

  const segments = bulletBreaks.flatMap((segment) =>
    segment
      .split(/\n{2,}/)
      .join("\n")
      .split(/(?:(?:^|\n)(?:\d+\.|[-–—•]))/)
  );

  return segments
    .map((entry) =>
      entry
        .replace(/^[-–—•\d\.\s]+/, "")
        .replace(/\s{2,}/g, " ")
        .trim()
    )
    .filter((entry) => entry.length > 0)
    .filter((entry, index, arr) => {
      if (entry.length < 6) {
        return false;
      }
      const lower = entry.toLowerCase();
      const duplicateIndex = arr.findIndex(
        (candidate) => candidate.toLowerCase() === lower
      );
      return duplicateIndex === index;
    });
}
