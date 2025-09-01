
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/AppLayout';
import { AppProviders } from '@/components/providers/AppProviders';
import ConfigBanner from '@/components/system/ConfigBanner';

export const metadata = {
  title: 'Proyección de Compras',
  description: 'Gestión de ventas y presupuesto de compras',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background font-sans antialiased">
        <ConfigBanner />
        <AppProviders>
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
