<script lang="ts">
    import Cell from './Cell.svelte';

    export let asset: string;
    export let days: number;
    export let appointments: { asset: string; startTime: number; endTime: number; day: number; color: string }[];
    export let viewMode: string;

    let cells = [];
    const totalHoursInADay = 24;

    // reactively generate cells based on view mode
    $: {
        cells = [];
        for (let day = 0; day < days; day++) {
            for (let hour = 0; hour < (viewMode === 'hours' ? totalHoursInADay : 1); hour++) {
                let cellTime = day * totalHoursInADay + hour;

                let cell = {
                    key: cellTime,
                    time: cellTime,
                    isAppointment: false,
                    color: 'transparent'
                };

                let appointment = appointments.find(appointment =>
                    appointment.asset === asset &&
                    appointment.day === day &&
                    hour >= appointment.startTime && hour < appointment.endTime
                );

                if (appointment) {
                    cell = {...cell, isAppointment: true, color: appointment.color};
                }

                if (viewMode === 'days') {
                    let dayAppointment = appointments.find(appointment =>
                        appointment.asset === asset &&
                        appointment.day === day &&
                        appointment.startTime < totalHoursInADay &&
                        appointment.endTime > 0
                    );

                    if (dayAppointment) {
                        cell = {...cell, isAppointment: true, color: dayAppointment.color};
                    }
                }

                cells = [...cells, cell];
            }
        }
    }
</script>

<div class="row">
    <h2>{asset}</h2>
    <div class="cells">
        {#each cells as cell (cell.key)}
            <Cell {...cell}/>
        {/each}
    </div>
</div>

<style>
    .cells {
        display: flex;
        white-space: nowrap;
    }

    .row {
        margin-bottom: 10px;
    }
</style>