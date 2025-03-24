<script lang="ts">
    import Row from './Row.svelte';
    import Timeline from "./Timeline.svelte";
    export let amountOfDays: number;
    export let appointments: { asset: string; startTime: number; endTime: number; day?: number; color?: string }[];

    appointments = [
        {asset: "Asset 1", startTime: 1742518800, endTime: 1742533200},
        {asset: "Asset 1", startTime: 1742882400, endTime: 1742925600},
        {asset: "Asset 2", startTime: 1742778000, endTime: 1742925600},
        {asset: "Asset 2", startTime: 1742954400, endTime: 1742972400},
        {asset: "Asset 3", startTime: 1742778000, endTime: 1742792400},
    ];

    $: uniqueAssets = Array.from(new Set(appointments.map(app => app.asset).filter(Boolean)));
</script>
<div>
    hoi
    <div class="main-container">
        <div class="asset-container">
            {#each uniqueAssets as asset}
                <div class="asset">{asset}</div>
            {/each}
        </div>
        <div class="grid-container">
            <Timeline {amountOfDays} {appointments}/>
            <div class="rows">
                {#each uniqueAssets as asset}
                    <Row appointments={appointments.filter(app => app.asset === asset)}/>
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    .main-container {
        display: flex;
        height: 100vh;
        overflow-y: auto;
    }
    .asset-container {
        padding: 40px;
        position: sticky;
        left: 0;
        background: #fff;
        z-index: 10;
        display: flex;
        flex-direction: column;
    }

    .asset {
        height: 60px;
        width: max-content;
    }
    .grid-container {
        display: flex;
        flex-direction: column;
        white-space: nowrap;
        border: 1px solid red;
        height: 192px;
    }
    .rows {
        display: flex;
        flex-direction: column;
    }
</style>
