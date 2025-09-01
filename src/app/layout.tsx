
import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers/AppProviders';
import { AppLayout } from '@/components/AppLayout';
import { Toaster } from '@/components/ui/toaster';
import ConfigBanner from "@/components/system/ConfigBanner";
import './globals.css';

export const metadata: Metadata = {
  title: 'Proyección de Compras',
  description: 'Planifica compras, compromisos y disponibilidad',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ConfigBanner />
        <AppProviders>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
