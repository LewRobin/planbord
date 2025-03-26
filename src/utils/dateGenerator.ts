export function generateDates(days) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({length: days}, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index);
        return date;
    });
}

export function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export function isFirstDayOfWeek(date) {
    return date.getDay() === 1; // Monday as first day
}

export function getWeekLabel(date) {
    return `Week ${getWeekNumber(date)}`;
}