<script lang="ts">
    import { onMount, tick, afterUpdate } from 'svelte';
    import { type Writable } from 'svelte/store';
    import { TimelineController } from '@/controllers/TimelineController';
    import TimelineHeader from './TimelineHeader.svelte';
    import LoadingIndicator from '../grid/LoadingIndicator.svelte';
    import TodayButton from "./TodayButton.svelte";
    import { timeScales, getSelectedScale } from '@/utils/calculations';
    import { timelineContainer } from '../../utils/timeLineStore';

    export let totalDaysLoaded: Writable<number>;
    export let appointments = [];

    let timelineContainerElement: HTMLElement;
    let controller: TimelineController;
    let forceRedraw = false;

    $: if (timelineContainerElement) {
        timelineContainer.set(timelineContainerElement);
    }

    $: dateRange = controller ? controller.getDates() : [];
    $: weeks = controller ? controller.getWeeks(dateRange) : [];
    $: isDay = controller ? controller.isDay() : getSelectedScale() === timeScales.day;
    $: visibleDateRange = controller ? controller.filterVisibleDates(dateRange) : [];
    $: visibleWeeks = controller ? controller.filterVisibleWeeks(weeks) : [];
    $: currentScale = getSelectedScale();

    async function handleLoadMoreDates() {
        if (!controller) return;

        await controller.loadMoreDates();
        await tick();

        setTimeout(() => {
            controller.isLoading = false;
            setTimeout(() => {
                controller.newDaysLoaded = false;
            }, 2000);
        }, 800);
    }

    async function handleInitialFill(forceReload = false) {
        if (!controller) return;

        await controller.initialFill(forceReload);
        await tick();

        setTimeout(() => {
            controller.isLoading = false;
            setTimeout(() => {
                controller.newDaysLoaded = false;
                controller.initialLoadComplete = true;
                forceRedraw = false;
            }, 1000);
        }, 500);
    }

    function handleScroll() {
        if (!controller) return;

        controller.handleScroll();

        if (controller.isLoading) {
            handleLoadMoreDates();
        }
    }

    function isNewDay(date: Date) {
        return controller ? controller.isNewDay(date, dateRange) : false;
    }

    function handleForceUpdate(event) {
        if (event?.detail?.complete) {
            forceRedraw = true;
            totalDaysLoaded.update(n => Math.max(20, n));
            handleInitialFill(true);
        }
    }

    onMount(() => {
        controller = new TimelineController(totalDaysLoaded);

        if (timelineContainerElement) {
            controller.setTimelineElement(timelineContainerElement);

            const resizeObserver = new ResizeObserver(() => {
                handleScroll();
                if (!controller.initialLoadComplete) {
                    handleInitialFill();
                }
            });

            resizeObserver.observe(timelineContainerElement);

            window.addEventListener('forceTimelineUpdate', handleForceUpdate);

            setTimeout(() => {
                controller.updateVisibleRange();
                handleInitialFill();
            }, 100);

            return () => {
                resizeObserver.disconnect();
                window.removeEventListener('forceTimelineUpdate', handleForceUpdate);
            };
        }
    });

    afterUpdate(() => {
        if (forceRedraw) {
            if (timelineContainerElement) {
                timelineContainerElement.scrollLeft = 0;
            }
        }
    });
</script>

<div bind:this={timelineContainerElement} class="timeline-container" on:scroll={handleScroll}>
    <TimelineHeader
            {dateRange}
            {isDay}
            {isNewDay}
            {visibleDateRange}
            {visibleWeeks}
            forceUpdate={forceRedraw}
    />

    {#if controller && controller.isLoading}
        <LoadingIndicator
                message={controller.initialLoadComplete ? 'Meer dagen aan het laden...' : 'Tijdlijn aan het vullen...'}
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