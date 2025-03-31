<script lang="ts">
    import Button from '../Button.svelte';
    import AppointmentForm from './AppointmentForm.svelte';
    import { loadAppointments } from './AppointmentData';
    import type { Appointment } from './AppointmentData';

    export let editAppointment: Appointment | null = null;

    let showModal = false;

    function openModal() {
        showModal = true;
    }

    async function handleCreated() {
        await loadAppointments();
    }

    async function handleUpdated() {
        await loadAppointments();
    }
</script>

<Button type="primary" icon="+" on:click={openModal}>
    {editAppointment ? 'Edit Appointment' : 'Add Appointment'}
</Button>

<AppointmentForm
        bind:show={showModal}
        bind:editAppointment={editAppointment}
        on:created={handleCreated}
        on:updated={handleUpdated}
        on:close={() => editAppointment = null}
/>