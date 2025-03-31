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

<div class="appointment"
     bind:this={appointmentEl}
     style="left: {left}px; width: {width}px;"
     on:click={handleClick}
     on:mousedown={startDrag}
     on:touchstart={handleTouchStart}
     on:touchmove={handleTouchMove}
     on:touchend={handleTouchEnd}
     title="{appointment.title || 'Ongetitelde afspraak'} - {formatDate(appointment.startTime)} {formatTime(appointment.startTime)} tot {formatTime(appointment.endTime)}">

    <div class="appointment-content">
        <div class="appointment-title">{appointment.title || 'Ongetitelde afspraak'}</div>
        <div class="appointment-time">
            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
        </div>
        {#if appointment.description}
            <div class="appointment-description">{appointment.description}</div>
        {/if}
    </div>

    <div class="appointment-controls">
        <button class="delete-button" on:click={handleDelete} title="Verwijder afspraak">×</button>
    </div>

    <div class="resize-handle" on:mousedown={startResize} title="Sleep om de duur aan te passen"></div>
</div>

<style>
    .appointment {
        position: absolute;
        height: 48px;
        margin-top: 1px;
        border-radius: 4px;
        border: 1px solid #085da5;
        background-color: #5DB1F8;
        z-index: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: grab;
        transition: background-color 0.2s;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        user-select: none;
        touch-action: none;
    }

    .appointment:hover {
        background-color: #4a90e2;
    }

    .appointment-content {
        overflow: hidden;
        flex-grow: 1;
    }

    .appointment-title {
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .appointment-time {
        font-size: 0.8em;
        opacity: 0.9;
    }

    .appointment-description {
        font-size: 0.8em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        opacity: 0.8;
    }

    .delete-button {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.3);
        border: none;
        color: white;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
        padding: 0;
        margin-left: 4px;
    }

    .appointment:hover .delete-button {
        opacity: 1;
    }

    .delete-button:hover {
        background-color: rgba(255, 0, 0, 0.6);
    }

    .resize-handle {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 8px;
        cursor: e-resize;
        background-color: rgba(255, 255, 255, 0.3);
        opacity: 0;
        transition: opacity 0.2s;
    }

    .appointment:hover .resize-handle {
        opacity: 1;
    }
</style>