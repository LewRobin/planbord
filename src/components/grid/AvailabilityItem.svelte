<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { formatTime } from '@/utils/calculations';

    export let availability: any;
    export let width: number;
    export let left: number;

    const dispatch = createEventDispatcher();
    let availabilityEl: HTMLElement;

    function handleClick() {
        dispatch('click', {
            startTime: availability.startTime,
            endTime: availability.endTime,
            asset: availability.asset,
            isGroupReservation: true
        });
    }

    function calculateHoursDiff(): number {
        if (!availability) return 0;
        return Math.round((availability.endTime - availability.startTime) / 3600);
    }

    const hoursDiff = calculateHoursDiff();

    onMount(() => {
        if (availabilityEl) {
            availabilityEl.style.left = `${left}px`;
            availabilityEl.style.width = `${width}px`;
        }
    });
</script>

<div
        bind:this={availabilityEl}
        class="availability-slot absolute h-12 mt-[1px] rounded flex items-center justify-center select-none
        bg-green-200 border border-green-300 shadow z-10 cursor-pointer
        transition-colors duration-200 hover:bg-green-300"
        style="left: {left}px; width: {width}px;"
        on:click={handleClick}
        title="Beschikbaar van {formatTime(availability.startTime)} tot {formatTime(availability.endTime)} - Klik om te reserveren"
>
    <div class="text-sm font-medium text-green-800 text-center flex flex-col w-full">
        <div class="whitespace-nowrap overflow-hidden text-ellipsis px-2">
            {hoursDiff > 2 ? 'Beschikbaar' : ''}
        </div>
        <div class="text-xs opacity-80 whitespace-nowrap overflow-hidden">
            {hoursDiff > 1 ? `${formatTime(availability.startTime)} - ${formatTime(availability.endTime)}` : ''}
        </div>
    </div>
</div>

<style>
    .availability-slot {
        opacity: 0.9;
    }

    .availability-slot:hover {
        opacity: 1;
        box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.5);
    }
</style>