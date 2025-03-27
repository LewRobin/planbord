<script>
    import {onMount} from 'svelte';
    import {writable} from 'svelte/store';
    import Row from './Row.svelte';
    import Timeline from '../timeline/Timeline.svelte';
    import LoadingIndicator from './LoadingIndicator.svelte';
    import {getSelectedScale, timeScales, cellWidthPx} from '../../utils/calculations.js';
    import {appointments, loadAppointments} from '../appointment/AppointmentData';
    import AppointmentButton from "../appointment/AppointmentButton.svelte";

    export let amountOfDays;

    $: uniqueAssets = Array.from(new Set($appointments.map(app => app.asset).filter(Boolean)));

    const totalDaysLoaded = writable(amountOfDays);
    let rowsContainer;
    let isLoading = false;
    let loadingMessage = "";
    let initialLoadDone = false;

    // Calculate required initial days, can be increased if needed
    function calculateInitialDays() {
        if (!rowsContainer) return 30;

        const containerWidth = rowsContainer.clientWidth;
        const selectedScale = getSelectedScale();
        const cellsPerDay = selectedScale === timeScales.hour ? 24 : 1;

        return Math.ceil(containerWidth / (cellWidthPx * cellsPerDay)) + (selectedScale === timeScales.hour ? 5 : 10);
    }

    // Fill timeline initially
    function initialFill() {
        if (initialLoadDone) return;

        isLoading = true;
        loadingMessage = "Planbord vullen...";

        const requiredDays = calculateInitialDays();

        setTimeout(() => {
            totalDaysLoaded.update(n => Math.max(n, requiredDays));

            setTimeout(() => {
                isLoading = false;
                loadingMessage = "";
                initialLoadDone = true;
            }, 800);
        }, 300);
    }

    function handleRowsScroll() {
        if (!rowsContainer) return;

        const scrollLeft = rowsContainer.scrollLeft;
        const scrollWidth = rowsContainer.scrollWidth;
        const clientWidth = rowsContainer.clientWidth;

        // Sync timeline scroll which does lag when traveling weeks very fast
        const timelineContainer = document.querySelector('.timeline-container');
        if (timelineContainer) {
            timelineContainer.scrollLeft = scrollLeft;
        }

        // Load more data when near edge
        if (scrollLeft + clientWidth >= scrollWidth * 0.7 && !isLoading && initialLoadDone) {
            isLoading = true;
            loadingMessage = "Meer dagen laden...";

            setTimeout(() => {
                totalDaysLoaded.update(n => n + 7);

                setTimeout(() => {
                    isLoading = false;
                    loadingMessage = "";
                }, 1500);
            }, 800);
        }
    }

    onMount(async () => {
        await loadAppointments();

        if (rowsContainer) {
            const resizeObserver = new ResizeObserver(() => {
                handleRowsScroll();
                if (!initialLoadDone) {
                    initialFill();
                }
            });

            resizeObserver.observe(rowsContainer);

            setTimeout(() => {
                initialFill();
            }, 100);

            return () => {
                resizeObserver.disconnect();
            };
        }
    });
</script>

<div>
    <div class="main-container">
        <div class="asset-container">
            {#each uniqueAssets as asset}
                <div class="asset">{asset}</div>
            {/each}
            <AppointmentButton/>
        </div>
        <div class="grid-container">
            <Timeline {amountOfDays} appointments={$appointments} {totalDaysLoaded}/>
            <div bind:this={rowsContainer} class="rows" on:scroll={handleRowsScroll}>
                {#each uniqueAssets as asset}
                    <Row
                            appointments={$appointments.filter(app => app.asset === asset)}
                            totalDaysLoaded={$totalDaysLoaded}
                    />
                {/each}
            </div>
        </div>
    </div>

    {#if isLoading}
        <LoadingIndicator message={loadingMessage} position="bottom"/>
    {/if}
</div>

<style>
    .main-container {
        display: flex;
        height: 100vh;
        overflow-y: auto;
    }
    .asset-container {
        padding: 60px;
        position: sticky;
        left: 0;
        background: #fff;
        z-index: 10;
        display: flex;
        flex-direction: column;
    }
    .asset {
        height: 50px;
        width: max-content;
    }
    .grid-container {
        display: flex;
        flex-direction: column;
        white-space: nowrap;
        border: 1px solid red;
        flex-grow: 1;
        width: 100%;
        overflow: hidden;
    }
    .rows {
        display: flex;
        flex-direction: column;
        overflow-x: auto;
        width: 100%;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .rows::-webkit-scrollbar {
        display: none;
    }
</style>