"use client";

import * as React from "react";

export type MoneyKind = "currency" | "percent" | "count" | "text";

export const PRIVACY_MASKS: Record<MoneyKind, string> = {
  currency: "$•••••",
  percent: "••.•%",
  count: "•••",
  text: "••••••",
};

type PrivacyContextValue = {
  isPrivate: boolean;
  toggle: () => void;
  setPrivate: (value: boolean) => void;
};

const PrivacyContext = React.createContext<PrivacyContextValue>({
  isPrivate: false,
  toggle: () => {},
  setPrivate: () => {},
});

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [isPrivate, setPrivate] = React.useState(false);
  const value = React.useMemo(
    () => ({
      isPrivate,
      setPrivate,
      toggle: () => setPrivate((v) => !v),
    }),
    [isPrivate],
  );
  return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>;
}

export function usePrivacy(): PrivacyContextValue {
  return React.useContext(PrivacyContext);
}

/** Back-compat alias used by some older call-sites. */
export function usePrivacyContext(): PrivacyContextValue {
  return React.useContext(PrivacyContext);
}

export default PrivacyContext;
