import { z } from 'zod';

const YM_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
const YMD_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export const VentasMesSchema = z.object({
  ym: z.string().regex(YM_REGEX, 'El mes debe tener el formato YYYY-MM'),
  ventas: z.number().min(0, 'Las ventas deben ser un número positivo'),
});
export type VentasMes = z.infer<typeof VentasMesSchema>;

export const CompraSchema = z.object({
  id: z.string().optional(),
  fecha: z.string().regex(YMD_REGEX, 'La fecha debe tener el formato YYYY-MM-DD'),
  ym: z.string().regex(YM_REGEX, 'El mes debe tener el formato YYYY-MM'),
  monto: z.number().min(0, 'El monto debe ser un número positivo'),
  categoria: z.string().min(1, 'La categoría es obligatoria'),
  nota: z.string().optional(),
});
export type Compra = z.infer<typeof CompraSchema>;

export const CompromisoDiaSchema = z.object({
  fecha: z.string().regex(YMD_REGEX, 'La fecha debe tener el formato YYYY-MM-DD'),
  ym: z.string().regex(YM_REGEX, 'El mes debe tener el formato YYYY-MM'),
  plan: z.number().min(0, 'El plan debe ser un número positivo'),
  pagado: z.number().min(0, 'El monto pagado debe ser un número positivo'),
});
export type CompromisoDia = z.infer<typeof CompromisoDiaSchema>;

export const SettingsGlobalSchema = z.object({
  percentCompras: z.number().min(1, "El porcentaje debe ser al menos 1").max(100, "El porcentaje no puede ser mayor a 100"),
  timezone: z.string().min(1, 'La zona horaria es obligatoria'),
});
export type SettingsGlobal = z.infer<typeof SettingsGlobalSchema>;
