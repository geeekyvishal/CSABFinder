/**
 * Utility to extract text from PDF files using pdfjs-dist (with pure JS fallback) and parse choice lists
 */

export interface ParsedChoice {
  choiceNo: number;
  rawInstitute: string;
  rawProgram: string;
  rawLine?: string;
}

/**
 * Pure JavaScript fallback PDF text stream extractor (works without workers, eval, or CSP limits)
 */
function fallbackExtractPDFText(arrayBuffer: ArrayBuffer): string {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder("latin1");
    const raw = decoder.decode(bytes);

    const extractedStrings: string[] = [];

    // Match text inside (...) Tj or [(...) ...] TJ operators
    const tjMatches = raw.matchAll(/\(([^)]+)\)\s*Tj/g);
    for (const match of tjMatches) {
      if (match[1] && match[1].trim().length > 0) {
        extractedStrings.push(match[1].trim());
      }
    }

    if (extractedStrings.length < 5) {
      const tjArrayMatches = raw.matchAll(/\[((?:\([^)]+\)\s*|[\d.-]+\s*)+)\]\s*TJ/g);
      for (const match of tjArrayMatches) {
        const innerMatches = match[1].matchAll(/\(([^)]+)\)/g);
        for (const inner of innerMatches) {
          if (inner[1] && inner[1].trim().length > 0) {
            extractedStrings.push(inner[1].trim());
          }
        }
      }
    }

    return extractedStrings.join("\n");
  } catch (e) {
    console.error("Fallback PDF extraction failed:", e);
    return "";
  }
}

/**
 * Extracts raw text content from an ArrayBuffer of a PDF file using pdfjs-dist or pure JS fallback
 */
