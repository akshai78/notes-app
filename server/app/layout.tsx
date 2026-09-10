import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Code Red',
  description: 'Notes sync API',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          background: '#F4F5F7',
          color: '#1A1A1A',
        }}>
        {children}
      </body>
    </html>
  );
}
