<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Button from '../Button.svelte';
    import { AppointmentService } from '../../services/AppointmentService';
    import type { Appointment } from '../../models/AppointmentData';

    export let show = false;
    export let editAppointment: Partial<Appointment> | null = null;

    const dispatch = createEventDispatcher();

    let asset = '';
    let title = '';
    let description = '';
    let startDate = '';
    let startTime = '';
    let endDate = '';
    let endTime = '';
    let isLoading = false;
    let errorMessage = '';

    $: {
        if (editAppointment) {
            if (editAppointment.asset) asset = editAppointment.asset;
            if (editAppointment.title) title = editAppointment.title;
            if (editAppointment.description) description = editAppointment.description;

            if (editAppointment.startTime) {
                const startDateTime = new Date(editAppointment.startTime * 1000);
                startDate = startDateTime.toISOString().split('T')[0];
                startTime = startDateTime.toTimeString().split(' ')[0].substring(0, 5);
            }

            if (editAppointment.endTime) {
                const endDateTime = new Date(editAppointment.endTime * 1000);
                endDate = endDateTime.toISOString().split('T')[0];
                endTime = endDateTime.toTimeString().split(' ')[0].substring(0, 5);
            }
        }
    }

    function closeModal() {
        show = false;
        resetForm();
        dispatch('close');
    }

    function resetForm() {
        asset = '';
        title = '';
        description = '';
        startDate = '';
        startTime = '';
        endDate = '';
        endTime = '';
        errorMessage = '';
        editAppointment = null;
    }

    async function handleSubmit() {
        try {
            isLoading = true;
            errorMessage = '';

            if (!asset || !startDate || !startTime || !endDate || !endTime) {
                errorMessage = 'Please fill in all required fields';
                isLoading = false;
                return;
            }

            const startTimestamp = await AppointmentService.convertToTimestamp(startDate, startTime);
            const endTimestamp = await AppointmentService.convertToTimestamp(endDate, endTime);

            if (startTimestamp >= endTimestamp) {
                errorMessage = 'End time must be after start time';
                isLoading = false;
                return;
            }

            const appointmentData = {
                asset,
                title,
                description,
                startTime: startTimestamp,
                endTime: endTimestamp
            };

            if (editAppointment && editAppointment._id) {
                await AppointmentService.updateAppointment(editAppointment._id, appointmentData);
                dispatch('updated');
            } else {
                await AppointmentService.createAppointment(appointmentData);
                dispatch('created');
            }

            closeModal();
        } catch (error) {
            console.error('Error saving appointment:', error);
            errorMessage = 'Failed to save appointment. Please try again.';
        } finally {
            isLoading = false;
        }
    }
</script>

{#if show}
    <div class="modal-overlay">
        <div class="modal-container">
            <div class="modal-header">
                <h2>{editAppointment ? 'Edit Appointment' : 'Add New Appointment'}</h2>
                <button class="close-button" on:click={closeModal}>×</button>
            </div>

            <div class="modal-body">
                {#if errorMessage}
                    <div class="error-message">{errorMessage}</div>
                {/if}

                <form on:submit|preventDefault={handleSubmit}>
                    <div class="form-group">
                        <label for="asset">Asset *</label>
                        <input type="text" id="asset" bind:value={asset} placeholder="Asset name" required>
                    </div>

                    <div class="form-group">
                        <label for="title">Title</label>
                        <input type="text" id="title" bind:value={title} placeholder="Appointment title">
                    </div>

                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea id="description" bind:value={description} placeholder="Additional details"></textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="startDate">Start Date *</label>
                            <input type="date" id="startDate" bind:value={startDate} required>
                        </div>

                        <div class="form-group">
                            <label for="startTime">Start Time *</label>
                            <input type="time" id="startTime" bind:value={startTime} required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="endDate">End Date *</label>
                            <input type="date" id="endDate" bind:value={endDate} required>
                        </div>

                        <div class="form-group">
                            <label for="endTime">End Time *</label>
                            <input type="time" id="endTime" bind:value={endTime} required>
                        </div>
                    </div>

                    <div class="form-actions">
                        <Button type="secondary" on:click={closeModal}>Cancel</Button>
                        <Button type="primary" disabled={isLoading}>
                            {isLoading ? 'Saving...' : (editAppointment ? 'Update' : 'Save')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-container {
        background-color: white;
        border-radius: 8px;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
    }

    .close-button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        margin: 0;
        color: #666;
    }

    .modal-body {
        padding: 24px;
    }

    .form-group {
        margin-bottom: 16px;
        width: 100%;
    }

    .form-row {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
    }

    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
    }

    .form-group input,
    .form-group textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
    }

    .form-group textarea {
        min-height: 100px;
        resize: vertical;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
    }

    .error-message {
        color: #d32f2f;
        background-color: #ffebee;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 16px;
    }
</style>