export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // @ts-ignore
    const pdfjsLib = await import("pdfjs-dist");

    // Configure workerSrc safely without breaking ES module getter properties
    try {
      if (typeof window !== "undefined" && pdfjsLib) {
        const workerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "3.11.174"}/pdf.worker.min.js`;
        const opts = pdfjsLib.GlobalWorkerOptions;
        if (opts) {
          try {
            opts.workerSrc = workerUrl;
          } catch {
            Object.defineProperty(opts, "workerSrc", {
              value: workerUrl,
              writable: true,
              configurable: true,
            });
          }
        }
      }
    } catch (e) {
      console.warn("Could not set GlobalWorkerOptions.workerSrc:", e);
    }

    // Disable eval to comply with site Content Security Policy (CSP)
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      let lastY: number | null = null;
      let pageText = "";

      for (const item of content.items as any[]) {
        if (!item.str) continue;

        // If Y coordinate changed significantly, insert a newline
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          pageText += "\n";
        } else if (pageText && !pageText.endsWith("\n") && !pageText.endsWith(" ")) {
          pageText += " ";
        }

        pageText += item.str;
        lastY = item.transform[5];
      }

      fullText += pageText + "\n--- PAGE BREAK ---\n";
    }

    if (fullText.trim().length > 20) {
      return fullText;
    }
  } catch (error: any) {
    console.warn("pdfjs-dist extraction failed or blocked by CSP, switching to pure JS stream extractor:", error);
  }

  // Pure JS Fallback if pdfjs-dist was blocked by CSP or worker error
  const fallbackText = fallbackExtractPDFText(arrayBuffer);
  if (fallbackText.trim().length > 0) {
    return fallbackText;
  }

  throw new Error("Could not extract text from PDF. Please ensure the PDF is valid or copy-paste your choices directly into the text tab.");
}

/**
 * Common program start keywords in CSAB / JoSAA choice lists
 */
const PROGRAM_KEYWORDS = [
  "computer science",
  "electronics and communication",
  "electronics & communication",
  "electrical engineering",
  "mechanical engineering",
  "civil engineering",
  "chemical engineering",
  "information technology",
  "data science",
  "artificial intelligence",
  "bio technology",
  "biotechnology",
  "biomedical",
  "aerospace",
  "metallurgical",
  "materials engineering",
  "production engineering",
  "industrial",
  "instrumentation",
  "mechatronics",
  "architecture",
  "planning",
  "mathematics and computing",
  "physics",
  "chemistry",
  "engineering physics",
];

/**
 * Splits combined row text into Institute Name and Academic Program Name
 */
function splitInstAndProg(rowText: string): { institute: string; program: string } | null {
  const lowerText = rowText.toLowerCase();

  // Find earliest matching program keyword
  let bestKeywordIdx = -1;

  for (const kw of PROGRAM_KEYWORDS) {
    const idx = lowerText.indexOf(kw);
    if (idx !== -1) {
      if (bestKeywordIdx === -1 || idx < bestKeywordIdx) {
        bestKeywordIdx = idx;
      }
    }
  }

  if (bestKeywordIdx !== -1) {
    let inst = rowText.substring(0, bestKeywordIdx).trim();
    let prog = rowText.substring(bestKeywordIdx).trim();

    // Remove trailing number if present (e.g. "New Choice No" column at the end of the row)
    prog = prog.replace(/\s+\d+$/, "").trim();
    inst = inst.replace(/,$/, "").trim();

    if (inst.length >= 3 && prog.length >= 3) {
      return { institute: inst, program: prog };
    }
  }

  return null;
}

/**
 * Parses raw text extracted from PDF or pasted string into structured choices
 */
export function parseChoicesFromText(text: string): ParsedChoice[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.includes("--- PAGE BREAK ---"));

  const choices: ParsedChoice[] = [];
  let choiceCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip known header lines
    if (
      line.toLowerCase().startsWith("dasa and csab") ||
      line.toLowerCase().startsWith("nits, iiits") ||
      line.toLowerCase().startsWith("choice rearrange") ||
      line.toLowerCase().startsWith("total submitted choices") ||
      line.toLowerCase().startsWith("choice no") ||
      line.toLowerCase().startsWith("choice number") ||
      line.toLowerCase().includes("locked choices") ||
      line.toLowerCase().includes("page ")
    ) {
      if (!line.match(/^\d+[\s\t,]/)) {
        continue;
      }
    }

    // Pattern 1: Official CSAB 2026 Choice Rearrange Table Row
    const numberMatch = line.match(/^(\d+)[\s\t\.:,]+(.*)$/);
    if (numberMatch) {
      const choiceNo = parseInt(numberMatch[1], 10);
      const restOfLine = numberMatch[2].trim();

      const splitResult = splitInstAndProg(restOfLine);
      if (splitResult) {
        choices.push({
          choiceNo: choiceNo || choiceCounter++,
          rawInstitute: splitResult.institute,
          rawProgram: splitResult.program,
          rawLine: line,
        });
        continue;
      }

      // Regex match for double spaces, tabs, or hyphens/pipes
      const regexMatch = restOfLine.match(/^([A-Za-z0-9\s,\.\(\)\-\&\']+?)(?:\s{2,}|\t|\s*[-–|]\s*)([A-Za-z0-9\s,\.\(\)\-\&\']+)/);
      if (regexMatch) {
        const rawInstitute = regexMatch[1].trim();
        const rawProgram = regexMatch[2].replace(/\s+\d+$/, "").trim();

        if (rawInstitute.length >= 3 && rawProgram.length >= 3) {
          choices.push({
            choiceNo: choiceNo || choiceCounter++,
            rawInstitute,
            rawProgram,
            rawLine: line,
          });
          continue;
        }
      }
    }

    // Pattern 2: CSV format: "1,NIT Trichy,Computer Science..."
    if (line.includes(",")) {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 3) {
        const potentialNum = parseInt(parts[0], 10);
        if (!isNaN(potentialNum) && parts[1].length > 3 && parts[2].length > 3) {
          choices.push({
            choiceNo: potentialNum,
            rawInstitute: parts[1],
            rawProgram: parts.slice(2).join(", "),
            rawLine: line,
          });
          continue;
        }
      }
    }

    // Pattern 3: Separated by | or hyphen
    if (line.includes("|") || line.includes(" - ")) {
      const parts = line.split(/\||\s-\s/).map((p) => p.trim());
      if (parts.length >= 2) {
        let choiceNo = choiceCounter++;
        let instIdx = 0;
        let progIdx = 1;

        const firstNumMatch = parts[0].match(/^(\d+)[\s\.]+(.*)$/);
        if (firstNumMatch) {
          choiceNo = parseInt(firstNumMatch[1], 10);
          parts[0] = firstNumMatch[2];
        }

        if (parts.length >= 3 && !isNaN(parseInt(parts[0], 10))) {
          choiceNo = parseInt(parts[0], 10);
          instIdx = 1;
          progIdx = 2;
        }

        if (parts[instIdx] && parts[progIdx]) {
          choices.push({
            choiceNo,
            rawInstitute: parts[instIdx],
            rawProgram: parts[progIdx],
            rawLine: line,
          });
          continue;
        }
      }
    }
  }

  // Fallback: Keyword-based line scanning
  if (choices.length === 0) {
    let currentInst = "";
    let currentProg = "";
    let currentChoiceNo = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const isInst =
        line.match(/national institute/i) ||
        line.match(/indian institute/i) ||
        line.match(/institute of technology/i) ||
        line.match(/\b(NIT|IIIT|BIT|PEC|DTU|NSUT)\b/i);

      const isProg =
        line.match(/engineering/i) ||
        line.match(/technology/i) ||
        line.match(/bachelor of/i) ||
        line.match(/architecture/i) ||
        line.match(/\b(computer|electrical|electronics|mechanical|civil|chemical|biotechnology)\b/i);

      if (isInst && !isProg) {
        currentInst = line;
      } else if (isProg && currentInst) {
        currentProg = line;
        choices.push({
          choiceNo: currentChoiceNo++,
          rawInstitute: currentInst,
          rawProgram: currentProg,
        });
        currentInst = "";
        currentProg = "";
      }
    }
  }

  return choices;
}
