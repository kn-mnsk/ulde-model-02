// ulde/integration/react/ulde-react-provider.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DefaultUldeHostApi } from '../../core/host/ulde-host-api';
import { UldePhaseContext } from '../../core/lifecycle/ulde-phase-context';
import { UldeConfig } from '../../core/config/ulde-config';

const UldeContext = createContext<any>(null);

export function UldeProvider({ children }: { children: ReactNode }) {
  const host = new DefaultUldeHostApi();
  const [result, setResult] = useState<UldePhaseContext | null>(null);

  async function render(content: string, config?: UldeConfig) {
    const ctx = await host.render(content, config);
    setResult(ctx);
  }

  return (
    <UldeContext.Provider value={{ render, result }}>
      {children}
    </UldeContext.Provider>
  );
}

export function useUlde() {
  return useContext(UldeContext);
}
