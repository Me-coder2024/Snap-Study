"use client";

import { useState, useCallback } from "react";

export function usePDFViewer(pdfUrl: string) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [currentPageText, setCurrentPageText] = useState("");

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= numPages) {
        setCurrentPage(page);
      }
    },
    [numPages]
  );

  const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
  const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);
  const zoomIn = useCallback(() => setScale((s) => Math.min(2.5, s + 0.2)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(0.5, s - 0.2)), []);

  return {
    numPages, setNumPages,
    currentPage, setCurrentPage,
    scale, setScale,
    currentPageText, setCurrentPageText,
    goToPage, nextPage, prevPage, zoomIn, zoomOut,
  };
}
