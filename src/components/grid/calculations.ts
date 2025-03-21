export const timeScales = {
    halfHour: 7.5,
    hour: 15,
    day: 15 * 24,
    week: 15 * 24 * 7
};

let selectedScale = timeScales.hour;
const pixelsPerMinute = 1;
const minutesPerCell = selectedScale;
const minimumTime = 15;

export function getSelectedScale() {
    return selectedScale;
}

// For future option menu customization
export function setSelectedScale(scale: number) {
    selectedScale = scale;
}

const timeToMinutes = (unixTimestamp: number) => {
    const date = new Date(unixTimestamp * 1000);
    return date.getHours() * 60 + date.getMinutes();
}

export function calculatePixelsPerDay() {
    const minutesPerDay = 1440;
    return minutesPerDay * (pixelsPerMinute / (60 / (selectedScale * 4)));
}

export function calculateLeft(startTime: number) {
    const date = new Date(startTime * 1000);
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    const dayDifference = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

    const minutes = timeToMinutes(startTime);

    return (dayDifference * calculatePixelsPerDay()) + (minutes * pixelsPerMinute);
}


// Calculates how much time the items is supposed to be -2 is applied due to grid borders
export function calculateWidth(startTime: number, endTime: number) {
    let startMinutes = timeToMinutes(startTime);
    let endMinutes = timeToMinutes(endTime);
    return Math.round(((endMinutes - startMinutes) / minutesPerCell) * minimumTime) - 2;
}

export function unixTimestampToDate(unixTimestamp: number): Date {
    return new Date(unixTimestamp * 1000);
}

export function calculateTimeline(selectedScale: number) {
    return selectedScale * 4;
}