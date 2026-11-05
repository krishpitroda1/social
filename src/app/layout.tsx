import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OmniBrand Studio | Multi-Tenant AI Social Media Automation',
  description:
    'Complete, responsive, multi-tenant AI social media automation platform for holding groups and subsidiary brands.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

