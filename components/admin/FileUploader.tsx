"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  bucket: string;
  storagePath: string;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  onUploadComplete: (url: string) => void;
}

export default function FileUploader({ bucket, storagePath, accept = ".pdf", maxSizeMB = 50, label, onUploadComplete }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function handleFile(f: File) {
    setError("");
    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max ${maxSizeMB}MB.`);
      return;
    }
    setFile(f);
    setUploading(true);
    setStatus("uploading");
    setProgress(30);

    try {
      const supabase = createClient();
      setProgress(60);
      const { data, error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, f, { upsert: true });
      if (uploadError) throw uploadError;
      setProgress(100);
      setStatus("done");
      onUploadComplete(data.path);
      toast({ title: "Uploaded!", description: f.name });
    } catch (err: any) {
      setStatus("error");
      setError(err.message);
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
    setUploading(false);
  }

  return (
    <div className={cn("border-2 border-dashed rounded-xl p-6 text-center transition-colors", status === "error" ? "border-red-300 bg-red-50" : status === "done" ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-primary/40 bg-gray-50")}>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {status === "done" ? (
        <div className="flex flex-col items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
          <p className="text-sm font-medium text-green-700">Uploaded: {file?.name}</p>
        </div>
      ) : status === "error" ? (
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => { setStatus("idle"); setError(""); }} className="text-xs text-primary hover:underline">Try again</button>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} disabled={uploading} className="flex flex-col items-center gap-2 w-full">
          {uploading ? <Loader2 className="w-8 h-8 text-primary animate-spin" /> : <Upload className="w-8 h-8 text-gray-400" />}
          <p className="text-sm text-gray-600">{label || "Click to upload or drag and drop"}</p>
          <p className="text-xs text-gray-400">{accept} · Max {maxSizeMB}MB</p>
        </button>
      )}

      {uploading && <Progress value={progress} className="mt-4 h-1.5" />}
    </div>
  );
}
