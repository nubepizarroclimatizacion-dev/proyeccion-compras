'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SettingsGlobalSchema, type SettingsGlobal } from '@/lib/schemas';
import { getSettingsGlobal, upsertSettingsGlobal } from '@/lib/queries';
import { useConnection } from '@/hooks/use-connection';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ConfiguracionPage() {
  const { isOnline } = useConnection();
  const { toast } = useToast();
  
  const form = useForm<SettingsGlobal>({
    resolver: zodResolver(SettingsGlobalSchema),
    defaultValues: async () => {
        const settings = await getSettingsGlobal();
        return settings;
    }
  });

  const { formState: { isSubmitting, isLoading } } = form;

  const onSubmit = async (values: SettingsGlobal) => {
    try {
      await upsertSettingsGlobal(values);
      toast({
        title: 'Configuración guardada',
        description: 'Tus cambios han sido guardados exitosamente.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: 'No se pudo guardar la configuración. Intenta de nuevo.',
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Configuración General</CardTitle>
        <CardDescription>
          Ajusta los parámetros globales de la aplicación.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {isLoading ? (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            ) : (
                <>
                    <FormField
                    control={form.control}
                    name="percentCompras"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Porcentaje para Compras (%)</FormLabel>
                        <FormControl>
                            <Input
                            type="number"
                            placeholder="80"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Zona Horaria</FormLabel>
                        <FormControl>
                            <Input placeholder="America/Argentina/Tucuman" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={!isOnline || isSubmitting || isLoading}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
