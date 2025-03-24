export const timeScales = {
    halfHour: 7.5,
    hour: 15,
    day: 15 * 24,
    week: 15 * 24 * 7
};

let selectedScale = timeScales.day;
export const CELL_WIDTH_PX = 60;

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

export function getSelectedScale() {
    return selectedScale;
}

export function setSelectedScale(scale) {
    selectedScale = scale;
}

export function unixTimestampToDate(unixTimestamp) {
    return new Date(unixTimestamp * 1000);
}

const timeToMinutes = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000);
    return date.getHours() * 60 + date.getMinutes();
};

export function calculatePixelsPerDay() {
    if (selectedScale === timeScales.day) {
        return CELL_WIDTH_PX;
    } else if (selectedScale === timeScales.week) {
        return CELL_WIDTH_PX / 7;
    } else {
        return 24 * CELL_WIDTH_PX;
    }
}

export function calculateTimeline(scale) {
    if (scale === timeScales.day) {
        return CELL_WIDTH_PX;
    } else if (scale === timeScales.week) {
        return CELL_WIDTH_PX * 7;
    } else {
        return CELL_WIDTH_PX;
    }
}


export function calculateLeft(startTime: number) {
    const date = new Date(startTime * 1000);
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    const dayDifference = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    const minutes = timeToMinutes(startTime);
    return (dayDifference * calculatePixelsPerDay()) + (minutes * 1) / selectedScale * 15;
}

export function calculateWidth(startTime, endTime) {
    const startDate = unixTimestampToDate(startTime);
    const endDate = unixTimestampToDate(endTime);
    const diffMs = endDate.getTime() - startDate.getTime();

    if (selectedScale === timeScales.day) {
        let startMinutes = timeToMinutes(startTime);
        let endMinutes = timeToMinutes(endTime);
        return Math.round(((endMinutes - startMinutes) / 15) * 1) - 2;
    } else if (selectedScale === timeScales.week) {
        const diffWeeks = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
        return diffWeeks * CELL_WIDTH_PX - 2;
    } else {
        const diffMinutes = diffMs / (1000 * 60);
        return (diffMinutes / 60) * CELL_WIDTH_PX - 2;
    }
}