<script lang="ts">
    import Grid from '../src/components/grid/Grid.svelte';
    import { DarkMode } from 'flowbite-svelte';
    import Navbar from '../src/components/navbar/Navbar.svelte'


    let amountOfDays = 20;
</script>
<main>
    <Navbar/>
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