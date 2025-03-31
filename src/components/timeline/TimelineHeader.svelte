<script lang="ts">
    import {fly} from 'svelte/transition';
    import {onMount, afterUpdate} from 'svelte';
    import {cellWidthPx} from '../../utils/calculations';
    import type {Week} from '../../utils/types';

    export let dateRange: Date[] = [];
    export let visibleDateRange: Date[] = [];
    export let visibleWeeks: Week[] = [];
    export let isDay: boolean = true;
    export let isNewDay: (date: Date) => boolean;
    export let currentScale = null;
    export let forceUpdate = false;

    let mounted = false;

    onMount(() => {
        mounted = true;
    });

    afterUpdate(() => {
        if (forceUpdate) {
            const weekHeader = document.querySelector('.week-header');
            const dayHeader = document.querySelector('.day-header');
            const hourHeader = document.querySelector('.hour-header');

            if (weekHeader) weekHeader.style.opacity = '0.99';
            if (dayHeader) dayHeader.style.opacity = '0.99';
            if (hourHeader) hourHeader.style.opacity = '0.99';

            setTimeout(() => {
                if (weekHeader) weekHeader.style.opacity = '';
                if (dayHeader) dayHeader.style.opacity = '';
                if (hourHeader) hourHeader.style.opacity = '';
            }, 50);
        }
    });
</script>

{#if isDay}
    <div class="week-header">
        {#each visibleWeeks as week (week.date.getTime())}
            <div class="header-cell week-cell"
                 class:new-item={isNewDay(week.date)}
                 style="width: {week.width}px;
                        left: {week.startIndex * cellWidthPx}px;"
                 in:fly={{ x: 50, duration: 800, delay: isNewDay(week.date) ? 300 : 0 }}>
                {week.label}
            </div>
        {/each}
    </div>
    <div class="day-header">
        {#each visibleDateRange as date (date.getTime())}
            <div class="header-cell day-cell"
                 class:new-item={isNewDay(date)}
                 style="width: {cellWidthPx - 2}px;
                        left: {dateRange.indexOf(date) * cellWidthPx}px;"
                 in:fly={{ x: 50, duration: 800, delay: isNewDay(date) ? 300 : 0 }}>
                {date.toLocaleDateString('en-US', {weekday: 'short', day: 'numeric'})}
            </div>
        {/each}
    </div>
{:else}
    <div class="day-header">
        {#each visibleDateRange as date (date.getTime())}
            <div class="header-cell"
                 class:new-item={isNewDay(date)}
                 style="width: {cellWidthPx * 24 - 2}px;
                        left: {dateRange.indexOf(date) * cellWidthPx * 24}px;"
                 in:fly={{ x: 50, duration: 800, delay: isNewDay(date) ? 300 : 0 }}>
                {date.toLocaleDateString('en-US', {weekday: 'short', day: 'numeric', month: 'short'})}
            </div>
        {/each}
    </div>
    <div class="hour-header">
        {#each visibleDateRange as date (date.getTime())}
            {#each Array(24) as _, hourIndex}
                <div class="header-cell"
                     class:new-item={isNewDay(date)}
                     style="width: {cellWidthPx - 2}px;
                            left: {(dateRange.indexOf(date) * 24 + hourIndex) * cellWidthPx}px;"
                     in:fly={{ x: 30, duration: 800, delay: isNewDay(date) ? 300 + hourIndex * 20 : 0 }}>
                    {hourIndex.toString().padStart(2, "0")}:00
                </div>
            {/each}
        {/each}
    </div>
{/if}

<style>
    .week-header {
        position: relative;
        height: 30px;
        font-weight: bold;
        background-color: #e0e0e0;
    }

    .hour-header {
        position: relative;
        height: 30px;
    }

    .day-header {
        position: relative;
        height: 30px;
        font-weight: bold;
        background-color: #f0f0f0;
    }

    .header-cell {
        text-align: center;
        border: 1px solid #ccc;
        position: absolute;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.5s ease;
        overflow: hidden;
    }

    .week-cell {
        z-index: 3;
    }

    .day-cell {
        z-index: 2;
    }

    .new-item {
        background-color: #f0f8ff;
        box-shadow: 0 0 5px rgba(0, 100, 255, 0.5);
        z-index: 4;
    }
</style>