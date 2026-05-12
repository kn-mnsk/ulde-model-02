// ulde/integration/react/UldeViewer.tsx

import React, { useEffect, useRef, useContext } from 'react';
import  {UldeContext } from './ulde-react-provider';

export function UldeViewer({ content }: {content: any}) {
  const host = useContext(UldeContext);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (host && ref.current) {
      host.run(ref.current, content);
    }
  }, [content]);

  return <div ref={ref} className="ulde-viewer"></div>;
}
