<script lang="ts">
    import { createEventDispatcher, onMount, afterUpdate } from 'svelte';
    import { AppointmentService } from '@/services/AppointmentService';
    import { appointments, loadAppointments } from './AppointmentData';
    import type { Appointment } from './AppointmentData';
    import {
        Modal,
        Button,
        FloatingLabelInput,
        Textarea,
        Label,
        Datepicker,
        Timepicker,
        Alert,
        Select
    } from 'flowbite-svelte';
    import { assetGroups } from '../../utils/assetGroupStore';

    export let show = false;
    export let editAppointment: Partial<Appointment> | null = null;

    const dispatch = createEventDispatcher();

    let minTime = "08:00";
    let maxTime = "18:00";

    let asset = '';
    let assetGroup = '';
    let title = '';
    let description = '';
    let isGroupReservation = false;

    let startDateObj: Date | null = null;
    let endDateObj: Date | null = null;

    let startTime = '09:00';
    let endTime = '17:00';

    let isLoading = false;
    let errorMessage = '';
    let availableAssets = [];

    let renderCount = 0;
    let lastTimepickerEvent = 'Geen';

    async function calculateAvailableAssets() {
        if (!startDateObj || !endDateObj || !startTime || !endTime) return;

        try {
            const startDate = formatDateForTimestamp(startDateObj);
            const endDate = formatDateForTimestamp(endDateObj);

            const startTimestamp = await AppointmentService.convertToTimestamp(
                startDate,
                startTime
            );

            const endTimestamp = await AppointmentService.convertToTimestamp(
                endDate,
                endTime
            );

            const allAppointments = $appointments || [];

            if (isGroupReservation && assetGroup) {
                const group = $assetGroups.find(g => g.id === assetGroup);
                if (group) {
                    availableAssets = group.assets.filter(groupAsset => {
                        const hasOverlap = allAppointments.some(app =>
                            app.asset === groupAsset &&
                            app.startTime < endTimestamp &&
                            app.endTime > startTimestamp
                        );
                        return !hasOverlap;
                    });
                }
            }
        } catch (error) {
            console.error('Error calculating available assets:', error);
        }
    }

    afterUpdate(() => {
        renderCount++;
    });

    $: if (!show) {
        resetForm();
    }

    $: if (editAppointment && show) {
        populateForm(editAppointment);
    }

    $: {
        if (isGroupReservation && startDateObj && endDateObj && startTime && endTime) {
            calculateAvailableAssets();
        }
    }

    function populateForm(appointment: Partial<Appointment>) {
        asset = appointment.asset || '';
        title = appointment.title || '';
        description = appointment.description || '';
        isGroupReservation = appointment.isGroupReservation || false;

        if (isGroupReservation) {
            const group = $assetGroups.find(g => g.assets.some(a => a === asset));
            if (group) {
                assetGroup = group.id;
            }
        }

        if (appointment.startTime) {
            const startDateTime = new Date(appointment.startTime * 1000);
            startDateObj = new Date(
                startDateTime.getFullYear(),
                startDateTime.getMonth(),
                startDateTime.getDate(),
                12, 0, 0
            );

            startTime = startDateTime.toTimeString().split(' ')[0].substring(0, 5);
        }

        if (appointment.endTime) {
            const endDateTime = new Date(appointment.endTime * 1000);
            endDateObj = new Date(
                endDateTime.getFullYear(),
                endDateTime.getMonth(),
                endDateTime.getDate(),
                12, 0, 0
            );

            endTime = endDateTime.toTimeString().split(' ')[0].substring(0, 5);
        }

        if (isGroupReservation) {
            calculateAvailableAssets();
        }
    }

    function closeModal() {
        show = false;
    }

    function resetForm() {
        asset = '';
        assetGroup = '';
        title = '';
        description = '';
        startDateObj = null;
        endDateObj = null;
        startTime = '09:00';
        endTime = '17:00';
        errorMessage = '';
        isGroupReservation = false;
        editAppointment = null;
        availableAssets = [];
    }

    function formatDateForTimestamp(dateObj: Date | null): string {
        if (!dateObj) return '';

        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    async function handleSubmit() {
        try {
            isLoading = true;
            errorMessage = '';

            if (isGroupReservation) {
                if (!assetGroup || availableAssets.length === 0) {
                    errorMessage = 'Geen beschikbare assets in deze groep voor de geselecteerde tijd';
                    isLoading = false;
                    return;
                }

                asset = availableAssets[0];
            } else if (!asset) {
                errorMessage = 'Selecteer een asset';
                isLoading = false;
                return;
            }

            if (!startDateObj || !endDateObj) {
                errorMessage = 'Vul alle verplichte velden in';
                console.log('Validation error:', errorMessage);
                isLoading = false;
                return;
            }

            const startDate = formatDateForTimestamp(startDateObj);
            const endDate = formatDateForTimestamp(endDateObj);

            const startTimestamp = await AppointmentService.convertToTimestamp(
                startDate,
                startTime
            );

            const endTimestamp = await AppointmentService.convertToTimestamp(
                endDate,
                endTime
            );

            if (startTimestamp >= endTimestamp) {
                errorMessage = 'Eindtijd moet na starttijd liggen';
                console.log('Validation error:', errorMessage);
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
            errorMessage = 'Kon afspraak niet opslaan. Probeer het opnieuw.';
        } finally {
            isLoading = false;
        }
    }

    function handleStartTimeSelect(event) {
        lastTimepickerEvent = 'startTime';
        startTime = event.detail.time || event.detail;

        if (isGroupReservation) {
            calculateAvailableAssets();
        }
    }

    function handleEndTimeSelect(event) {
        lastTimepickerEvent = 'endTime';
        endTime = event.detail.time || event.detail;

        if (isGroupReservation) {
            calculateAvailableAssets();
        }
    }

    function toggleGroupReservation() {
        isGroupReservation = !isGroupReservation;

        if (isGroupReservation) {
            asset = '';

            if (!assetGroup && editAppointment && editAppointment.asset) {
                const group = $assetGroups.find(g => g.assets.some(a => a === editAppointment.asset));
                if (group) {
                    assetGroup = group.id;
                    calculateAvailableAssets();
                }
            }
        } else {
            if (availableAssets.includes(asset)) {
                // Doe niets, behoud de asset
            } else if (availableAssets.length > 0) {
                asset = availableAssets[0];
            }
        }
    }

    function handleGroupChange() {
        if (isGroupReservation && assetGroup) {
            calculateAvailableAssets();
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

        <div class="flex items-center gap-2 mb-4">
            <input
                    type="checkbox"
                    id="groupReservation"
                    bind:checked={isGroupReservation}
                    on:change={toggleGroupReservation}
            />
            <Label for="groupReservation" class="cursor-pointer">Groepsreservering</Label>
        </div>

        {#if isGroupReservation}
            <div>
                <Label for="assetGroup">Assetgroep *</Label>
                <Select id="assetGroup" bind:value={assetGroup} on:change={handleGroupChange} required>
                    <option value="" disabled selected>Selecteer een groep</option>
                    {#each $assetGroups || [] as group}
                        <option value={group.id}>{group.name}</option>
                    {/each}
                </Select>

                {#if assetGroup && availableAssets.length === 0 && startDateObj && endDateObj}
                    <p class="text-red-500 text-sm mt-1">
                        Geen beschikbare assets in deze groep voor de geselecteerde tijd
                    </p>
                {:else if assetGroup && availableAssets.length > 0}
                    <p class="text-green-600 text-sm mt-1">
                        {availableAssets.length} beschikbare asset(s): {availableAssets.join(', ')}
                    </p>
                {/if}
            </div>
        {:else}
            <FloatingLabelInput id="asset" required bind:value={asset}>Asset</FloatingLabelInput>
        {/if}

        <FloatingLabelInput id="title" bind:value={title}>Huurder</FloatingLabelInput>

        <div>
            <Label for="description">Beschrijving</Label>
            <Textarea id="description" rows={3} bind:value={description} placeholder="Extra details over de afspraak" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <Label for="startDate">Startdatum *</Label>
                <Datepicker
                        id="startDate"
                        bind:value={startDateObj}
                        required
                        placeholder="Selecteer startdatum"
                />
            </div>

            <div>
                <Label for="startTime">Starttijd *</Label>
                <Timepicker
                        id="startTime"
                        bind:value={startTime}
                        min={minTime}
                        max={maxTime}
                        on:select={handleStartTimeSelect}
                />
                <p class="text-xs text-gray-500 mt-1">Huidige waarde: {startTime}</p>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <Label for="endDate">Einddatum *</Label>
                <Datepicker
                        id="endDate"
                        bind:value={endDateObj}
                        required
                        placeholder="Selecteer einddatum"
                />
            </div>

            <div>
                <Label for="endTime">Eindtijd *</Label>
                <Timepicker
                        id="endTime"
                        bind:value={endTime}
                        min={minTime}
                        max={maxTime}
                        on:select={handleEndTimeSelect}
                />
                <p class="text-xs text-gray-500 mt-1">Huidige waarde: {endTime}</p>
            </div>
        </div>

        <div class="flex justify-end gap-2 pt-4">
            <Button color="alternative" on:click={closeModal}>Annuleren</Button>
            <Button type="submit" disabled={isLoading || (isGroupReservation && availableAssets.length === 0)}>
                {isLoading ? 'Bezig met opslaan...' : (editAppointment ? 'Bijwerken' : 'Opslaan')}
            </Button>
        </div>
    </form>
</Modal>