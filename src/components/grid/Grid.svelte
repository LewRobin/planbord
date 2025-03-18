<script lang="ts">
    import Row from './Row.svelte';

    export let assets: string[];
    export let amountOfDays: number;
    export let appointments: { asset: string; startTime: number; endTime: number; day: number; color: string }[];
    export let viewMode: string;
</script>

<div class="grid-container">
    <div class="header">
        {#if viewMode === 'hours'}
            {#each Array(24 * amountOfDays) as _, index}
                <div class="header-cell">
                    {new Date(index * 60 * 60 * 1000).getUTCHours().toString().padStart(2, "0")}:00
                </div>
            {/each}
        {:else}
            {#each Array(amountOfDays) as _, day}
                <div class="header-cell">Day {day + 1}</div>
            {/each}
        {/if}
    </div>
    <div class="rows">
        {#each assets as asset}
            <Row asset={asset} days={amountOfDays} appointments={appointments} viewMode={viewMode}/>
        {/each}
    </div>
</div>

<style>
    .grid-container {
        display: flex;
        flex-direction: column;
        overflow-x: auto;
        white-space: nowrap;
        width: 100%;
    }

    .header {
        display: flex;
        flex-wrap: nowrap;
    }

    .header-cell {
        min-width: 120px;
        text-align: center;
        font-weight: bold;
        border: 1px solid #ccc;
    }

    .rows {
        display: flex;
        flex-direction: column;
    }
</style>