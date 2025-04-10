<script lang="ts">
    import Cell from './Cell.svelte';
    import AppointmentItem from '../appointment/AppointmentItem.svelte';
    import CellClickHandler from '../appointment/CellClickHandler.svelte';
    import AppointmentForm from '../appointment/AppointmentForm.svelte';
    import AvailabilityItem from './AvailabilityItem.svelte';
    import {
        calculateWidth,
        calculateLeft,
        timeScales,
        getSelectedScale
    } from "@/utils/calculations";
    import {onMount, afterUpdate} from 'svelte';
    import {fly} from 'svelte/transition';
    import type { Appointment } from '../appointment/AppointmentData';

    export let appointments: Appointment[];
    export let totalDaysLoaded: number;
    export let assetName: string = "";
    export let isAvailabilityRow: boolean = false;

    const selectedScale = getSelectedScale();
    let rowElement: HTMLElement;
    let visibleRange = {start: 0, end: 2000};
    let prevTotalDaysLoaded = totalDaysLoaded;
    let newlyAddedCells = [];

    let showAppointmentForm = false;
    let editAppointment: Partial<Appointment> | null = null;
    let dayStartTimestamp: number;

    onMount(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dayStartTimestamp = Math.floor(today.getTime() / 1000);
    });

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

    function handleEditAppointment(event) {
        editAppointment = event.detail;
        showAppointmentForm = true;
    }

    function handleCellClick(event) {
        const rowAsset = assetName || (appointments.length > 0 ? appointments[0].asset : "Asset");

        editAppointment = {
            ...event.detail,
            asset: rowAsset
        };

        showAppointmentForm = true;
    }

    function handleCloseForm() {
        showAppointmentForm = false;
        editAppointment = null;
    }
</script>

<div bind:this={rowElement} class="relative overflow-visible h-[50px]">
    {#if !isAvailabilityRow}
        {#each visibleAppointments as appointment, i (appointment._id || `${appointment.asset}-${appointment.startTime}-${i}`)}
            <AppointmentItem
                    appointment={appointment}
                    width={calculateWidth(appointment.startTime, appointment.endTime)}
                    left={calculateLeft(appointment.startTime)}
                    {dayStartTimestamp}
                    on:edit={handleEditAppointment}
                    on:deleted
                    on:updated
            />
        {/each}
    {:else}
        {#each visibleAppointments as availability, i (availability._id || `${availability.asset}-${availability.startTime}-${i}`)}
            <AvailabilityItem
                    availability={availability}
                    width={calculateWidth(availability.startTime, availability.endTime)}
                    left={calculateLeft(availability.startTime)}
                    on:click={handleCellClick}
            />
        {/each}
    {/if}

    <div class="block whitespace-nowrap h-[50px] relative" style="width: {totalWidth}px;">
        {#each visibleCellPositions as cellIndex (cellIndex)}
            <div class="h-[50px] absolute"
                 class:new-cell={isNewCell(cellIndex)}
                 style="left: {cellIndex * CELL_WIDTH_PX}px; width: {CELL_WIDTH_PX}px;"
                 in:fly={{ x: 30, duration: isNewCell(cellIndex) ? 800 : 300, delay: isNewCell(cellIndex) ? 200 : 0 }}>
                <CellClickHandler
                        asset={assetName || (appointments.length > 0 ? appointments[0].asset : "Asset")}
                        {cellIndex}
                        {dayStartTimestamp}
                        pixelsPerMinute={selectedScale === timeScales.hour ? 1 : 1/60}
                        on:cellClick={handleCellClick}
                        isGroupCell={isAvailabilityRow}
                >
                    <Cell pixelsPerMinute={selectedScale === timeScales.hour ? 1 : 1/60}/>
                </CellClickHandler>
            </div>
        {/each}
    </div>

    <AppointmentForm
            bind:show={showAppointmentForm}
            bind:editAppointment={editAppointment}
            on:close={handleCloseForm}
            on:created
            on:updated
    />
</div>