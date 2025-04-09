<script>
    import {Button} from "flowbite-svelte";

    export let timelineContainer;

    function goToToday() {
        if (!timelineContainer) return;

        timelineContainer.scrollLeft = 0;

        const rowsContainer = document.querySelector('.rows');
        if (rowsContainer) {
            rowsContainer.scrollLeft = 0;
        }

        window.dispatchEvent(new CustomEvent('goToToday'));
    }
</script>

<div class="today-button-container">
    <Button on:click={goToToday} type="primary">
        Vandaag
    </Button>
</div>