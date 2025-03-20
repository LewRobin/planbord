<script lang="ts">
    export let amountOfDays: number;
    export let viewMode: string;

    //TODO add this to an option menu and fix dayWidth calc when dynamic grid calc is complete
    const hoursPerDay = 24;
    const dayWidth = 122 * hoursPerDay - 2;

    const currentDate = new Date();

    const getDates = (days: number) => {
        return Array.from({length: days}, (_, index) => {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() + index - Math.floor(days / 2));
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
    {#if viewMode === 'hours'}
        <div class="day-header">
            {#each dateRange as date, index}
                <div class="header-cell " style="min-width: {dayWidth}px;">
                    {index % 1 === 0 ? date.toLocaleDateString() : ''}
                </div>
            {/each}
        </div>
    {:else }
        <div class="week-header">
            {#each dateRange as date}
                <div class="header-cell {isWeekend(date) ? 'weekend' : ''}" style="min-width: {120}px;">
                    Week {getWeekNumber(date)}
                </div>
            {/each}
        </div>
    {/if}

    <div class="header">
        {#if viewMode === 'hours'}
            {#each Array(24 * amountOfDays) as _, index}
                <div class="header-cell">
                    {new Date(index * 60 * 60 * 1000).getUTCHours().toString().padStart(2, "0")}:00
                </div>
            {/each}
        {:else}
            {#each dateRange as date}
                <div class="header-cell">{date.toLocaleDateString()}</div>
            {/each}
        {/if}
    </div>
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

    .day-header {
        display: flex;
        flex-wrap: nowrap;
        font-weight: bold;
        background-color: #f0f0f0;
    }

    .header-cell {
        min-width: 120px;
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