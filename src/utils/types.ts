export interface Appointment {
    asset: string;
    startTime: number;
    endTime: number;
    day?: number;
    color?: string;
}

export interface Week {
    label: string;
    startIndex: number;
    endIndex: number;
    date: Date;
    width: number;
}

export interface VisibleRange {
    start: number;
    end: number;
}