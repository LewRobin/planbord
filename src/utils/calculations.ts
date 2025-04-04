export const timeScales = {
    halfHour: 7.5,
    hour: 15,
    day: 15 * 24,
    week: 15 * 24 * 7
};

let selectedScale = timeScales.hour;
export const cellWidthPx = 60;

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

export function getSelectedScale() {
    return selectedScale;
}

export function setSelectedScale(scale) {
    selectedScale = scale;
}

export function unixTimestampToDate(unixTimestamp: number) {
    return new Date(unixTimestamp * 1000);
}

const timeToMinutes = (unixTimestamp: number) => {
    const date = new Date(unixTimestamp * 1000);
    return date.getHours() * 60 + date.getMinutes();
};

export function calculatePixelsPerDay() {
    if (selectedScale === timeScales.day) {
        return cellWidthPx;
    } else if (selectedScale === timeScales.week) {
        return cellWidthPx / 7;
    } else if (selectedScale === timeScales.halfHour) {
        return 48 * cellWidthPx;
    } else {
        return 24 * cellWidthPx;
    }
}

export function calculateTimeline(scale) {
    if (scale === timeScales.day) {
        return cellWidthPx;
    } else if (scale === timeScales.week) {
        return cellWidthPx * 7;
    } else if (scale === timeScales.halfHour) {
        return cellWidthPx / 2;
    } else {
        return cellWidthPx;
    }
}


export function calculateLeft(startTime: number) {
    const date = new Date(startTime * 1000);
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    const dayDifference = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    const minutes = timeToMinutes(startTime);

    if (selectedScale === timeScales.halfHour) {
        return (dayDifference * calculatePixelsPerDay()) + (minutes * (1 / 30) * cellWidthPx);
    } else if (selectedScale === timeScales.week) {
        return (dayDifference / 7) * cellWidthPx;
    } else {
        return (dayDifference * calculatePixelsPerDay()) + (minutes * (1 / selectedScale) * 15);
    }
}

export function calculateWidth(startTime: number, endTime: number) {
    const startDate = unixTimestampToDate(startTime);
    const endDate = unixTimestampToDate(endTime);
    const diffMs = endDate.getTime() - startDate.getTime();

    if (selectedScale === timeScales.day) {
        let startMinutes = timeToMinutes(startTime);
        let endMinutes = timeToMinutes(endTime);
        return Math.round((endMinutes - startMinutes) / 15) - 2;
    } else if (selectedScale === timeScales.week) {
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return (diffDays / 7) * cellWidthPx - 2;
    } else if (selectedScale === timeScales.halfHour) {
        const diffMinutes = diffMs / (1000 * 60);
        return (diffMinutes / 30) * cellWidthPx - 2;
    } else {
        const diffMinutes = diffMs / (1000 * 60);
        return (diffMinutes / 60) * cellWidthPx - 2;
    }
}
export function calculateTimestampFromPosition(
    positionX: number,
    scale: number,
    cellWidthPx: number,
    dayStartTimestamp: number,
    originalStartTime: number
): number {
    const baseDate = new Date(dayStartTimestamp * 1000);

    if (scale === timeScales.hour) {
        const hourOffset = positionX / cellWidthPx;
        const dayOffset = Math.floor(hourOffset / 24);
        const hourOfDay = hourOffset % 24;

        baseDate.setDate(baseDate.getDate() + dayOffset);
        baseDate.setHours(Math.floor(hourOfDay), 0, 0, 0);
    } else {
        const dayOffset = Math.round(positionX / cellWidthPx);

        const newDate = new Date(dayStartTimestamp * 1000);
        newDate.setDate(newDate.getDate() + dayOffset);

        const origTime = new Date(originalStartTime * 1000);
        newDate.setHours(origTime.getHours(), origTime.getMinutes(), 0, 0);

        return Math.floor(newDate.getTime() / 1000);
    }

    return Math.floor(baseDate.getTime() / 1000);
}

export function calculateEndTimeFromWidth(
    startTime: number,
    width: number,
    scale: number,
    cellWidthPx: number,
    originalEndTime: number
): number {
    const startDate = new Date(startTime * 1000);
    const endDate = new Date(startTime * 1000);

    if (scale === timeScales.hour) {
        const hoursDuration = width / cellWidthPx;
        endDate.setTime(startDate.getTime() + (hoursDuration * 60 * 60 * 1000));
    } else {
        const daysDuration = Math.max(0.25, width / cellWidthPx);
        endDate.setDate(startDate.getDate() + Math.floor(daysDuration));

        const fractionalDay = daysDuration % 1;
        if (fractionalDay > 0) {
            const additionalHours = Math.round(fractionalDay * 24);
            endDate.setHours(endDate.getHours() + additionalHours);
        }

        if (Math.floor(daysDuration) === daysDuration) {
            const origEndTime = new Date(originalEndTime * 1000);
            endDate.setHours(origEndTime.getHours(), origEndTime.getMinutes(), 0, 0);
        }
    }

    return Math.floor(endDate.getTime() / 1000);
}

export function formatTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}