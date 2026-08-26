"use client";

import { type ComponentType, type ReactNode, Suspense, lazy, useEffect, useState } from "react";

/** Load a heavy page after first paint so SSR/dev never compile every 3D world up front. */
export function deferPage(load: () => Promise<{ default: ComponentType<any> }>, fallback: ReactNode) {
  const Lazy = lazy(load);
  return function Deferred() {
    const [on, setOn] = useState(false);
    useEffect(() => setOn(true), []);
    if (!on) return <>{fallback}</>;
    return (
      <Suspense fallback={fallback}>
        <Lazy />
      </Suspense>
    );
  };
}
