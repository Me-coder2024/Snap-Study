import { create } from "zustand";

interface AppStore {
  currentPageText: string;
  setCurrentPageText: (text: string) => void;

  aiBuddyOpen: boolean;
  setAIBuddyOpen: (open: boolean) => void;

  userRole: "student" | "admin" | null;
  setUserRole: (role: "student" | "admin" | null) => void;

  currentSubjectId: string | null;
  setCurrentSubjectId: (id: string | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  currentPageText: "",
  setCurrentPageText: (text) => set({ currentPageText: text }),

  aiBuddyOpen: true,
  setAIBuddyOpen: (open) => set({ aiBuddyOpen: open }),

  userRole: null,
  setUserRole: (role) => set({ userRole: role }),

  currentSubjectId: null,
  setCurrentSubjectId: (id) => set({ currentSubjectId: id }),
}));
