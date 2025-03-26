<script lang="ts">
    import {onMount, tick} from 'svelte';
    import {writable, type Writable} from 'svelte/store';
    import {TimelineController} from '../../controllers/TimelineController';
    import TimelineHeader from './TimelineHeader.svelte';
    import LoadingIndicator from '../grid/LoadingIndicator.svelte';
    import TodayButton from "./TodayButton.svelte";
    import TimeScaleSwitcher from "./TimeScaleSwitcher.svelte";

    export let totalDaysLoaded: Writable<number>;

    let timelineContainer: HTMLElement;
    const controller = new TimelineController(totalDaysLoaded);

    $: dateRange = controller.getDates();
    $: weeks = controller.getWeeks(dateRange);
    $: isDay = controller.isDay();
    $: visibleDateRange = controller.filterVisibleDates(dateRange);
    $: visibleWeeks = controller.filterVisibleWeeks(weeks);

    async function handleLoadMoreDates() {
        await controller.loadMoreDates();

        await tick();

        setTimeout(() => {
            controller.isLoading = false;
            setTimeout(() => {
                controller.newDaysLoaded = false;
            }, 2000);
        }, 800);
    }

    async function handleInitialFill() {
        await controller.initialFill();

        await tick();

        setTimeout(() => {
            controller.isLoading = false;
            setTimeout(() => {
                controller.newDaysLoaded = false;
                controller.initialLoadComplete = true;
            }, 1000);
        }, 500);
    }

    function handleScroll() {
        controller.handleScroll();

        if (controller.isLoading) {
            handleLoadMoreDates();
        }
    }

    function isNewDay(date: Date) {
        return controller.isNewDay(date, dateRange);
    }

    onMount(() => {
        if (timelineContainer) {
            controller.setTimelineElement(timelineContainer);

            const resizeObserver = new ResizeObserver(() => {
                handleScroll();
                if (!controller.initialLoadComplete) {
                    handleInitialFill();
                }
            });

            resizeObserver.observe(timelineContainer);

            setTimeout(() => {
                controller.updateVisibleRange();
                handleInitialFill();
            }, 100);

            return () => {
                resizeObserver.disconnect();
            };
        }
    });
</script>

<TimeScaleSwitcher/>
<TodayButton timelineContainer={timelineContainer}/>

<div bind:this={timelineContainer} class="timeline-container" on:scroll={handleScroll}>
    <TimelineHeader
            {dateRange}
            {isDay}
            {isNewDay}
            {visibleDateRange}
            {visibleWeeks}
    />

    {#if controller.isLoading}
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