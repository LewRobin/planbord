const timeScales = {
    halfHour: 7.5,
    hour: 15,
    day: 15 * 24,
    week: 15 * 24 * 7
};

let selectedScale = timeScales.hour;
const minutesPerCell = selectedScale;
const minimumTime = 15;


export function getSelectedScale() {
    return selectedScale;
}

export function setSelectedScale(scale: number) {
    selectedScale = scale;
}

// Calculates the X value of an item
export function calculateLeft(startTime: number) {
    return Math.round((startTime / minutesPerCell) * minimumTime);
}

// Calculates how much time the items is supposed to be -2 is applied due to grid borders
export function calculateWidth(startTime: number, endTime: number) {
    return Math.round(((endTime - startTime) / minutesPerCell) * minimumTime) - 2;
}

// Calculates the width of the timeline items
export function calculateTimeline(selectedScale: number) {
    return selectedScale * 4;
}