'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ChangeEvent } from 'react';

interface MonthPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function MonthPicker({ value, onChange, label, className }: MonthPickerProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={className}>
      {label && <Label htmlFor="month-picker">{label}</Label>}
      <Input
        id="month-picker"
        type="month"
        value={value}
        onChange={handleChange}
        className="max-w-xs"
      />
    </div>
  );
}
