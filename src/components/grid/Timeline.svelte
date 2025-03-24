<script lang="ts">
    import {onMount, tick} from 'svelte';
    import {fade} from 'svelte/transition';
    import {writable, type Writable} from 'svelte/store';
    import {getSelectedScale, timeScales, CELL_WIDTH_PX} from './calculations';
    import {generateDates} from '../utils/dateGenerator';
    import {getWeekLabel, isFirstDayOfWeek} from '../utils/week-utils';
    import TimelineHeader from './TimelineHeader.svelte';
    import LoadingIndicator from './LoadingIndicator.svelte';
    import type {Appointment, Week, VisibleRange} from './types';

    export let totalDaysLoaded: Writable<number>;

    let timelineContainer: HTMLElement;
    let isLoading = false;
    let visibleRange: VisibleRange = {start: 0, end: 2000};
    let newDaysLoaded = false;
    let initialLoadComplete = false;

    $: dateRange = generateDates($totalDaysLoaded);

    // Calculate weeks from date range
    $: weeks = dateRange.reduce((acc, date, index) => {
        if (isFirstDayOfWeek(date) || index === 0) {
            const endOfWeek = Math.min(index + 6, dateRange.length - 1);
            acc.push({
                label: getWeekLabel(date),
                startIndex: index,
                endIndex: endOfWeek,
                date: new Date(date),
                width: ((endOfWeek - index + 1) * CELL_WIDTH_PX) - 2
            });
        }
        return acc;
    }, [] as Week[]);

    // Filter visible dates and weeks
    $: selectedScale = getSelectedScale();
    $: isDay = selectedScale === timeScales.day;

    $: visibleDateRange = dateRange.filter((date, index) => {
        const dayPosition = index * (isDay ? CELL_WIDTH_PX : CELL_WIDTH_PX * 24);
        return dayPosition >= visibleRange.start - CELL_WIDTH_PX * 24 &&
            dayPosition <= visibleRange.end + CELL_WIDTH_PX * 24;
    });

    $: visibleWeeks = weeks.filter(week => {
        const weekPosition = week.startIndex * CELL_WIDTH_PX;
        return weekPosition >= visibleRange.start - CELL_WIDTH_PX * 7 &&
            weekPosition <= visibleRange.end + CELL_WIDTH_PX * 7;
    });

    function calculateRequiredDays() {
        if (!timelineContainer) return 30;

        const containerWidth = timelineContainer.clientWidth;
        const cellsPerDay = isDay ? 1 : 24;

        return Math.ceil(containerWidth / (CELL_WIDTH_PX * cellsPerDay)) + (isDay ? 10 : 5);
    }

    async function initialFill() {
        if (initialLoadComplete) return;

        const requiredDays = calculateRequiredDays();

        if ($totalDaysLoaded < requiredDays) {
            isLoading = true;
            newDaysLoaded = true;

            totalDaysLoaded.update(n => Math.max(n, requiredDays));

            await tick();

            setTimeout(() => {
                isLoading = false;
                setTimeout(() => {
                    newDaysLoaded = false;
                    initialLoadComplete = true;
                }, 1000);
            }, 500);
        } else {
            initialLoadComplete = true;
        }
    }

    async function loadMoreDates() {
        if (isLoading) return;
        isLoading = true;
        newDaysLoaded = true;

        totalDaysLoaded.update(n => n + 7);

        await tick();

        setTimeout(() => {
            isLoading = false;
            setTimeout(() => {
                newDaysLoaded = false;
            }, 2000);
        }, 800);
    }

    function updateVisibleRange() {
        if (!timelineContainer) return;

        const scrollLeft = timelineContainer.scrollLeft;
        const clientWidth = timelineContainer.clientWidth;

        visibleRange = {
            start: Math.max(0, scrollLeft - CELL_WIDTH_PX * 24),
            end: scrollLeft + clientWidth + CELL_WIDTH_PX * 24
        };
    }

    // Handle scroll events
    function handleScroll() {
        if (!timelineContainer) return;

        const scrollLeft = timelineContainer.scrollLeft;
        const scrollWidth = timelineContainer.scrollWidth;
        const clientWidth = timelineContainer.clientWidth;

        // Sync scroll with rows
        const rowsContainer = document.querySelector('.rows');
        if (rowsContainer) {
            rowsContainer.scrollLeft = scrollLeft;
        }

        updateVisibleRange();

        if (scrollLeft + clientWidth >= scrollWidth * 0.7) {
            loadMoreDates();
        }
    }

    function isNewDay(date: Date) {
        if (!newDaysLoaded) return false;
        const index = dateRange.indexOf(date);
        return index >= $totalDaysLoaded - 7;
    }

    onMount(() => {
        if (timelineContainer) {
            const resizeObserver = new ResizeObserver(() => {
                handleScroll();
                if (!initialLoadComplete) {
                    initialFill();
                }
            });

            resizeObserver.observe(timelineContainer);

            setTimeout(() => {
                updateVisibleRange();
                initialFill();
            }, 100);

            return () => {
                resizeObserver.disconnect();
            };
        }
    });
</script>

<div bind:this={timelineContainer} class="timeline-container" on:scroll={handleScroll}>
    <TimelineHeader
            {dateRange}
            isDay={isDay}
            {isNewDay}
            {visibleDateRange}
            {visibleWeeks}
    />

    {#if isLoading}
        <LoadingIndicator
                message={initialLoadComplete ? 'Loading more days...' : 'Filling timeline...'}
                position="top"
        />
    {/if}
</div>

<style>
    .timeline-container {
        overflow-x: auto;
        width: 100%;
        scrollbar-width: none;
        -ms-overflow-style: none;
        position: relative;
    }

    .timeline-container::-webkit-scrollbar {
        display: none;
    }
</style>