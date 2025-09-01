'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthPicker } from '@/components/MonthPicker';
import { MoneyInput } from '@/components/MoneyInput';
import { daysOfMonth, toYm, fromYm } from '@/lib/ym';
import { cn } from '@/lib/utils';
import { listCompromisosByYm, upsertCompromisoDia } from '@/lib/queries';
import type { CompromisoDia } from '@/lib/schemas';
import { useConnection } from '@/hooks/use-connection';
import { useToast } from '@/hooks/use-toast';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { formatArs } from '@/lib/currency';
import { useDebouncedCallback } from 'use-debounce';

const weekDays = ['Sábado', 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

function DayCell({ day, compromiso, onUpdate, ym }: { day: any, compromiso: CompromisoDia | undefined, onUpdate: (data: Partial<CompromisoDia>) => void, ym: string }) {
    const { isOnline } = useConnection();
    const { toast } = useToast();

    const debouncedUpdate = useDebouncedCallback(async (data: Partial<CompromisoDia>) => {
        try {
            await upsertCompromisoDia({ ...data, fecha: day.date, ym });
            onUpdate(data);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el cambio." });
        }
    }, 1000);

    const handlePlanChange = (value: number) => {
        if (isOnline) {
            debouncedUpdate({ plan: value });
        }
    };

    const handlePagadoChange = (value: number) => {
        if (isOnline) {
            debouncedUpdate({ pagado: value });
        }
    };

    return (
        <div className={cn("border rounded-md p-2 flex flex-col gap-2 min-h-[140px]", day.isCurrentMonth ? 'bg-card' : 'bg-muted/50')}>
            <span className={cn("font-bold", day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground')}>
                {format(parse(day.date, 'yyyy-MM-dd', new Date()), 'd')}
            </span>
            <div className="space-y-1 text-xs">
                <label>Plan</label>
                <MoneyInput value={compromiso?.plan ?? 0} onChange={handlePlanChange} disabled={!isOnline} placeholder="Plan" className="h-8" />
            </div>
            <div className="space-y-1 text-xs">
                <label>Pagado</label>
                <MoneyInput value={compromiso?.pagado ?? 0} onChange={handlePagadoChange} disabled={!isOnline} placeholder="Pagado" className="h-8" />
            </div>
        </div>
    );
}

export default function CompromisosPage() {
    const [ym, setYm] = useState(toYm(new Date()));
    const [compromisos, setCompromisos] = useState<Map<string, CompromisoDia>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    const calendarDays = useMemo(() => daysOfMonth(ym), [ym]);

    const fetchCompromisos = useCallback(async (currentYm: string) => {
        setIsLoading(true);
        const data = await listCompromisosByYm(currentYm);
        const map = new Map(data.map(c => [c.fecha, c]));
        setCompromisos(map);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchCompromisos(ym);
    }, [ym, fetchCompromisos]);

    const handleUpdate = useCallback((data: Partial<CompromisoDia>) => {
        if (data.fecha) {
            setCompromisos(prev => {
                const newMap = new Map(prev);
                const existing = newMap.get(data.fecha!) || { fecha: data.fecha!, ym, plan: 0, pagado: 0 };
                newMap.set(data.fecha!, { ...existing, ...data });
                return newMap;
            });
        }
    }, [ym]);

    const totals = useMemo(() => {
        const weekTotals: { [key: number]: { plan: number, pagado: number } } = {};
        let monthPlan = 0;
        let monthPagado = 0;

        calendarDays.forEach(day => {
            if (day.isCurrentMonth) {
                const compromiso = compromisos.get(day.date);
                if (compromiso) {
                    if (!weekTotals[day.weekIndex]) {
                        weekTotals[day.weekIndex] = { plan: 0, pagado: 0 };
                    }
                    weekTotals[day.weekIndex].plan += compromiso.plan;
                    weekTotals[day.weekIndex].pagado += compromiso.pagado;
                    monthPlan += compromiso.plan;
                    monthPagado += compromiso.pagado;
                }
            }
        });
        return { weekTotals, monthPlan, monthPagado };
    }, [calendarDays, compromisos]);

    const monthName = format(fromYm(ym), "MMMM yyyy", { locale: es });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <CardTitle className="capitalize">Compromisos de {monthName}</CardTitle>
                            <MonthPicker value={ym} onChange={setYm} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm mb-2">
                            {weekDays.map(day => <div key={day}>{day}</div>)}
                        </div>
                        {isLoading ? (
                            <div className="grid grid-cols-7 gap-2">
                                {[...Array(35)].map((_, i) => <Skeleton key={i} className="h-36" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-7 gap-2">
                                {calendarDays.map(day => (
                                    <DayCell
                                        key={day.date}
                                        day={day}
                                        compromiso={compromisos.get(day.date)}
                                        onUpdate={handleUpdate}
                                        ym={ym}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader><CardTitle>Totales Semanales</CardTitle></CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        {Object.entries(totals.weekTotals).map(([weekIndex, totals]) => (
                            <div key={weekIndex} className="p-2 border rounded-md">
                                <h4 className="font-bold mb-2">Semana {parseInt(weekIndex) + 1}</h4>
                                <div className="flex justify-between"><span>Plan:</span> <span>{formatArs(totals.plan)}</span></div>
                                <div className="flex justify-between"><span>Pagado:</span> <span>{formatArs(totals.pagado)}</span></div>
                                <div className="flex justify-between font-semibold mt-1"><span>Diferencia:</span> <span>{formatArs(totals.plan - totals.pagado)}</span></div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Total del Mes</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between font-bold"><span>Plan Total:</span> <span>{formatArs(totals.monthPlan)}</span></div>
                        <div className="flex justify-between font-bold"><span>Pagado Total:</span> <span>{formatArs(totals.monthPagado)}</span></div>
                        <hr className="my-2"/>
                        <div className="flex justify-between font-extrabold text-base"><span>Diferencia:</span> <span>{formatArs(totals.monthPlan - totals.monthPagado)}</span></div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
