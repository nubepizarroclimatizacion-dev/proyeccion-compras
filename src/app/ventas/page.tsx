'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MonthPicker } from '@/components/MonthPicker';
import { MoneyInput } from '@/components/MoneyInput';
import { getVentas, setVentas, listUltimasVentas, getSettingsGlobal, listCompromisosByYm, listComprasByYm } from '@/lib/queries';
import { toYm, fromYm } from '@/lib/ym';
import { useConnection } from '@/hooks/use-connection';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatArs } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import type { VentasMes, SettingsGlobal, CompromisoDia, Compra } from '@/lib/schemas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function VentasForm({ ym, onSave }: { ym: string; onSave: () => void }) {
  const [ventas, setVentas] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { isOnline } = useConnection();
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    getVentas(ym).then((data) => {
      setVentas(data?.ventas ?? 0);
      setIsLoading(false);
    });
  }, [ym]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setVentas(ym, ventas);
      toast({ title: 'Éxito', description: 'Ventas guardadas correctamente.' });
      onSave();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar las ventas.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas del Mes Seleccionado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="ventas-mes">Monto de Ventas</Label>
            <MoneyInput id="ventas-mes" value={ventas} onChange={setVentas} placeholder="Ingrese el total de ventas" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={!isOnline || isSaving || isLoading}>
          {isSaving ? 'Guardando...' : 'Guardar Ventas'}
        </Button>
      </CardFooter>
    </Card>
  );
}

type ResumenMes = {
    ym: string;
    ventas: number;
    presupuesto: number;
    disponible: number;
}

function ResumenAnual() {
    const [data, setData] = useState<ResumenMes[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [settings, ultimasVentas] = await Promise.all([getSettingsGlobal(), listUltimasVentas(12)]);
        
        const yms = ultimasVentas.map(v => v.ym);
        
        const compromisosPromises = yms.map(ym => listCompromisosByYm(ym));
        const comprasPromises = yms.map(ym => listComprasByYm(ym));
        
        const allCompromisos = await Promise.all(compromisosPromises);
        const allCompras = await Promise.all(comprasPromises);
        
        const compromisosMap = new Map(yms.map((ym, i) => [ym, allCompromisos[i]]));
        const comprasMap = new Map(yms.map((ym, i) => [ym, allCompras[i]]));
        
        const resumen = ultimasVentas.map(venta => {
            const presupuesto = (venta.ventas * settings.percentCompras) / 100;
            const totalCompromisos = (compromisosMap.get(venta.ym) || []).reduce((acc, c) => acc + c.plan, 0);
            const totalCompras = (comprasMap.get(venta.ym) || []).reduce((acc, c) => acc + c.monto, 0);
            const disponible = presupuesto - totalCompromisos - totalCompras;
            
            return {
                ym: venta.ym,
                ventas: venta.ventas,
                presupuesto,
                disponible,
            };
        });
        
        setData(resumen);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const formatMonth = (ym: string) => {
        const date = fromYm(ym);
        return format(date, "MMMM yyyy", { locale: es });
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader><CardTitle>Resumen Últimos 12 Meses</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader><CardTitle>Resumen Últimos 12 Meses</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mes</TableHead>
                            <TableHead className="text-right">Ventas</TableHead>
                            <TableHead className="text-right">Presupuesto</TableHead>
                            <TableHead className="text-right">Disponible</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map(mes => (
                            <TableRow key={mes.ym}>
                                <TableCell className="font-medium capitalize">{formatMonth(mes.ym)}</TableCell>
                                <TableCell className="text-right">{formatArs(mes.ventas)}</TableCell>
                                <TableCell className="text-right">{formatArs(mes.presupuesto)}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={mes.disponible < 0 ? 'destructive' : 'default'}>{formatArs(mes.disponible)}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}


export default function VentasPage() {
  const [ym, setYm] = useState(toYm(new Date()));
  const [key, setKey] = useState(0); // to force re-render of summary

  const handleSave = () => {
    setKey(prev => prev + 1); // Trigger re-fetch in summary
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <MonthPicker label="Seleccionar Mes" value={ym} onChange={setYm} />
        <VentasForm ym={ym} onSave={handleSave} />
      </div>
      <div className="lg:col-span-2">
        <ResumenAnual key={key} />
      </div>
    </div>
  );
}
