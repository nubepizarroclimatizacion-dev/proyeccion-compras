import './globals.css';

export const metadata = {
  title: 'Proyección de Compras',
  description: 'Gestión de ventas y presupuesto de compras',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold">Proyección de Compras</h1>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
