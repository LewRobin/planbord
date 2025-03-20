const timeScales = {
    halfHour: 7.5,
    hour: 15,
    day: 15 * 24,
    week: 15 * 24 * 7
};

let selectedScale = timeScales.hour;
const minutesPerCell = selectedScale;
const minimumTime = 15;

export function calculateLeft(startTime: number) {
    return Math.round((startTime / minutesPerCell) * minimumTime) - 1;
}

export function calculateWidth(startTime: number, endTime: number) {
    return Math.round(((endTime - startTime) / minutesPerCell) * minimumTime);
}

export function calculateTime(startTime: number, endTime: number) {
    return Math.round((endTime - startTime));
}