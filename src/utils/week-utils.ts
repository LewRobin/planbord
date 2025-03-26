export function getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export function isFirstDayOfWeek(date: Date): boolean {
    return date.getDay() === 1; // Monday as first day
}

export function getWeekLabel(date: Date): string {
    return `Week ${getWeekNumber(date)}`;
}