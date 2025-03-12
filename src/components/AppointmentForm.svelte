<script>
    import Controller from '../controllers/Controller.js';

    const controller = new Controller();
    let date = '';
    let time = '';
    let details = '';
    let message = '';

    function addAppointment() {
        const success = controller.createAppointment(date, time, details);
        message = success ? 'Afspraak toegevoegd!' : 'Afspraak kon niet worden toegevoegd.';
    }
</script>

<form on:submit|preventDefault={addAppointment}>
    <input bind:value={date} required type="date"/>
    <input bind:value={time} required type="time"/>
    <input bind:value={details} placeholder="Details" required type="text"/>
    <button type="submit">Voeg Afspraak toe</button>
    <p>{message}</p>
</form>