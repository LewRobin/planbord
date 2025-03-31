<script>
    import {onMount} from 'svelte';
    import {timeScales, getSelectedScale, setSelectedScale} from '@/utils/calculations.js';
    import {writable} from 'svelte/store';
    import Button from "../Button.svelte";

    const currentScale = writable(getSelectedScale());

    const scaleLabels = {
        [timeScales.halfHour]: '30 min',
        [timeScales.hour]: 'Uur',
        [timeScales.day]: 'Dag'
    };

    const availableScales = [
        {value: timeScales.halfHour, label: scaleLabels[timeScales.halfHour]},
        {value: timeScales.hour, label: scaleLabels[timeScales.hour]},
        {value: timeScales.day, label: scaleLabels[timeScales.day]}
    ];

    function changeScale(newScale) {
        setSelectedScale(newScale);
        currentScale.set(newScale);

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

            window.dispatchEvent(new CustomEvent('forceTimelineUpdate', {
                detail: {scale: newScale, timestamp: Date.now()}
            }));

            if (timelineContainer) {
                timelineContainer.dispatchEvent(new Event('scroll', {bubbles: true}));
            }
            if (rowsContainer) {
                rowsContainer.dispatchEvent(new Event('scroll', {bubbles: true}));
            }
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