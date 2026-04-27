"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PDFViewer from "@/components/study/PDFViewer";
import AIBuddy from "@/components/study/AIBuddy";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Chapter } from "@/types";

export default function StudyPage() {
  const params = useParams();
  const chapterId = params.chapterId as string;
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [currentPageText, setCurrentPageText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChapter() {
      const supabase = createClient();

      const { data: chapterData } = await supabase
        .from("chapters")
        .select("*")
        .eq("id", chapterId)
        .single();

      if (chapterData?.pdf_url) {
        const url = chapterData.pdf_url;

        // If it's already a full URL (public URL from storage), use it directly
        if (url.startsWith("http://") || url.startsWith("https://")) {
          setPdfUrl(url);
        } else {
          // It's a relative path — try to create a signed URL from the 'pdfs' bucket
          const { data: signedUrlData } = await supabase.storage
            .from("pdfs")
            .createSignedUrl(url, 3600);

          if (signedUrlData) {
            setPdfUrl(signedUrlData.signedUrl);
          } else {
            // Fallback: try to get public URL
            const { data: publicData } = supabase.storage
              .from("pdfs")
              .getPublicUrl(url);
            if (publicData?.publicUrl) {
              setPdfUrl(publicData.publicUrl);
            }
          }
        }
      }

      setChapter(chapterData);
      setLoading(false);
    }
    fetchChapter();
  }, [chapterId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F8FC]">
        <LoadingSpinner size="lg" text="Loading chapter..." />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F8FC]">
        <p className="text-gray-500">Chapter not found</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop: split screen */}
      <div className="hidden md:flex h-screen pt-16">
        <div className="w-[65%] h-full">
          {pdfUrl ? (
            <PDFViewer
              pdfUrl={pdfUrl}
              chapterTitle={chapter.title}
              onPageTextChange={setCurrentPageText}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <p className="text-gray-500">No PDF uploaded for this chapter</p>
            </div>
          )}
        </div>
        <div className="w-[35%] h-full">
          <AIBuddy currentPageText={currentPageText} chapterId={chapterId} />
        </div>
      </div>

      {/* Mobile: tabs */}
      <div className="md:hidden pt-20 px-4 pb-4 min-h-screen bg-[#F8F8FC]">
        <Tabs defaultValue="pdf">
          <TabsList className="w-full bg-gray-100 rounded-xl">
            <TabsTrigger value="pdf" className="flex-1 rounded-lg">PDF</TabsTrigger>
            <TabsTrigger value="buddy" className="flex-1 rounded-lg">AI Buddy</TabsTrigger>
          </TabsList>
          <TabsContent value="pdf" className="mt-4">
            <div className="h-[70vh] rounded-xl overflow-hidden border border-gray-200">
              {pdfUrl ? (
                <PDFViewer
                  pdfUrl={pdfUrl}
                  chapterTitle={chapter.title}
                  onPageTextChange={setCurrentPageText}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <p className="text-gray-500">No PDF uploaded</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="buddy" className="mt-4">
            <div className="h-[70vh] rounded-xl overflow-hidden border border-gray-200">
              <AIBuddy currentPageText={currentPageText} chapterId={chapterId} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
