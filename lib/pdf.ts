// Client-side PDF rendering and text extraction utility
// Uses locally vendored PDF.js (in /public/pdfjs/) to ensure 100% offline support
// and prevent SSR/Turbopack bundler conflicts.

export interface RenderedPdfPage {
  pageNumber: number;
  dataUrl: string; // JPEG data URL
  width: number;
  height: number;
}

export interface ProcessedPdf {
  pages: RenderedPdfPage[];
  totalPages: number;
  extractedText: string;
  firstPageImage: string;
  isRawPdf?: boolean;
}

// Global reference type for dynamically loaded PDF.js
interface PdfJsLib {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  getDocument: (params: { data: ArrayBuffer | Uint8Array }) => {
    promise: Promise<PdfDocument>;
  };
}

interface PdfDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
}

interface PdfPage {
  getViewport: (params: { scale: number }) => { width: number; height: number };
  render: (params: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
  }) => { promise: Promise<void> };
  getTextContent: () => Promise<{
    items: Array<{ str?: string }>;
  }>;
}

declare global {
  interface Window {
    pdfjsLib?: PdfJsLib;
  }
}

let pdfJsPromise: Promise<PdfJsLib> | null = null;

export async function loadPdfJs(): Promise<PdfJsLib> {
  if (typeof window === "undefined") {
    throw new Error("PDF processing is only supported in browser environment");
  }

  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";
    return window.pdfjsLib;
  }

  if (pdfJsPromise) {
    return pdfJsPromise;
  }

  pdfJsPromise = new Promise<PdfJsLib>((resolve, reject) => {
    const existingScript = document.querySelector('script[src="/pdfjs/pdf.min.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";
          resolve(window.pdfjsLib);
        } else {
          reject(new Error("pdfjsLib not defined after script load"));
        }
      });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load PDF engine")));
      return;
    }

    const script = document.createElement("script");
    script.src = "/pdfjs/pdf.min.js";
    script.async = true;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";
        resolve(window.pdfjsLib);
      } else {
        reject(new Error("pdfjsLib not defined after script load"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load PDF engine (/pdfjs/pdf.min.js)"));
    document.head.appendChild(script);
  });

  return pdfJsPromise;
}

/**
 * Process an uploaded PDF file:
 * 1. Renders pages (up to maxPages) to sharp, high-contrast JPEG data URLs.
 * 2. Extracts textual content from pages to aid model accuracy.
 */
export async function processPdfClientSide(
  file: File,
  maxPagesToRender: number = 3
): Promise<ProcessedPdf> {
  try {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const totalPages = pdfDoc.numPages;
    const pagesToRenderCount = Math.min(totalPages, maxPagesToRender);
    const pages: RenderedPdfPage[] = [];
    const textChunks: string[] = [];

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);

      // Extract text content from up to 5 pages
      if (pageNum <= 5) {
        try {
          const textContent = await page.getTextContent();
          const pageStrings = textContent.items
            .map((item) => item.str || "")
            .filter((s) => s.trim().length > 0);
          if (pageStrings.length > 0) {
            textChunks.push(`--- Page ${pageNum} ---\n` + pageStrings.join(" "));
          }
        } catch (textErr) {
          console.warn(`Failed to extract text for page ${pageNum}:`, textErr);
        }
      }

      // Render page visually
      if (pageNum <= pagesToRenderCount) {
        // Calculate scale for sharp text rendering (~1400px width/height)
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const targetDimension = 1400;
        const scale = Math.min(
          2.0,
          Math.max(1.0, targetDimension / Math.max(unscaledViewport.width, unscaledViewport.height))
        );
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        const ctx = canvas.getContext("2d", { willReadFrequently: false });

        if (!ctx) {
          throw new Error("Unable to create canvas 2D context for PDF rendering");
        }

        // Fill white background for transparent PDFs
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        pages.push({
          pageNumber: pageNum,
          dataUrl,
          width: canvas.width,
          height: canvas.height,
        });
      }
    }

    if (pages.length === 0) {
      throw new Error("No pages could be rendered from PDF");
    }

    return {
      pages,
      totalPages,
      extractedText: textChunks.join("\n\n"),
      firstPageImage: pages[0].dataUrl,
    };
  } catch (error) {
    console.warn("Client-side PDF canvas rendering failed, falling back to raw PDF:", error);
    // Fallback: Read file as base64 data URL
    const rawDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read raw PDF file"));
      reader.readAsDataURL(file);
    });

    return {
      pages: [],
      totalPages: 1,
      extractedText: "",
      firstPageImage: rawDataUrl,
      isRawPdf: true,
    };
  }
}
