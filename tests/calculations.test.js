import { jest } from '@jest/globals';

import {
    timeScales,
    getSelectedScale,
    setSelectedScale,
    calculateLeft,
    calculateWidth,
    calculatePixelsPerDay,
    unixTimestampToDate
} from './__mocks__/calculationsMock.js';



const FIXED_DATE = new Date(2025, 2, 28); // March 28, 2025
const OriginalDate = global.Date;

global.Date = jest.fn((...args) => {
    if (args.length === 0) {
        return new OriginalDate(FIXED_DATE);
    }
    return new OriginalDate(...args);
});
global.Date.now = jest.fn(() => FIXED_DATE.getTime());
global.Date.prototype = OriginalDate.prototype;

describe('Calculations Utility', () => {
    beforeEach(() => {
        setSelectedScale(timeScales.hour);
        jest.clearAllMocks();
    });

    describe('Scale Management', () => {
        test('should get and set scale correctly', () => {
            expect(getSelectedScale()).toBe(timeScales.hour);

            setSelectedScale(timeScales.day);
            expect(getSelectedScale()).toBe(timeScales.day);

            setSelectedScale(timeScales.hour);
            expect(getSelectedScale()).toBe(timeScales.hour);

            setSelectedScale(timeScales.halfHour);
            expect(getSelectedScale()).toBe(timeScales.halfHour);

            setSelectedScale(timeScales.week);
            expect(getSelectedScale()).toBe(timeScales.week);
        });

        test('timeScales should have correct values', () => {
            expect(timeScales.halfHour).toBe(7.5); // Half of hour scale
            expect(timeScales.hour).toBe(15);
            expect(timeScales.day).toBe(360); // 15 * 24
            expect(timeScales.week).toBe(2520); // 15 * 24 * 7
        });
    });

    describe('calculatePixelsPerDay', () => {
        test('should return correct pixels per day in half-hour scale', () => {
            setSelectedScale(timeScales.halfHour);
            const result = calculatePixelsPerDay();
            expect(result).toBe(60 * 48); // cellWidthPx (60) * 48 half-hours
        });

        test('should return correct pixels per day in hour scale', () => {
            setSelectedScale(timeScales.hour);
            const result = calculatePixelsPerDay();
            expect(result).toBe(60 * 24); // cellWidthPx (60) * 24 hours
        });

        test('should return correct pixels per day in day scale', () => {
            setSelectedScale(timeScales.day);
            const result = calculatePixelsPerDay();
            expect(result).toBe(60); // cellWidthPx (60)
        });

        test('should return correct pixels per day in week scale', () => {
            setSelectedScale(timeScales.week);
            const result = calculatePixelsPerDay();
            expect(result).toBe(60 / 7); // cellWidthPx (60) / 7 days
        });
    });

    describe('calculateLeft', () => {
        test('should calculate correct left position for today in half-hour scale', () => {
            const now = Math.floor(FIXED_DATE.getTime() / 1000);
            setSelectedScale(timeScales.halfHour);

            const result = calculateLeft(now);

            // Since we're mocking Date to return FIXED_DATE, this should be near 0
            expect(result).toBeCloseTo(0, 0);
        });

        test('should calculate correct left position for today in hour scale', () => {
            const now = Math.floor(FIXED_DATE.getTime() / 1000);
            setSelectedScale(timeScales.hour);

            const result = calculateLeft(now);

            // Since we're mocking Date to return FIXED_DATE, this should be near 0
            expect(result).toBeCloseTo(0, 0);
        });

        test('should calculate correct left position for tomorrow in hour scale', () => {
            const tomorrow = Math.floor(FIXED_DATE.getTime() / 1000) + (24 * 60 * 60);
            setSelectedScale(timeScales.hour);

            const result = calculateLeft(tomorrow);

            // Tomorrow should be one day worth of pixels away
            expect(result).toBeCloseTo(24 * 60, 0); // 24 hours * 60px
        });

        test('should calculate correct left position for next week in week scale', () => {
            const nextWeek = Math.floor(FIXED_DATE.getTime() / 1000) + (7 * 24 * 60 * 60);
            setSelectedScale(timeScales.week);

            const result = calculateLeft(nextWeek);

            // Next week should be one week worth of pixels away
            expect(result).toBeCloseTo(60, 0); // 1 week * 60px
        });

        test('should calculate correct left position based on time of day in half-hour scale', () => {
            // Create a timestamp for today at 3:30 PM (15:30)
            const today = new Date(FIXED_DATE);
            today.setHours(15, 30, 0, 0);
            const timestamp = Math.floor(today.getTime() / 1000);

            setSelectedScale(timeScales.halfHour);

            const result = calculateLeft(timestamp);

            // Should be 31 half-hours worth of pixels (15 hours + 1 half-hour)
            expect(result).toBeCloseTo(31 * 60, 0);
        });

        test('should calculate correct left position based on time of day in hour scale', () => {
            // Create a timestamp for today at 3:00 PM (15:00)
            const today = new Date(FIXED_DATE);
            today.setHours(15, 0, 0, 0);
            const timestamp = Math.floor(today.getTime() / 1000);

            setSelectedScale(timeScales.hour);

            const result = calculateLeft(timestamp);

            // Should be 15 hours worth of pixels
            expect(result).toBeCloseTo(15 * 60, 0);
        });
    });

    describe('calculateWidth', () => {
        test('should calculate correct width for 30-minute appointment in half-hour scale', () => {
            const startTime = Math.floor(FIXED_DATE.getTime() / 1000);
            const endTime = startTime + (30 * 60); // 30 minutes later

            setSelectedScale(timeScales.halfHour);

            const result = calculateWidth(startTime, endTime);

            // 30-minute appointment should be 1 cellWidth wide, minus 2px (border)
            expect(result).toBeCloseTo(60 - 2, 0);
        });

        test('should calculate correct width for 1-hour appointment in half-hour scale', () => {
            const startTime = Math.floor(FIXED_DATE.getTime() / 1000);
            const endTime = startTime + (60 * 60); // 1 hour later

            setSelectedScale(timeScales.halfHour);

            const result = calculateWidth(startTime, endTime);

            // 1 hour appointment should be 2 cellWidths wide, minus 2px (border)
            expect(result).toBeCloseTo(2 * 60 - 2, 0);
        });

        test('should calculate correct width for 1-hour appointment in hour scale', () => {
            const startTime = Math.floor(FIXED_DATE.getTime() / 1000);
            const endTime = startTime + (60 * 60); // 1 hour later

            setSelectedScale(timeScales.hour);

            const result = calculateWidth(startTime, endTime);

            // 1 hour appointment should be 1 cellWidth wide, minus 2px (border)
            expect(result).toBeCloseTo(60 - 2, 0);
        });

        test('should calculate correct width for 2-hour appointment in hour scale', () => {
            const startTime = Math.floor(FIXED_DATE.getTime() / 1000);
            const endTime = startTime + (2 * 60 * 60); // 2 hours later

            setSelectedScale(timeScales.hour);

            const result = calculateWidth(startTime, endTime);

            // 2 hour appointment should be 2 cellWidths wide, minus 2px (border)
            expect(result).toBeCloseTo(2 * 60 - 2, 0);
        });

        test('should calculate correct width for 1-week appointment in week scale', () => {
            const startTime = Math.floor(FIXED_DATE.getTime() / 1000);
            const endTime = startTime + (7 * 24 * 60 * 60); // 1 week later

            setSelectedScale(timeScales.week);

            const result = calculateWidth(startTime, endTime);

            // 1 week appointment should be 1 cellWidth wide, minus 2px (border)
            expect(result).toBeCloseTo(60 - 2, 0);
        });

        test('should calculate correct width for 2-week appointment in week scale', () => {
            const startTime = Math.floor(FIXED_DATE.getTime() / 1000);
            const endTime = startTime + (14 * 24 * 60 * 60); // 2 weeks later

            setSelectedScale(timeScales.week);

            const result = calculateWidth(startTime, endTime);

            // 2 week appointment should be 2 cellWidths wide, minus 2px (border)
            expect(result).toBeCloseTo(2 * 60 - 2, 0);
        });
    });

    describe('unixTimestampToDate', () => {
        test('should convert unix timestamp to Date object', () => {
            const timestamp = 1711065600; // March 22, 2024 00:00:00 GMT
            const result = unixTimestampToDate(timestamp);

            expect(result).toBeInstanceOf(Date);
            expect(result.getTime()).toBe(timestamp * 1000);
        });
    });
});