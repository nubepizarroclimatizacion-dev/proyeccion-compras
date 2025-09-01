import { format, parse, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, getDay } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Converts a Date object to a "YYYY-MM" string.
 * @param date - The date to convert.
 * @returns The formatted year-month string.
 */
export function toYm(date: Date): string {
  return format(date, 'yyyy-MM');
}

/**
 * Converts a "YYYY-MM" string to a Date object (the first day of that month).
 * @param ym - The year-month string.
 * @returns The corresponding Date object.
 */
export function fromYm(ym: string): Date {
  return parse(ym, 'yyyy-MM', new Date());
}

type DayInfo = {
  date: string; // YYYY-MM-DD
  dow: number; // 0 (Sun) to 6 (Sat)
  weekIndex: number;
  isCurrentMonth: boolean;
};

/**
 * Generates an array of day information for a full month calendar view.
 * The week starts on Saturday and ends on Friday.
 * @param ym - The year-month string ("YYYY-MM").
 * @returns An array of DayInfo objects for all days in the calendar view.
 */
export function daysOfMonth(ym: string): DayInfo[] {
  const monthDate = fromYm(ym);
  const firstDayOfMonth = startOfMonth(monthDate);
  const lastDayOfMonth = endOfMonth(monthDate);

  const calendarStart = startOfWeek(firstDayOfMonth, { weekStartsOn: 6 }); // Week starts on Saturday
  const calendarEnd = endOfWeek(lastDayOfMonth, { weekStartsOn: 6 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  let currentWeekIndex = 0;
  let previousDay: number | null = null;

  return days.map(day => {
    const dow = getDay(day);

    if (previousDay !== null && dow === 6) { // Saturday starts a new week
      currentWeekIndex++;
    }
    
    previousDay = dow;

    return {
      date: format(day, 'yyyy-MM-dd'),
      dow: dow,
      weekIndex: currentWeekIndex,
      isCurrentMonth: format(day, 'yyyy-MM') === ym,
    };
  });
}

/**
 * Formats a date for display.
 * @param date - A date string (YYYY-MM-DD) or Date object.
 * @param formatStr - The format string.
 * @returns Formatted date string.
 */
export function formatDisplayDate(date: string | Date, formatStr: string): string {
  const dateObj = typeof date === 'string' ? parse(date, 'yyyy-MM-dd', new Date()) : date;
  return format(dateObj, formatStr, { locale: es });
}
