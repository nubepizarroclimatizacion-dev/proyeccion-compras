'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MonthPicker } from '@/components/MonthPicker';
import { MoneyInput } from '@/components/MoneyInput';
import { listComprasByYm, addCompra, deleteCompra } from '@/lib/queries';
import { toYm } from '@/lib/ym';
import { useConnection } from '@/hooks/use-connection';
import { useToast } from '@/hooks/use-toast';
import { CompraSchema, type Compra } from '@/lib/schemas';
import { formatDisplayDate } from '@/lib/ym';
import { formatArs } from '@/lib/currency';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Sparkles, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { suggestPurchaseCategory } from '@/ai/flows/suggest-purchase-category';

function ComprasForm({ ym, onAdd }: { ym: string, onAdd: () => void }) {
  const { isOnline } = useConnection();
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const form = useForm<z.infer<typeof CompraSchema>>({
    resolver: zodResolver(CompraSchema),
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      ym: ym,
      monto: 0,
      categoria: '',
      nota: '',
    },
  });

  useEffect(() => {
    form.setValue('ym', ym);
  }, [ym, form]);
  
  const onSubmit = async (values: z.infer<typeof CompraSchema>) => {
    try {
      await addCompra(values);
      toast({ title: 'Éxito', description: 'Compra agregada correctamente.' });
      form.reset();
      form.setValue('monto', 0); // reset money input specifically
      form.setValue('fecha', new Date().toISOString().split('T')[0]);
      form.setValue('ym', ym);
      onAdd();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo agregar la compra.' });
    }
  };

  const handleSuggestCategory = async () => {
    const description = form.getValues('nota');
    if (!description) {
        toast({ variant: 'destructive', title: 'Error', description: 'Ingresa una nota o descripción para sugerir una categoría.' });
        return;
    }
    setIsSuggesting(true);
    try {
        const result = await suggestPurchaseCategory({ description });
        if (result.category) {
            form.setValue('categoria', result.category, { shouldValidate: true });
            toast({ title: 'Categoría sugerida', description: `Se sugirió: "${result.category}"` });
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error de IA', description: 'No se pudo obtener una sugerencia.' });
    } finally {
        setIsSuggesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar Nueva Compra</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="fecha" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="monto" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl><MoneyInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="0.00" /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
            </div>
            <FormField control={form.control} name="categoria" render={({ field }) => (
                <FormItem>
                <FormLabel>Categoría</FormLabel>
                <div className="flex gap-2">
                    <FormControl><Input placeholder="Ej: Mercadería, Servicios" {...field} /></FormControl>
                    <Button type="button" variant="outline" size="icon" onClick={handleSuggestCategory} disabled={isSuggesting}>
                        <Sparkles className={`transition-transform ${isSuggesting ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
                <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="nota" render={({ field }) => (
                <FormItem>
                <FormLabel>Nota (opcional)</FormLabel>
                <FormControl><Textarea placeholder="Describe la compra para obtener mejores sugerencias de categoría." {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )} />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={!isOnline || form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Agregando...' : 'Agregar Compra'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

function ComprasTable({ ym, onUpdate }: { ym: string, onUpdate: () => void }) {
    const [compras, setCompras] = useState<Compra[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchCompras = useCallback(async () => {
        setIsLoading(true);
        const data = await listComprasByYm(ym);
        setCompras(data);
        setIsLoading(false);
    }, [ym]);

    useEffect(() => {
        fetchCompras();
    }, [fetchCompras]);

    useEffect(() => {
        onUpdate(); // Re-fetch when parent requests it
    }, [onUpdate]);

    const handleDelete = async (id: string) => {
        try {
            await deleteCompra(id);
            toast({ title: 'Éxito', description: 'Compra eliminada.' });
            fetchCompras();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la compra.' });
        }
    }

    const totalMes = useMemo(() => compras.reduce((sum, c) => sum + c.monto, 0), [compras]);

    if(isLoading) {
        return <div className="space-y-2 mt-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
    }

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Compras de {formatDisplayDate(new Date(ym + '-02'), "MMMM yyyy")}</CardTitle>
                <div className="text-lg font-bold">Total: {formatArs(totalMes)}</div>
            </CardHeader>
            <CardContent>
                {compras.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No hay compras registradas para este mes.</p>
                ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Nota</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead className="w-[50px]">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {compras.map(compra => (
                            <TableRow key={compra.id}>
                                <TableCell>{formatDisplayDate(compra.fecha, 'dd/MM/yyyy')}</TableCell>
                                <TableCell>{compra.categoria}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{compra.nota}</TableCell>
                                <TableCell className="text-right">{formatArs(compra.monto)}</TableCell>
                                <TableCell>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon"><Trash2 className="text-destructive h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                Esta acción no se puede deshacer. Se eliminará permanentemente la compra.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(compra.id!)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                )}
            </CardContent>
        </Card>
    )
}

export default function ComprasPage() {
  const [ym, setYm] = useState(toYm(new Date()));
  const [updateKey, setUpdateKey] = useState(0);

  const handleAdd = useCallback(() => {
    setUpdateKey(prev => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      <MonthPicker label="Seleccionar Mes" value={ym} onChange={setYm} />
      <ComprasForm ym={ym} onAdd={handleAdd} />
      <ComprasTable ym={ym} onUpdate={handleAdd} key={updateKey} />
    </div>
  );
}
