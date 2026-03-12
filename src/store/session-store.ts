"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Session = {
  account: string;
  loginType: "email" | "phone";
  token: string;
};

type SessionStore = {
  session: Session | null;
  setSession: (session: Session) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: "group-buy-market-session",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
