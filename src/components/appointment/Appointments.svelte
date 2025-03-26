<script lang="ts">
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    let asset = '';
    let startTime = 0; // Begin tijd in uren
    let endTime = 1; // Eind tijd in uren
    let day = 0; // De dag waarop de afspraak plaatsvindt
    let color = 'blue'; // Kleur van de afspraak

    function addAppointment() {
        if (asset && startTime < endTime) {
            const appointment = {
                asset,
                startTime,
                endTime,
                day,
                color
            };
            dispatch('add', appointment);
            // Reset de velden na het toevoegen
            asset = '';
            startTime = 0;
            endTime = 1;
            day = 0;
            color = 'blue';
        } else {
            console.error('Ongeldige afspraakgegevens');
        }
    }
</script>

<div>
    <h2>Voeg Afspraken Toe</h2>
    <input bind:value={asset} placeholder="Asset"/>
    <input bind:value={startTime} placeholder="Begin Tijd" type="number"/>
    <input bind:value={endTime} placeholder="Eind Tijd" type="number"/>
    <input bind:value={day} placeholder="Dag (0, 1, 2, ...)" type="number"/>
    <input bind:value={color} type="color"/>
    <button on:click={addAppointment}>Voeg Afspraak Toe</button>
</div>