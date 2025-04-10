<script>
    import {onMount} from 'svelte';
    import {writable} from 'svelte/store';
    import Row from './Row.svelte';
    import Timeline from '../timeline/Timeline.svelte';
    import LoadingIndicator from './LoadingIndicator.svelte';
    import {getSelectedScale, timeScales, cellWidthPx} from '@/utils/calculations.js';
    import {appointments, loadAppointments} from '../appointment/AppointmentData';
    import {activeFilter} from '../../utils/filterStore';

    export let amountOfDays;

    let uniqueAssets = [];
    let filteredAppointments = [];

    $: {
        if ($appointments && Array.isArray($appointments)) {
            if ($activeFilter) {
                filteredAppointments = $appointments.filter(app =>
                    app && app.title && app.title.toLowerCase().includes($activeFilter.toLowerCase())
                );
            } else {
                filteredAppointments = [...$appointments];
            }

            uniqueAssets = Array.from(new Set(filteredAppointments
                .filter(app => app && app.asset)
                .map(app => app.asset)));

            uniqueAssets.sort((a, b) => a.localeCompare(b));
        }
    }

    const totalDaysLoaded = writable(amountOfDays);
    let rowsContainer;
    let isLoading = false;
    let loadingMessage = "";
    let initialLoadDone = false;

    function calculateInitialDays() {
        if (!rowsContainer) return 30;

        const containerWidth = rowsContainer.clientWidth;
        const selectedScale = getSelectedScale();
        const cellsPerDay = selectedScale === timeScales.hour ? 24 : 1;

        return Math.ceil(containerWidth / (cellWidthPx * cellsPerDay)) + (selectedScale === timeScales.hour ? 5 : 10);
    }

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

        const timelineContainer = document.querySelector('.timeline-container');
        if (timelineContainer) {
            timelineContainer.scrollLeft = scrollLeft;
        }

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
        try {
            await loadAppointments();
        } catch (error) {
            console.error('Error loading appointments:', error);
        }

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
        <div class="asset-container bg-white dark:bg-gray-600 dark:text-white">
            {#each uniqueAssets as asset (asset)}
                <div class="h-[50px] w-max flex items-center">{asset}</div>
            {/each}
            {#if uniqueAssets.length === 0}
                <div class="p-4 text-center text-gray-500 dark:text-gray-300">
                    Geen resultaten gevonden
                </div>
            {/if}
        </div>
        <div class="flex-col whitespace-nowrap flex-grow overflow-hidden bg-white dark:bg-gray-600 dark:text-white">
            <Timeline {totalDaysLoaded}/>
            <div bind:this={rowsContainer} class="flex-col overflow-x-auto rows"
                 on:scroll={handleRowsScroll}>
                {#each uniqueAssets as asset (asset)}
                    <Row
                            appointments={filteredAppointments.filter(app => app && app.asset === asset)}
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
    .rows {
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .rows::-webkit-scrollbar {
        display: none;
    }
</style>