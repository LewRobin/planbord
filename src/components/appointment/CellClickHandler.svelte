<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { getSelectedScale, timeScales } from '@/utils/calculations';

    export let asset: string;
    export let cellIndex: number;
    export let dayStartTimestamp: number;
    export let pixelsPerMinute: number;
    export let isGroupCell: boolean = false;

    const dispatch = createEventDispatcher();

    function handleCellClick(event: MouseEvent) {
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
            isGroupReservation: isGroupCell,
            cellInfo: {
                index: cellIndex,
                scale: selectedScale
            }
        };
        dispatch('cellClick', details);
        event.stopPropagation();
    }
</script>

<div
        class="position-relative w-auto h-auto cursor-pointer"
        on:click={handleCellClick}
        title={isGroupCell ? "Klik om een groepsreservering te maken" : "Klik om afspraak toe te voegen"}>
    <slot></slot>
</div>