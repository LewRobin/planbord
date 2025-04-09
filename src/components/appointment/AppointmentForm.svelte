<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Button from '../Button.svelte';
    import { AppointmentService } from '@/services/AppointmentService';
    import { appointments, loadAppointments } from './AppointmentData';
    import type { Appointment } from './AppointmentData';
    import {
        Modal,
        FloatingLabelInput,
        Textarea,
        Label,
        Datepicker,
        Alert,
        ButtonGroup
    } from 'flowbite-svelte';

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

    $: if (!show) {
        resetForm();
    }

    $: if (editAppointment && show) {
        populateForm(editAppointment);
    }

    function populateForm(appointment: Partial<Appointment>) {
        asset = appointment.asset || '';
        title = appointment.title || '';
        description = appointment.description || '';

        if (appointment.startTime) {
            const startDateTime = new Date(appointment.startTime * 1000);
            startDate = startDateTime.toISOString().split('T')[0];
            startTime = startDateTime.toTimeString().split(' ')[0].substring(0, 5);
        }

        if (appointment.endTime) {
            const endDateTime = new Date(appointment.endTime * 1000);
            endDate = endDateTime.toISOString().split('T')[0];
            endTime = endDateTime.toTimeString().split(' ')[0].substring(0, 5);
        }
    }

    function closeModal() {
        show = false;
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
                errorMessage = 'End time must be after start time silly';
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
                const newAppointment = await AppointmentService.createAppointment(appointmentData);
                appointments.update(current => [...current, newAppointment]);
                dispatch('created', newAppointment);
            }

            await loadAppointments();
            show = false;
        } catch (error) {
            console.error('Error saving appointment:', error);
            errorMessage = 'Failed to save appointment. Please try again.';
        } finally {
            isLoading = false;
        }
    }
</script>

<Modal
        title={editAppointment ? 'Afspraak Aanpassen' : 'Nieuwe Afspraak'}
        bind:open={show}
        size="lg"
        autoclose={false}
>
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        {#if errorMessage}
            <Alert color="red" border>
                {errorMessage}
            </Alert>
        {/if}
        <FloatingLabelInput id="asset" required bind:value={asset}> Asset </FloatingLabelInput>
        <FloatingLabelInput id="title" bind:value={title}> Titel </FloatingLabelInput>

        <div>
            <Label for="description">Description</Label>
            <Textarea id="description" rows={3} bind:value={description} placeholder="Additional details" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <Label for="startDate">Start Date *</Label>
                <input
                        class="block w-full p-2.5 border rounded-lg text-sm"
                        type="date"
                        id="startDate"
                        bind:value={startDate}
                        required
                />
            </div>

            <div>
                <Label for="startTime">Start Time *</Label>
                <input
                        class="block w-full p-2.5 border rounded-lg text-sm"
                        type="time"
                        id="startTime"
                        bind:value={startTime}
                        required
                />
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <Label for="endDate">End Date *</Label>
                <input
                        class="block w-full p-2.5 border rounded-lg text-sm"
                        type="date"
                        id="endDate"
                        bind:value={endDate}
                        required
                />
            </div>

            <div>
                <Label for="endTime">End Time *</Label>
                <input
                        class="block w-full p-2.5 border rounded-lg text-sm"
                        type="time"
                        id="endTime"
                        bind:value={endTime}
                        required
                />
            </div>
        </div>

        <div class="flex justify-end gap-2 pt-4">
            <Button type="secondary" on:click={closeModal}>Cancel</Button>
            <Button type="primary" disabled={isLoading}>
                {isLoading ? 'Saving...' : (editAppointment ? 'Update' : 'Save')}
            </Button>
        </div>
    </form>
</Modal>