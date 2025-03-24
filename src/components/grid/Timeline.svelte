<script lang="ts">
    import {unixTimestampToDate} from './calculations'
    export let amountOfDays: number;
    export let appointments: { asset: string; startTime: number; endTime: number; }[];

    appointments = [];

    import {calculateTimeline, getSelectedScale, timeScales} from "./calculations";

    // TODO when adding dynamic scrolling should update this every so often to keep calculations low
    const getEarliestAppointmentDate = () => {
        if (appointments.length === 0) return new Date();
        const earliestTimestamp = Math.min(...appointments.map(appointment => appointment.startTime));
        return unixTimestampToDate(earliestTimestamp);
    };

    const baseDate = getEarliestAppointmentDate();
    const selectedScale = getSelectedScale();

    const getDates = (days: number) => {
        return Array.from({length: days}, (_, index) => {
            const date = new Date(baseDate);
            date.setDate(baseDate.getDate() + index);
            return date;
        });
    };

    const dateRange = getDates(amountOfDays);

    const getWeekNumber = (date: Date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const daysInFirstWeek = (firstDayOfYear.getDay() === 0 ? 6 : firstDayOfYear.getDay() - 1);
        return Math.ceil((date.getTime() - firstDayOfYear.getTime() + (daysInFirstWeek * 86400000)) / 604800000);
    };

    const isWeekend = (date: Date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };
</script>

<div>
    <!--    TODO add halfhour, and maybe week implementation somewhere here-->
    {#if selectedScale === timeScales.hour}
        <div class="day-header">
            {#each dateRange as date}
                <div class="header-cell" style="width: {calculateTimeline(selectedScale) * 24 - 2}px;">
                    {date.toLocaleDateString()}
                </div>
            {/each}
        </div>
        <div class="hour-header">
            {#each Array(amountOfDays) as _, index}
                {#each Array(24) as _, hourIndex}
                    <div class="header-cell" style="width: {calculateTimeline(selectedScale) - 2}px;">
                        {hourIndex.toString().padStart(2, "0")}:00
                    </div>
                {/each}
            {/each}
        </div>

    {:else if selectedScale === timeScales.day}
        <div class="week-header">
            {#each dateRange as date}
                <div class="header-cell"
                     style="min-width: {calculateTimeline(selectedScale) / 24 * 7 - 2}px;">
                    Week {getWeekNumber(date)}
                </div>
            {/each}
        </div>
        <div class="day-header">
            {#each dateRange as date}
                <div class="header-cell" style="width: {calculateTimeline(selectedScale) / 12 - 2}px;">
                    {date.toLocaleDateString()}
                </div>
            {/each}
        </div>
        <!--{:else if selectedScale === timeScales.week}-->
        <!--    <div class="week-header">-->
        <!--        {#each dateRange as date}-->
        <!--            <div class="header-cell {isWeekend(date) ? 'weekend' : ''}" style="min-width: {120}px;">-->
        <!--                {date.toLocaleDateString()}-->
        <!--            </div>-->
        <!--        {/each}-->
        <!--    </div>-->
    {/if}
</div>

<style>
    .header {
        display: flex;
        flex-wrap: nowrap;
    }

    .week-header {
        display: flex;
        flex-wrap: nowrap;
        font-weight: bold;
        background-color: #e0e0e0;
    }

    .hour-header {
        display: flex;
    }

    .day-header {
        display: flex;
        flex-wrap: nowrap;
        font-weight: bold;
        background-color: #f0f0f0;
    }

    .header-cell {
        text-align: center;
        border: 1px solid #ccc;
        position: relative;
    }
</style>