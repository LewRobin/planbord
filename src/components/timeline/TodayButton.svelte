<script>
    import Button from "../Button.svelte";

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

<!--TODO fix reloading timeline after clicking this button -->
<div class="today-button-container">
    <Button icon="📅" on:click={goToToday} type="primary">
        Vandaag
    </Button>
</div>

<style>
    .today-button-container {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 100;
    }
</style>