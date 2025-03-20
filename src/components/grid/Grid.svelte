<script lang="ts">
    import Row from './Row.svelte';
    import Timeline from "./Timeline.svelte";

    export let assets: string[];

    export let amountOfDays: number;
    export let appointments: { asset: string; startTime: number; endTime: number; day: number; color: string }[];
    export let viewMode: string;
</script>
<div class="main-container">
    <div class="asset-container">
        <h2>Asset 1</h2>
        <h2>Asset 2</h2>
        <h2>Asset 3</h2>
    </div>
    <div class="grid-container">
        <Timeline {amountOfDays} {viewMode}/>
        <div class="rows">
            {#each assets as asset}
                <Row asset={asset} days={amountOfDays} appointments={appointments} viewMode={viewMode}/>
            {/each}
        </div>
    </div>
</div>


<style>
    .main-container {
        display: flex;
    }

    .asset-container {
        display: flex;
        flex-direction: column;
        height: 100px;
    }

    .grid-container {
        display: flex;
        flex-direction: column;
        overflow-x: auto;
        white-space: nowrap;
        width: 100%;
    }

    .rows {
        display: flex;
        flex-direction: column;
    }
</style>