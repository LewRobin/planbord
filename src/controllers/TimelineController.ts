// @ts-ignore
import {writable, get, type Writable} from 'svelte/store';
import type {VisibleRange, Week} from '@/utils/types';
import {generateDates} from '@/utils/dateGenerator';
import {getWeekLabel, isFirstDayOfWeek} from '@/utils/week-utils';
import {timeScales, cellWidthPx, getSelectedScale} from '@/utils/calculations';

export class TimelineController {
    public isLoading = false;
    public newDaysLoaded = false;
    public initialLoadComplete = false;
    public visibleRange: VisibleRange = {start: 0, end: 2000};
    // Properties
    private timelineElement: HTMLElement | null = null;
    private currentScale = getSelectedScale();

    constructor(private totalDaysLoaded: Writable<number>) {
        // Listen for scale changes
        window.addEventListener('timeScaleChanged', (event: any) => {
            // Reset state when scale changes
            this.currentScale = event.detail.scale;
            this.initialLoadComplete = false;
            this.visibleRange = {start: 0, end: 2000};

            // Force reload with a small delay to allow DOM updates
            setTimeout(() => {
                this.initialFill(true);

                // Force view update
                if (this.timelineElement) {
                    this.updateVisibleRange();
                    this.handleScroll();
                }
            }, 50);
        });
    }

    // Setters
    setTimelineElement(element: HTMLElement) {
        this.timelineElement = element;
    }

    // Helper methods
    isDay(): boolean {
        return getSelectedScale() === timeScales.day;
    }

    getDates(): Date[] {
        return generateDates(this.getDaysLoaded());
    }

    getDaysLoaded(): number {
        let value: number = 0;
        this.totalDaysLoaded.subscribe(v => value = v)();
        return value;
    }

    getWeeks(dateRange: Date[]): Week[] {
        return dateRange.reduce((acc, date, index) => {
            if (isFirstDayOfWeek(date) || index === 0) {
                const endOfWeek = Math.min(index + 6, dateRange.length - 1);
                acc.push({
                    label: getWeekLabel(date),
                    startIndex: index,
                    endIndex: endOfWeek,
                    date: new Date(date),
                    width: ((endOfWeek - index + 1) * cellWidthPx) - 2
                });
            }
            return acc;
        }, [] as Week[]);
    }

    // View filtering methods
    filterVisibleDates(dateRange: Date[]): Date[] {
        return dateRange.filter((date, index) => {
            const dayPosition = index * (this.isDay() ? cellWidthPx : cellWidthPx * 24);
            return dayPosition >= this.visibleRange.start - cellWidthPx * 24 &&
                dayPosition <= this.visibleRange.end + cellWidthPx * 24;
        });
    }

    filterVisibleWeeks(weeks: Week[]): Week[] {
        return weeks.filter(week => {
            const weekPosition = week.startIndex * cellWidthPx;
            return weekPosition >= this.visibleRange.start - cellWidthPx * 7 &&
                weekPosition <= this.visibleRange.end + cellWidthPx * 7;
        });
    }

    isNewDay(date: Date, dateRange: Date[]): boolean {
        if (!this.newDaysLoaded) return false;
        const index = dateRange.indexOf(date);
        return index >= this.getDaysLoaded() - 7;
    }

    // Timeline operations
    calculateRequiredDays(): number {
        if (!this.timelineElement) return 30;

        const containerWidth = this.timelineElement.clientWidth;
        const cellsPerDay = this.isDay() ? 1 : 24;

        return Math.ceil(containerWidth / (cellWidthPx * cellsPerDay)) + (this.isDay() ? 10 : 5);
    }

    async initialFill(forceReload = false): Promise<void> {
        if (this.initialLoadComplete && !forceReload) return;

        const requiredDays = this.calculateRequiredDays();

        if (this.getDaysLoaded() < requiredDays || forceReload) {
            this.isLoading = true;
            this.newDaysLoaded = true;

            // Reset dates count and reload
            if (forceReload) {
                this.totalDaysLoaded.set(requiredDays);
            } else {
                this.totalDaysLoaded.update(n => Math.max(n, requiredDays));
            }

            // We'll handle the timeouts in the component to keep UI transitions there
            // Just return that we started loading
            return Promise.resolve();
        } else {
            this.initialLoadComplete = true;
            return Promise.resolve();
        }
    }

    loadMoreDates(): Promise<void> {
        if (this.isLoading) return Promise.resolve();

        this.isLoading = true;
        this.newDaysLoaded = true;

        this.totalDaysLoaded.update(n => n + 7);

        return Promise.resolve();
    }

    updateVisibleRange(): void {
        if (!this.timelineElement) return;

        const scrollLeft = this.timelineElement.scrollLeft;
        const clientWidth = this.timelineElement.clientWidth;

        this.visibleRange = {
            start: Math.max(0, scrollLeft - cellWidthPx * 24),
            end: scrollLeft + clientWidth + cellWidthPx * 24
        };
    }

    // Synchronize scrolling between timeline and rows
    syncScrollWithRows(): void {
        if (!this.timelineElement) return;

        const scrollLeft = this.timelineElement.scrollLeft;
        const rowsContainer = document.querySelector('.rows');

        if (rowsContainer) {
            rowsContainer.scrollLeft = scrollLeft;
        }
    }

    // Handle scroll events
    handleScroll(): void {
        if (!this.timelineElement) return;

        const scrollLeft = this.timelineElement.scrollLeft;
        const scrollWidth = this.timelineElement.scrollWidth;
        const clientWidth = this.timelineElement.clientWidth;

        // Sync scroll with rows
        this.syncScrollWithRows();

        // Update visible range
        this.updateVisibleRange();

        // Load more dates if needed
        if (scrollLeft + clientWidth >= scrollWidth * 0.7) {
            this.loadMoreDates();
        }
    }

    // Go to today
    goToToday(): void {
        if (!this.timelineElement) return;

        // Scroll to today (first day in view)
        this.timelineElement.scrollLeft = 0;

        // Also sync the rows container
        const rowsContainer = document.querySelector('.rows');
        if (rowsContainer) {
            rowsContainer.scrollLeft = 0;
        }
    }
}