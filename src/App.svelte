<script lang="ts">
    import Grid from '../src/components/grid/Grid.svelte';

    let assets = ["Asset 1", "Asset 2", "Asset 3"];
    let amountOfDays = 20;

    let appointments = [
        // Voeg hier je afspraken toe
    ];

    function handleAddAppointment(event: CustomEvent) {
        appointments = [...appointments, event.detail];
        console.log('Afspraken toegevoegd:', event.detail);
    }
</script>
<main>
    <Grid {amountOfDays} {appointments}/>
</main>

<style>
    main {
        /*padding: 20px;*/
        font-family: Arial, sans-serif;
        height: 100vh;
        overflow: hidden;
        background: #f1f2f6;
    }
</style>