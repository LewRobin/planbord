<script lang="ts">
    import Cell from './Cell.svelte';
    import {calculateWidth, calculateLeft} from "./calculations";
    export let appointments: { asset: string; startTime: number; endTime: number; }[];
</script>

<div class="row">
    {#each appointments as appointment}
        <div class="appointment"
             style="left: {calculateLeft(appointment.startTime)}px; width: {calculateWidth(appointment.startTime, appointment.endTime)}px;">
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
        background-color: #5DB1F8;
    }
    .cells {
        display: flex;
        white-space: nowrap;
        height: 50px;
    }
    .row {
        position: relative;
    }
</style>
