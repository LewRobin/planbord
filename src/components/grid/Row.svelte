<script lang="ts">
    import Cell from './Cell.svelte';
    import {calculateWidth, calculateLeft} from "./calculations";
    export let appointments: { asset: string; startTime: number; endTime: number; }[];

    // some dummy appointments
    appointments = [
        {asset: "Boot 1", startTime: 1742518800, endTime: 1742533200},
        // { asset: "Boot 2", startTime: 1742605200, endTime: 1742619600 },
        // { asset: "Boot 3", startTime: 1742691600, endTime: 1742706000 },
        {asset: "Boot 4", startTime: 1742778000, endTime: 1742792400},
    ];
</script>

<div class="row">
    {#each appointments as appointment}
        <div class="appointment"
             style="
                left: {calculateLeft(appointment.startTime)}px;
                width: {calculateWidth(appointment.startTime, appointment.endTime)}px;">
            {appointment.asset}
        </div>
    {/each}

    <div class="cells">
        {#each Array(600) as _, i}
            <Cell pixelsPerMinute={1}/>
        {/each}
    </div>
</div>

<style>
    .appointment {
        position: absolute;
        height: 50px;
        border-radius: 15px;
        border: 1px dotted black;
    }

    .cells {
        display: flex;
        white-space: nowrap;
        height: 50px;
    }

    .row {
        height: 50px;
        position: relative;
    }
</style>