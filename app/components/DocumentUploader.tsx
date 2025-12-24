"use client";

import { useState } from "react";
import type { DocumentContext } from "../../types/chat";

const MAX_TEXT_LENGTH = 50000;
const MAX_ROWS = 150;
const MAX_COLS = 12;

function truncate(text: string) {
  if (!text) return "";
  return text.length > MAX_TEXT_LENGTH ? `${text.slice(0, MAX_TEXT_LENGTH)}... [truncated]` : text;
}

async function parseCsv(file: File): Promise<string> {
  const raw = await file.text();
  return raw
    .split(/\r?\n/)
    .slice(0, MAX_ROWS)
    .join("\n");
}

async function parseXlsx(file: File): Promise<string> {
  const XLSX = await import("xlsx");
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.SheetNames[0];
  if (!sheet) return "Unable to read spreadsheet.";
  const worksheet = workbook.Sheets[sheet];
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  range.e.r = Math.min(range.e.r, MAX_ROWS);
  range.e.c = Math.min(range.e.c, MAX_COLS);
  const limitedRef = XLSX.utils.encode_range(range);
  const trimmedSheet = { ...worksheet, "!ref": limitedRef };
  return XLSX.utils.sheet_to_csv(trimmedSheet, { FS: "\t", RS: "\n" });
}

async function parseDocx(file: File): Promise<string> {
  const JSZip = await import("jszip");
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const document = zip.file("word/document.xml");
  if (!document) return "Unable to read DOCX content.";

  const xml = await document.async("text");
  const parser = new DOMParser();
  const parsed = parser.parseFromString(xml, "application/xml");
  const texts = Array.from(parsed.getElementsByTagName("w:t")).map((node) => node.textContent || "");
  return texts.join(" ");
}

async function parsePdf(file: File): Promise<{ text: string; notes?: string }> {
  try {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
    // @ts-expect-error: workerSrc property is available at runtime
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdf.worker.min.js",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      import.meta.url,
    ).toString();

    const data = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    let text = "";
    const pages = Math.min(pdf.numPages, 6);

    for (let i = 1; i <= pages; i += 1) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => (typeof item === "string" ? item : (item as { str?: string }).str || ""))
        .join(" ");
      text += `${pageText}\n\n`;
    }

    return { text };
  } catch (error) {
    return {
      text: "",
      notes: "PDF text extraction was limited. Please provide a CSV or DOCX export if you need precise parsing.",
    };
  }
}

function buildContext(file: File, text: string, notes?: string): DocumentContext {
  return {
    enabled: true,
    docName: file.name,
    docType: file.type || file.name.split(".").pop() || "unknown",
    text: truncate(text),
    notes,
    size: file.size,
  };
}

export function DocumentUploader({
  onDocumentReady,
}: {
  onDocumentReady: (context: DocumentContext) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    setIsParsing(true);

    const ext = file.name.split(".").pop()?.toLowerCase();

    try {
      let context: DocumentContext | null = null;

      switch (ext) {
        case "csv": {
          const text = await parseCsv(file);
          context = buildContext(file, text);
          break;
        }
        case "xlsx": {
          const text = await parseXlsx(file);
          context = buildContext(file, text);
          break;
        }
        case "docx": {
          const text = await parseDocx(file);
          context = buildContext(file, text);
          break;
        }
        case "pdf": {
          const { text, notes } = await parsePdf(file);
          context = buildContext(
            file,
            text || "",
            notes || (text ? undefined : "No readable text found in the PDF."),
          );
          break;
        }
        case "sav": {
          context = buildContext(
            file,
            "",
            "SPSS .sav files cannot be read directly here. Please export to CSV for full context.",
          );
          break;
        }
        default:
          context = buildContext(file, "", "Unsupported format. Please upload CSV, XLSX, DOCX, PDF, or SAV.");
      }

      onDocumentReady(context);
    } catch (parseError) {
      console.error("Document parsing error", parseError);
      setError("We could not read that file. Please try another format (CSV/XLSX/DOCX). ");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Attach a document (optional)</p>
          <p className="text-xs text-slate-500">
            Supported: CSV, XLSX, DOCX, PDF, SAV (metadata only for SAV/PDF fallback)
          </p>
        </div>
        {isParsing && <span className="text-xs text-blue-600">Parsing...</span>}
      </div>
      <label className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:border-slate-400">
        <input
          type="file"
          accept=".csv,.xlsx,.docx,.pdf,.sav"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        Click to upload or drag a file here
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
