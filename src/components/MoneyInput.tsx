'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { formatArs } from '@/lib/currency';

interface MoneyInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function MoneyInput({ value, onChange, onBlur, ...props }: MoneyInputProps) {
  const [displayValue, setDisplayValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatArs(value));
    } else {
      // When focused, show the raw number. If it's 0, show an empty string for better UX.
      setDisplayValue(value === 0 ? '' : value.toString());
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // If input is empty, treat as 0
    if (e.target.value === '') {
      onChange(0);
    }
    if (onBlur) {
        onBlur(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setDisplayValue(rawValue);
    const numericValue = parseFloat(rawValue);
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    } else if (rawValue === '') {
      onChange(0); // Treat empty input as 0
    }
  };

  return (
    <Input
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      type={isFocused ? 'number' : 'text'}
      step="0.01"
      {...props}
    />
  );
}
