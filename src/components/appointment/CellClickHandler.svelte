<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { getSelectedScale, timeScales } from '../../utils/calculations';

    export let asset: string;
    export let cellIndex: number;
    export let dayStartTimestamp: number;
    export let pixelsPerMinute: number;

    const dispatch = createEventDispatcher();

    function handleCellClick(event: MouseEvent) {
        console.log('Cell clicked:', { asset, cellIndex, scale: getSelectedScale() });

        const selectedScale = getSelectedScale();
        let startTimestamp, endTimestamp;

        if (selectedScale === timeScales.hour) {
            const hourOffset = cellIndex % 24;
            const dayOffset = Math.floor(cellIndex / 24);

            const baseDate = new Date(dayStartTimestamp * 1000);
            baseDate.setDate(baseDate.getDate() + dayOffset);
            baseDate.setHours(hourOffset, 0, 0, 0);

            startTimestamp = Math.floor(baseDate.getTime() / 1000);

            const endDate = new Date(baseDate);
            endDate.setHours(endDate.getHours() + 1);
            endTimestamp = Math.floor(endDate.getTime() / 1000);
        } else {
            const baseDate = new Date(dayStartTimestamp * 1000);
            baseDate.setDate(baseDate.getDate() + cellIndex);
            baseDate.setHours(9, 0, 0, 0);

            startTimestamp = Math.floor(baseDate.getTime() / 1000);

            const endDate = new Date(baseDate);
            endDate.setHours(17, 0, 0, 0);
            endTimestamp = Math.floor(endDate.getTime() / 1000);
        }

        const details = {
            asset,
            startTime: startTimestamp,
            endTime: endTimestamp,
            cellInfo: {
                index: cellIndex,
                scale: selectedScale
            }
        };

        console.log('Dispatching cellClick event with details:', details);

        dispatch('cellClick', details);

        event.stopPropagation();
    }
</script>

<div class="cell-click-area" on:click={handleCellClick} title="Klik om afspraak toe te voegen">
    <slot></slot>
</div>

<style>
    .cell-click-area {
        position: relative;
        width: 100%;
        height: 100%;
        cursor: pointer;
    }

    .cell-click-area:hover {
        background-color: rgba(74, 144, 226, 0.1);
    }
</style>