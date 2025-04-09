<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import type { Appointment } from './AppointmentData';
    import { getSelectedScale, cellWidthPx, formatTime, formatDate } from '@/utils/calculations';
    import { DragDropService, type DragState, type ResizeState } from '@/utils/DragDropService';
    import { deleteAppointment, savePositionChange, saveResizeChange } from './AppointmentActions';

    export let appointment: Appointment;
    export let width: number;
    export let left: number;
    export let dayStartTimestamp: number;

    const dispatch = createEventDispatcher();
    const dragDropService = new DragDropService();

    let appointmentEl: HTMLElement;
    let gridWidth = 0;
    let isSaving = false;

    // Drag & resize state
    let dragState: DragState = { isDragging: false, startX: 0, startLeft: 0 };
    let resizeState: ResizeState = { isResizing: false, startX: 0, startWidth: 0 };

    onMount(() => {
        const grid = document.querySelector('.rows');
        if (grid) gridWidth = grid.scrollWidth || 5000;
    });

    function handleClick(event: MouseEvent) {
        if (!dragState.isDragging && !resizeState.isResizing) {
            dispatch('edit', appointment);
        }
    }

    async function handleDelete(event: MouseEvent) {
        event.stopPropagation();

        if (confirm(`Weet je zeker dat je "${appointment.title || 'deze afspraak'}" wilt verwijderen?`)) {
            if (await deleteAppointment(appointment)) {
                dispatch('deleted', appointment);
            } else {
                alert('Fout bij het verwijderen van de afspraak. Probeer het opnieuw.');
            }
        }
    }

    // Drag handlers
    function startDrag(event: MouseEvent) {
        if (isSaving ||
            (event.target as HTMLElement).classList.contains('delete-button') ||
            (event.target as HTMLElement).classList.contains('resize-handle')) {
            return;
        }

        dragState = dragDropService.startDrag(appointmentEl, event, left);

        window.addEventListener('mousemove', onDrag);
        window.addEventListener('mouseup', stopDrag);
        event.preventDefault();
    }

    function onDrag(event: MouseEvent) {
        dragDropService.onDrag(appointmentEl, event, dragState, gridWidth, width, cellWidthPx);
    }

    async function stopDrag(event: MouseEvent) {
        if (!dragState.isDragging) return;

        window.removeEventListener('mousemove', onDrag);
        window.removeEventListener('mouseup', stopDrag);

        dragDropService.stopDrag(appointmentEl);

        const newLeft = parseInt(appointmentEl.style.left);
        if (newLeft !== left) {
            isSaving = true;
            const scale = getSelectedScale();
            const success = await savePositionChange(appointment, newLeft, scale, cellWidthPx, dayStartTimestamp);

            if (success) {
                dispatch('updated');
            } else {
                appointmentEl.style.left = `${left}px`;
                alert('Fout bij bijwerken van de afspraak. Probeer het opnieuw.');
            }
            isSaving = false;
        }

        dragState = { isDragging: false, startX: 0, startLeft: 0 };
    }

    // Resize handlers
    function startResize(event: MouseEvent) {
        event.stopPropagation();
        if (isSaving) return;

        resizeState = dragDropService.startResize(appointmentEl, event, width);

        window.addEventListener('mousemove', onResize);
        window.addEventListener('mouseup', stopResize);
        event.preventDefault();
    }

    function onResize(event: MouseEvent) {
        dragDropService.onResize(appointmentEl, event, resizeState, gridWidth, left, cellWidthPx);
    }

    async function stopResize(event: MouseEvent) {
        if (!resizeState.isResizing) return;

        window.removeEventListener('mousemove', onResize);
        window.removeEventListener('mouseup', stopResize);

        dragDropService.stopResize(appointmentEl);

        const newWidth = parseInt(appointmentEl.style.width);
        if (newWidth !== width) {
            isSaving = true;
            const scale = getSelectedScale();
            const success = await saveResizeChange(appointment, newWidth, scale, cellWidthPx);

            if (success) {
                dispatch('updated');
            } else {
                appointmentEl.style.width = `${width}px`;
                alert('Fout bij bijwerken van de afspraak. Probeer het opnieuw.');
            }
            isSaving = false;
        }

        resizeState = { isResizing: false, startX: 0, startWidth: 0 };
    }

    // Touch handlers verkorte implementatie (omwille van beknoptheid)
    function handleTouchStart(event: TouchEvent) {
        if (isSaving) return;

        const touch = event.touches[0];
        const target = event.target as HTMLElement;

        if (target.classList.contains('delete-button') ||
            target.classList.contains('resize-handle')) {
            return;
        }

        const appointmentRect = appointmentEl.getBoundingClientRect();
        const nearRightEdge = Math.abs(appointmentRect.right - touch.clientX) < 20;

        if (nearRightEdge) {
            resizeState = dragDropService.startResize(appointmentEl, touch, width);
        } else {
            dragState = dragDropService.startDrag(appointmentEl, touch, left);
        }

        event.preventDefault();
    }

    function handleTouchMove(event: TouchEvent) {
        const touch = event.touches[0];

        if (dragState.isDragging) {
            dragDropService.onDrag(appointmentEl, touch, dragState, gridWidth, width, cellWidthPx);
        } else if (resizeState.isResizing) {
            dragDropService.onResize(appointmentEl, touch, resizeState, gridWidth, left, cellWidthPx);
        }

        event.preventDefault();
    }

    async function handleTouchEnd() {
        if (dragState.isDragging) {
            dragDropService.stopDrag(appointmentEl);

            const newLeft = parseInt(appointmentEl.style.left);
            if (newLeft !== left) {
                isSaving = true;
                const scale = getSelectedScale();
                const success = await savePositionChange(appointment, newLeft, scale, cellWidthPx, dayStartTimestamp);

                if (success) {
                    dispatch('updated');
                } else {
                    appointmentEl.style.left = `${left}px`;
                }
                isSaving = false;
            }

            dragState = { isDragging: false, startX: 0, startLeft: 0 };
        } else if (resizeState.isResizing) {
            dragDropService.stopResize(appointmentEl);

            const newWidth = parseInt(appointmentEl.style.width);
            if (newWidth !== width) {
                isSaving = true;
                const scale = getSelectedScale();
                const success = await saveResizeChange(appointment, newWidth, scale, cellWidthPx);

                if (success) {
                    dispatch('updated');
                } else {
                    appointmentEl.style.width = `${width}px`;
                }
                isSaving = false;
            }

            resizeState = { isResizing: false, startX: 0, startWidth: 0 };
        }
    }
