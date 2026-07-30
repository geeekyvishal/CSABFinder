/**
 * Utility to extract text from PDF files using pdfjs-dist and parse choice lists
 */

export interface ParsedChoice {
  choiceNo: number;
  rawInstitute: string;
  rawProgram: string;
  rawLine?: string;
}

/**
 * Extracts raw text content from an ArrayBuffer of a PDF file using pdfjs-dist
 */
export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // Dynamic import to prevent SSR build issues in Next.js
    const pdfjsLib = await import("pdfjs-dist");
    
    // Set worker source URL
    if (typeof window !== "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
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

    return fullText;
  } catch (error) {
    console.error("PDF Extraction failed:", error);
    throw new Error("Failed to extract text from PDF file. Please ensure it is a valid PDF.");
  }
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
      line.toLowerCase().startsWith("choice no") ||
      line.toLowerCase().startsWith("choice number") ||
      line.toLowerCase().includes("locked choices") ||
      line.toLowerCase().includes("page ")
    ) {
      if (!line.match(/^\d+[\s\t,]/)) {
        continue;
      }
    }

    // Try matching line starting with choice number
    const numberedMatch = line.match(/^(\d+)[\.\s\t:]+([A-Za-z0-9\s,\.\(\)\-\&]+?)(?:\s{2,}|\t|\s*[-–|]\s*)([A-Za-z0-9\s,\.\(\)\-\&]+)$/);
    if (numberedMatch) {
      const choiceNo = parseInt(numberedMatch[1], 10);
      const rawInstitute = numberedMatch[2].trim();
      const rawProgram = numberedMatch[3].trim();

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

    // CSV format: "1,NIT Trichy,Computer Science..."
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

    // Separated by | or hyphen
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
