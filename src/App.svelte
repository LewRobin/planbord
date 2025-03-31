<script lang="ts">
    import Grid from '../src/components/grid/Grid.svelte';

    let amountOfDays = 20;
</script>
<main>
    <Grid {amountOfDays}/>
</main>

<style>
    main {
        /*border: 1px dotted purple;*/
        font-family: Arial, sans-serif;
        height: 100vh;
        background: #f1f2f6;
    }
</style>