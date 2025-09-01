'use client';

import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, doc, getDocs, limit, orderBy, query, setDoc
} from 'firebase/firestore';

type VentaMes = {
  yearMonth: string;   // 'YYYY-MM'
  ventas: number;      // entero
  pctCompras?: number; // por defecto 80
};

function yyyymm(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function VentasPage() {
  const [yearMonth, setYearMonth] = useState<string>(yyyymm(new Date()));
  const [ventas, setVentas] = useState<string>(''); // string por input
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<VentaMes[]>([]);
  const pctComprasDefault = 80;

  // Carga últimos 12 registros
  useEffect(() => {
    (async () => {
      try {
        const q = query(
            collection(db, 'ventasMensuales'),
            orderBy('yearMonth', 'desc'),
            limit(12)
        );
        const snap = await getDocs(q);
        const data: VentaMes[] = [];
        snap.forEach((d) => data.push(d.data() as VentaMes));
        setRows(data);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
        // Opcional: mostrar un toast o mensaje al usuario
      }
    })()
  }, []);

  const canSave = useMemo(() => {
    const n = Number(ventas.replaceAll('.', '').replace(',', '.'));
    return yearMonth && !Number.isNaN(n) && n >= 0;
  }, [ventas, yearMonth]);

  async function handleSave() {
    if (!canSave) return;
    setLoading(true);
    try {
      const n = Math.round(Number(ventas.replaceAll('.', '').replace(',', '.')));
      const ref = doc(db, 'ventasMensuales', yearMonth);
      const payload: VentaMes = {
        yearMonth,
        ventas: n,
        pctCompras: pctComprasDefault,
      };
      await setDoc(ref, payload, { merge: true });

      // refresco local rápido
      setRows((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((r) => r.yearMonth === yearMonth);
        if (idx >= 0) copy[idx] = payload;
        else copy.unshift(payload);
        return copy.sort((a, b) => (a.yearMonth < b.yearMonth ? 1 : -1)).slice(0, 12);
      });
      setVentas('');
    } catch (error) {
        console.error("Error saving data to Firestore:", error);
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Panel izquierdo: Formulario */}
      <div className="md:col-span-1">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-medium">Cargar Ventas del Mes</h2>

          <label className="mb-2 block text-sm">Mes</label>
          <input
            type="month"
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
            className="mb-4 w-full rounded border px-3 py-2"
          />

          <label className="mb-2 block text-sm">Ventas del Mes</label>
          <input
            inputMode="numeric"
            value={ventas}
            onChange={(e) => setVentas(e.target.value)}
            placeholder="Ingrese un número entero (sin $)"
            className="mb-4 w-full rounded border px-3 py-2"
          />

          <button
            onClick={handleSave}
            disabled={!canSave || loading}
            className="w-full rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? 'Guardando…' : 'Guardar Ventas'}
          </button>

          <p className="mt-2 text-xs text-slate-500">
            Presupuesto de Compras por defecto: {pctComprasDefault}% de ventas.
          </p>
        </div>
      </div>

      {/* Panel derecho: Resumen */}
      <div className="md:col-span-2">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-medium">Resumen de Ventas Mensuales</h2>
          <div className="grid grid-cols-3 gap-3 text-sm font-medium text-slate-600">
            <div>Mes</div>
            <div className="text-right">Ventas</div>
            <div className="text-right">Presup. Compras</div>
          </div>
          <div className="mt-2 divide-y">
            {rows.map((r) => (
              <div key={r.yearMonth} className="grid grid-cols-3 gap-3 py-2 text-sm">
                <div>{r.yearMonth}</div>
                <div className="text-right">
                  {r.ventas.toLocaleString('es-AR')}
                </div>
                <div className="text-right">
                  {(Math.round((r.pctCompras ?? 80) * r.ventas) / 100).toLocaleString('es-AR')}
                </div>
              </div>
            ))}
            {rows.length === 0 && (
              <div className="py-4 text-sm text-slate-500">No hay datos de ventas mensuales.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
