<script lang="ts">
    import Cell from './Cell.svelte';
    import {
        calculateWidth,
        calculateLeft,
        timeScales,
        calculateTimeline,
        getSelectedScale
    } from "../../utils/calculations";
    import {onMount, afterUpdate} from 'svelte';
    import {fade, fly} from 'svelte/transition';

    export let appointments: { asset: string; startTime: number; endTime: number; }[];
    export let totalDaysLoaded: number;

    const selectedScale = getSelectedScale();
    let rowElement: HTMLElement;
    let visibleRange = {start: 0, end: 2000};
    let prevTotalDaysLoaded = totalDaysLoaded;
    let newlyAddedCells = [];

    const CELL_WIDTH_PX = 60;

    $: totalWidth = selectedScale === timeScales.hour
        ? CELL_WIDTH_PX * 24 * totalDaysLoaded
        : CELL_WIDTH_PX * totalDaysLoaded;

    $: if (totalDaysLoaded > prevTotalDaysLoaded) {
        const newCellStart = selectedScale === timeScales.hour
            ? prevTotalDaysLoaded * 24
            : prevTotalDaysLoaded;
        const newCellEnd = selectedScale === timeScales.hour
            ? totalDaysLoaded * 24
            : totalDaysLoaded;
        newlyAddedCells = Array.from({length: newCellEnd - newCellStart}, (_, i) => newCellStart + i);
        prevTotalDaysLoaded = totalDaysLoaded;

        setTimeout(() => {
            newlyAddedCells = [];
        }, 3000);
    }

    $: visibleAppointments = appointments.filter(appointment => {
        const left = calculateLeft(appointment.startTime);
        const width = calculateWidth(appointment.startTime, appointment.endTime);
        return left < visibleRange.end + CELL_WIDTH_PX * 48 &&
            left + width > visibleRange.start - CELL_WIDTH_PX * 24;
    });

    $: cellsPerUnit = selectedScale === timeScales.hour ? 24 : 1;
    $: visibleCellStart = Math.floor(visibleRange.start / CELL_WIDTH_PX);
    $: visibleCellEnd = Math.ceil(visibleRange.end / CELL_WIDTH_PX) + 48;
    $: visibleCellCount = visibleCellEnd - visibleCellStart;

    $: visibleCellPositions = Array.from(
        {length: visibleCellCount},
        (_, i) => visibleCellStart + i
    );

    function updateVisibleRange() {
        const rowsContainer = document.querySelector('.rows');
        if (!rowsContainer) return;

        const scrollLeft = rowsContainer.scrollLeft;
        const clientWidth = rowsContainer.clientWidth;

        visibleRange = {
            start: Math.max(0, scrollLeft - CELL_WIDTH_PX * 24),
            end: scrollLeft + clientWidth + CELL_WIDTH_PX * 48
        };
    }

    const isNewCell = (cellIndex) => {
        return newlyAddedCells.includes(cellIndex);
    };

    afterUpdate(() => {
        if (rowElement) {
            rowElement.style.minWidth = `${totalWidth}px`;
        }
    });

    onMount(() => {
        const rowsContainer = document.querySelector('.rows');
        if (rowsContainer) {
            rowsContainer.addEventListener('scroll', updateVisibleRange);
            updateVisibleRange();

            return () => {
                rowsContainer.removeEventListener('scroll', updateVisibleRange);
            };
        }
    });
</script>

<div bind:this={rowElement} class="row">
    {#each visibleAppointments as appointment, i (appointment.startTime)}
        <div class="appointment"
             style="left: {calculateLeft(appointment.startTime)}px; width: {calculateWidth(appointment.startTime, appointment.endTime)}px;"
             in:fly={{ x: 50, duration: 600 }}>
            {appointment.asset}
        </div>
    {/each}
    <div class="cells" style="width: {totalWidth}px;">
        {#each visibleCellPositions as cellIndex}
            <div class="cell-placeholder"
                 class:new-cell={isNewCell(cellIndex)}
                 style="left: {cellIndex * CELL_WIDTH_PX}px; width: {CELL_WIDTH_PX}px;"
                 in:fly={{ x: 30, duration: isNewCell(cellIndex) ? 800 : 300, delay: isNewCell(cellIndex) ? 200 : 0 }}>
                <Cell pixelsPerMinute={selectedScale === timeScales.hour ? 1 : 1/60}/>
            </div>
        {/each}
    </div>
</div>

<style>
    .appointment {
        position: absolute;
        height: 48px;
        margin-top: 1px;
        border-radius: 15px;
        border: 1px dotted black;
        background-color: #5DB1F8;
        z-index: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .cells {
        display: block;
        white-space: nowrap;
        height: 50px;
        position: relative;
    }

    .cell-placeholder {
        position: absolute;
        height: 50px;
        transition: background-color 0.5s ease;
    }

    .new-cell {
        background-color: rgba(173, 216, 230, 0.2);
    }
    .row {
        position: relative;
        overflow: visible;
        height: 50px;
    }
</style>