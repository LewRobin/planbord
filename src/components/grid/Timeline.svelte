<script lang="ts">
    export let amountOfDays: number;

    import {calculateTimeline, getSelectedScale} from "./calculations";

    const timeScales = {
        hour: 15,
        day: 15 * 24,
        week: 15 * 24 * 7
    };

    const currentDate = new Date();

    const getDates = (days: number) => {
        return Array.from({length: days}, (_, index) => {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() + index - Math.floor(days / 2));
            return date;
        });
    };

    const selectedScale = getSelectedScale();

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
                {#each Array(24) as _, index}
                    <div class="header-cell" style="width: {calculateTimeline(selectedScale) - 2}px;">
                        {index.toString().padStart(2, "0")}:00
                    </div>
                {/each}
            {/each}
        </div>
    {:else if selectedScale === timeScales.day}
        <div class="week-header">
            {#each dateRange as date}
                <div class="header-cell {isWeekend(date) ? 'weekend' : ''}" style="min-width: {120}px;">
                    Week {getWeekNumber(date)}
                </div>
            {/each}
        </div>
        <div class="day-header">
            {#each dateRange as date}
                <div class="header-cell" style="width: {selectedScale * 4 - 2}px;">
                    {date.toLocaleDateString()}
                </div>
            {/each}
        </div>
    {:else if selectedScale === timeScales.week}
        <div class="week-header">
            {#each dateRange as date}
                <div class="header-cell {isWeekend(date) ? 'weekend' : ''}" style="min-width: {120}px;">
                    {date.toLocaleDateString()}
                </div>
            {/each}
        </div>
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

    .header-cell.weekend {
        background-color: rgba(255, 0, 0, 0.2);
    }

    .header-cell.weekend::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 0, 0, 0.5);
        transform: rotate(-45deg);
        transform-origin: center;
        z-index: 1;
        pointer-events: none;
    }
</style>