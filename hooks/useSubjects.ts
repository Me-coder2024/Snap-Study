"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Subject } from "@/types";

export function useSubjects(semesterId?: number) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      let query = supabase.from("subjects").select("*").order("name");
      if (semesterId) {
        query = query.eq("semester_id", semesterId);
      }
      const { data } = await query;
      setSubjects(data || []);
      setLoading(false);
    }
    fetch();
  }, [semesterId]);

  return { subjects, loading };
}
