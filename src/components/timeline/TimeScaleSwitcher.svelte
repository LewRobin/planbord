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
        console.log("Changing scale to:", scaleLabels[newScale]);

        // Stap 1: Stel de nieuwe schaal in
        setSelectedScale(newScale);
        currentScale.set(newScale);

        // Stap 2: Trigger een custom event voor schaalwijziging
        window.dispatchEvent(new CustomEvent('timeScaleChanged', {
            detail: {scale: newScale},
            bubbles: true,
        }));

        // Stap 3: Voer een forcedRender uit met vertraging
        setTimeout(() => {
            // Tijdlijncontainer resetten
            const timelineContainer = document.querySelector('.timeline-container');
            if (timelineContainer) {
                timelineContainer.scrollLeft = 0;
                // Handmatig een scroll event triggeren
                timelineContainer.dispatchEvent(new Event('scroll', {bubbles: true}));
            }

            // Rijen resetten
            const rowsContainer = document.querySelector('.rows');
            if (rowsContainer) {
                rowsContainer.scrollLeft = 0;
                // Handmatig een scroll event triggeren
                rowsContainer.dispatchEvent(new Event('scroll', {bubbles: true}));
            }

            // Trigger global resize event voor layout herberekening
            window.dispatchEvent(new Event('resize'));

            // Forceer een volledige update door een custom event
            window.dispatchEvent(new CustomEvent('forceTimelineUpdate', {
                detail: {scale: newScale, timestamp: Date.now()}
            }));
        }, 100);
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