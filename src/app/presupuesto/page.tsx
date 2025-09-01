'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthPicker } from '@/components/MonthPicker';
import { toYm, fromYm } from '@/lib/ym';
import { getVentas, getSettingsGlobal, listCompromisosByYm, listComprasByYm } from '@/lib/queries';
import { formatArs } from '@/lib/currency';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PresupuestoData {
    ventas: number;
    percentCompras: number;
    compromisosPlan: number;
    compromisosPagado: number;
    compras: number;
}

const StatCard = ({ title, value, isLoading }: { title: string, value: string | number, isLoading: boolean }) => (
    <div className="flex items-center justify-between rounded-lg border p-4">
        <p className="text-sm font-medium">{title}</p>
        {isLoading ? <Skeleton className="h-6 w-28" /> : <p className="text-lg font-bold">{typeof value === 'number' ? formatArs(value) : value}</p>}
    </div>
)

export default function PresupuestoPage() {
    const [ym, setYm] = useState(toYm(new Date()));
    const [data, setData] = useState<PresupuestoData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [usePagado, setUsePagado] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [ventasData, settings, compromisosData, comprasData] = await Promise.all([
                getVentas(ym),
                getSettingsGlobal(),
                listCompromisosByYm(ym),
                listComprasByYm(ym)
            ]);

            const compromisosPlan = compromisosData.reduce((sum, c) => sum + c.plan, 0);
            const compromisosPagado = compromisosData.reduce((sum, c) => sum + c.pagado, 0);
            const compras = comprasData.reduce((sum, c) => sum + c.monto, 0);

            setData({
                ventas: ventasData?.ventas ?? 0,
                percentCompras: settings.percentCompras,
                compromisosPlan,
                compromisosPagado,
                compras,
            });
            setIsLoading(false);
        };
        fetchData();
    }, [ym]);

    const presupuesto = useMemo(() => {
        if (!data) return { presupuestoBruto: 0, disponibleParaCompras: 0, disponibleFinal: 0, progreso: 0 };

        const presupuestoBruto = (data.ventas * data.percentCompras) / 100;
        const compromisosConsiderados = usePagado ? data.compromisosPagado : data.compromisosPlan;
        const disponibleParaCompras = presupuestoBruto - compromisosConsiderados;
        const disponibleFinal = disponibleParaCompras - data.compras;
        
        const progreso = presupuestoBruto > 0 ? ((presupuestoBruto - disponibleFinal) / presupuestoBruto) * 100 : 0;

        return { presupuestoBruto, disponibleParaCompras, disponibleFinal, progreso };
    }, [data, usePagado]);
    
    const monthName = format(fromYm(ym), "MMMM yyyy", { locale: es });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <h2 className="text-2xl font-bold tracking-tight capitalize">
                    Presupuesto de {monthName}
                </h2>
                <MonthPicker label="Seleccionar Mes" value={ym} onChange={setYm} />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Ventas del Mes" value={data?.ventas ?? 0} isLoading={isLoading} />
                <StatCard title="% para Compras" value={data ? `${data.percentCompras}%` : "..."} isLoading={isLoading} />
                <StatCard title="Presupuesto Bruto" value={presupuesto.presupuestoBruto} isLoading={isLoading} />
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Análisis del Presupuesto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <p className="text-sm font-medium">(-) Compromisos del Mes</p>
                            <p className="text-xs text-muted-foreground">Se resta del presupuesto bruto.</p>
                        </div>
                        <div className="flex items-center space-x-2">
                             <Label htmlFor="use-pagado">Usar Pagado</Label>
                             <Switch id="use-pagado" checked={usePagado} onCheckedChange={setUsePagado} disabled={isLoading} />
                        </div>
                        {isLoading ? <Skeleton className="h-6 w-28" /> : <p className="text-lg font-bold text-red-600">-{formatArs(usePagado ? data?.compromisosPagado ?? 0 : data?.compromisosPlan ?? 0)}</p>}
                    </div>

                    <StatCard title="(=) Disponible para Compras" value={presupuesto.disponibleParaCompras} isLoading={isLoading} />
                    
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <p className="text-sm font-medium">(-) Compras Realizadas</p>
                        {isLoading ? <Skeleton className="h-6 w-28" /> : <p className="text-lg font-bold text-red-600">-{formatArs(data?.compras ?? 0)}</p>}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Disponible Final</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    {isLoading ? (
                        <Skeleton className="h-16 w-1/2 mx-auto" />
                    ) : (
                        <p className={`text-5xl font-extrabold ${presupuesto.disponibleFinal < 0 ? 'text-destructive' : 'text-green-600'}`}>
                            {formatArs(presupuesto.disponibleFinal)}
                        </p>
                    )}
                    <Progress value={presupuesto.progreso} className="mt-4 h-4" />
                    <p className="text-sm text-muted-foreground mt-2">
                        {isLoading ? <Skeleton className="h-4 w-1/4 mx-auto"/> : <>Has utilizado el {presupuesto.progreso.toFixed(2)}% de tu presupuesto bruto.</>}
                    </p>
                </CardContent>
            </Card>

            {presupuesto.disponibleFinal < 0 && !isLoading && (
                 <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>¡Atención!</AlertTitle>
                    <AlertDescription>
                        Tu disponible final es negativo. Has excedido tu presupuesto para este mes.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
