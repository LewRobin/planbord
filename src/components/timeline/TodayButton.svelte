<script lang="ts">
    import { timelineContainer } from '../../utils/timeLineStore';
    import { Button } from 'flowbite-svelte';

    function goToToday() {
        if ($timelineContainer) {
            $timelineContainer.scrollLeft = 0;

            const event = new CustomEvent('goToToday', { detail: { date: new Date() } });
            window.dispatchEvent(event);
        }
    }
</script>

<Button on:click={goToToday} class="text-white font-medium py-2 px-4 rounded">
    Vandaag
</Button>