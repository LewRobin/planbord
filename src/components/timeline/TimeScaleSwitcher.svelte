<script>
    import {onMount} from 'svelte';
    import {timeScales, getSelectedScale, setSelectedScale} from '../../utils/calculations';
    import {writable} from 'svelte/store';
    import Button from "../Button.svelte";

    const currentScale = writable(getSelectedScale());

    const scaleLabels = {
        [timeScales.hour]: 'Uur',
        [timeScales.day]: 'Dag',
        [timeScales.week]: 'Week'
    };

    const availableScales = [
        {value: timeScales.hour, label: scaleLabels[timeScales.hour]},
        {value: timeScales.day, label: scaleLabels[timeScales.day]}
        // { value: timeScales.week, label: scaleLabels[timeScales.week] }
    ];

    function changeScale(newScale) {
        setSelectedScale(newScale);
        currentScale.set(newScale);

        resetBoard(newScale);
    }

    function resetBoard(newScale) {
        const timelineContainer = document.querySelector('.timeline-container');
        const rowsContainer = document.querySelector('.rows');

        if (timelineContainer) timelineContainer.scrollLeft = 0;
        if (rowsContainer) rowsContainer.scrollLeft = 0;

        window.dispatchEvent(new CustomEvent('timeScaleChanged', {
            detail: {scale: newScale},
            bubbles: true,
        }));

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));

            setTimeout(() => {
                const timelineHeader = document.querySelector('.timeline-header');
                const dayHeader = document.querySelector('.day-header');
                const weekHeader = document.querySelector('.week-header');
                const hourHeader = document.querySelector('.hour-header');

                if (timelineHeader && timelineHeader.parentNode) {
                    const parent = timelineHeader.parentNode;
                    const clone = timelineHeader.cloneNode(true);
                    parent.removeChild(timelineHeader);
                    parent.appendChild(clone);
                }

                if (dayHeader) dayHeader.style.display = 'none';
                if (weekHeader) weekHeader.style.display = 'none';
                if (hourHeader) hourHeader.style.display = 'none';

                setTimeout(() => {
                    if (dayHeader) dayHeader.style.display = '';
                    if (weekHeader) weekHeader.style.display = '';
                    if (hourHeader) hourHeader.style.display = '';

                    window.dispatchEvent(new CustomEvent('forceTimelineUpdate', {
                        detail: {scale: newScale, timestamp: Date.now(), complete: true}
                    }));

                    if (timelineContainer) {
                        timelineContainer.dispatchEvent(new Event('scroll', {bubbles: true}));
                    }
                    if (rowsContainer) {
                        rowsContainer.dispatchEvent(new Event('scroll', {bubbles: true}));
                    }
                }, 50);
            }, 50);
        }, 50);
    }

    onMount(() => {
        currentScale.set(getSelectedScale());

        const checkScale = setInterval(() => {
            const scale = getSelectedScale();
            if ($currentScale !== scale) {
                currentScale.set(scale);
            }
        }, 1000);

        return () => clearInterval(checkScale);
    });
</script>

<div class="scale-switcher">
    {#each availableScales as scale}
        <Button
                type="secondary"
                active={$currentScale === scale.value}
                on:click={() => changeScale(scale.value)}
        >
            {scale.label}
        </Button>
    {/each}
</div>

<style>
    .scale-switcher {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 100;
        display: flex;
        gap: 4px;
    }
</style>