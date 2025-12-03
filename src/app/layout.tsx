import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Client/Server Boundary Checker',
  description: 'Analyze JavaScript/TypeScript code to determine if it can run on the client, server, or both in a Next.js App Router environment.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