</script>

<div
        bind:this={appointmentEl}
        class="absolute h-12 mt-[1px] rounded flex justify-between items-center cursor-grab select-none touch-none
        bg-appointments-500 border border-appointments-700 shadow z-10 overflow-hidden whitespace-nowrap transition-colors
         duration-200 hover:bg-appointments-600"
        style="left: {left}px; width: {width}px;"
        on:click={handleClick}
        on:mousedown={startDrag}
        on:touchstart={handleTouchStart}
        on:touchmove={handleTouchMove}
        on:touchend={handleTouchEnd}
        title="{appointment.title || 'Ongetitelde afspraak'} - {formatDate(appointment.startTime)}
        {formatTime(appointment.startTime)} tot {formatTime(appointment.endTime)}"
>
    <div class="overflow-hidden flex-grow">
        <div class="font-bold overflow-hidden text-ellipsis whitespace-nowrap">
            {appointment.title || 'Ongetitelde afspraak'}
        </div>
        <div class="text-sm opacity-90">
            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
        </div>
        {#if appointment.description}
            <div class="text-sm overflow-hidden text-ellipsis whitespace-nowrap opacity-80">
                {appointment.description}
            </div>
        {/if}
    </div>

    <div>
        <button
                class="w-5 h-5 rounded-full bg-white/30 border-none text-white font-bold
                text-sm cursor-pointer flex items-center justify-center transition-opacity duration-200
                p-0 ml-1 group-hover:opacity-100 hover:bg-red-500/60 -mt-5 mr-2"
                on:click={handleDelete}
                title="Verwijder afspraak">
        </button>
    </div>

    <div
            class="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize bg-white/30 opacity-0
            transition-opacity duration-200 hover:opacity-100 group-hover:opacity-100"
            on:mousedown={startResize}
            title="Sleep om de duur aan te passen"
    ></div>
</div>