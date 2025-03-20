<script lang="ts">
    import Grid from '../src/components/grid/Grid.svelte';
    import Appointments from '../src/components/grid/Appointments.svelte';

    let assets = ["Asset 1", "Asset 2", "Asset 3"];
    let amountOfDays = 14;
    let viewMode = 'hours';

    let appointments = [
        {asset: 'Asset 1', startTime: 0, endTime: 12, day: 0, color: 'red'},
        // { asset: 'Asset 1', startTime: 12, endTime: 24, day: 0, color: 'blue' },
        {asset: 'Asset 2', startTime: 0, endTime: 12, day: 1, color: 'green'},
        {asset: 'Asset 2', startTime: 13, endTime: 22, day: 2, color: 'orange'},
        {asset: 'Asset 3', startTime: 0, endTime: 12, day: 2, color: 'pink'}
    ];

    function handleAddAppointment(event: CustomEvent) {
        appointments = [...appointments, event.detail];
        console.log('Afspraken toegevoegd:', event.detail);
    }

    function toggleViewMode() {
        viewMode = viewMode === 'hours' ? 'days' : 'hours';
    }
</script>

<main>
    <h1>Afspraak Grid</h1>
    <button on:click={toggleViewMode}>Wissel weergave naar {viewMode === 'hours' ? 'dagen' : 'uren'}</button>
    <Appointments on:add={handleAddAppointment}/>
    <Grid {amountOfDays} {appointments} {assets} {viewMode}/>
</main>

<style>
    main {
        padding: 20px;
        font-family: Arial, sans-serif;
    }
</style>