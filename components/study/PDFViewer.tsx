"use client";

import { useState, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  pdfUrl: string;
  chapterTitle?: string;
  onPageTextChange?: (text: string, pageNumber: number) => void;
}

export default function PDFViewer({ pdfUrl, chapterTitle, onPageTextChange }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [isLoading, setIsLoading] = useState(true);

  // Cache the loaded PDFDocumentProxy so we never re-fetch the PDF for text extraction
  const pdfDocRef = useRef<any>(null);

  const onDocumentLoadSuccess = useCallback(
    async (pdf: any) => {
      pdfDocRef.current = pdf;
      setNumPages(pdf.numPages);
      setIsLoading(false);

      // Extract text from page 1 right away
      if (onPageTextChange) {
        try {
          const page = await pdf.getPage(1);
          const textContent = await page.getTextContent();
          const text = textContent.items.map((item: any) => item.str).join(" ");
          onPageTextChange(text, 1);
        } catch (err) {
          console.error("Failed to extract initial page text:", err);
        }
      }
    },
    [onPageTextChange]
  );

  const onPageRenderSuccess = useCallback(async () => {
    if (!onPageTextChange || !pdfDocRef.current) return;
    try {
      const page = await pdfDocRef.current.getPage(currentPage);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(" ");
      onPageTextChange(text, currentPage);
    } catch (err) {
      console.error("Failed to extract page text:", err);
    }
  }, [currentPage, onPageTextChange]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-semibold text-gray-900 text-sm truncate max-w-[200px]">
            {chapterTitle || "PDF Viewer"}
          </span>
        </div>

        {/* Page nav */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600 font-medium min-w-[80px] text-center">
            Page {currentPage} of {numPages || "..."}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs text-gray-500 w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF content */}
      <div className="flex-1 overflow-auto flex justify-center p-6">
        {isLoading && (
          <div className="space-y-4 w-full max-w-xl">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-[600px] w-full" />
          </div>
        )}

        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={null}
          className="shadow-md rounded-lg"
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onRenderSuccess={onPageRenderSuccess}
            loading={
              <div className="w-[600px] h-[800px] animate-pulse bg-gray-200 rounded-lg" />
            }
          />
        </Document>
      </div>
    </div>
  );
}
