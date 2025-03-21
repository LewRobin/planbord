<script lang="ts">
    import Cell from './Cell.svelte';
    import {calculateWidth, calculateLeft, getSelectedScale} from "./calculations";
    export let appointments: { asset: string; startTime: number; endTime: number; }[];
    export let pixelsPerMinute: number = 1;
    export let minimumTime;

    const selectedScale = getSelectedScale();

    const minutesPerCell = selectedScale;

    // some dummy appointments
    appointments = [
        {asset: "Boot 1", startTime: 0, endTime: 0 + (4 * 15)},
        // { asset: "Boot 2", startTime: 300, endTime: 300 + (6 * minimumTime)},
        {asset: "Boot 3", startTime: 1742432400, endTime: 1742450400},
        {asset: "Boot 4", startTime: 60, endTime: 60 + (1 * 15)},
        // { asset: "Boot 4", startTime: 75, endTime: 75 + (1 * minimumTime) },
        // { asset: "Boot 4", startTime: 90, endTime: 90 + (1 * minimumTime) },
        // { asset: "Boot 5", startTime: 600, endTime: 600 + (400 * minimumTime) },
    ];
</script>

<div class="row">
    {#each appointments as appointment}
        <div class="appointment"
             style="
                left: {calculateLeft(appointment.startTime)}px;
                width: {calculateWidth(appointment.startTime, appointment.endTime)}px;">
        </div>
    {/each}

    <!--    TODO add lazy loading for the cells here-->
    <div class="cells">
        {#each Array(600 * (60 / minutesPerCell)) as _, i}
            <Cell pixelsPerMinute={pixelsPerMinute}/>
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