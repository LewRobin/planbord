<script>
    import {onMount, onDestroy} from 'svelte';
    import {writable} from 'svelte/store';
    import Timeline from '../timeline/Timeline.svelte';
    import LoadingIndicator from './LoadingIndicator.svelte';
    import {getSelectedScale, timeScales, cellWidthPx} from '@/utils/calculations.js';
    import {appointments, loadAppointments} from '../appointment/AppointmentData';
    import {activeFilter} from '../../utils/filterStore';
    import Row from './Row.svelte';
    import {assetGroups, defineAssetGroups, collapsedGroups, getGroupAvailabilityByHour} from '../../utils/assetGroupStore';

    export let amountOfDays;

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
        }
    }

    const totalDaysLoaded = writable(amountOfDays);
    let rowsContainer;
    let isLoading = false;
    let loadingMessage = "";
    let initialLoadDone = false;
    let unsubscribeAssetGroups;

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

            unsubscribeAssetGroups = defineAssetGroups();

            collapsedGroups.set({});
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

    onDestroy(() => {
        if (unsubscribeAssetGroups) {
            unsubscribeAssetGroups();
        }
    });

    function toggleGroup(groupId) {
        collapsedGroups.update(state => {
            return { ...state, [groupId]: !state[groupId] };
        });
    }

    function generateGroupAvailabilityData(group) {
        if (!group) return [];

        const availabilityId = `availability-${group.id}-${Date.now()}`;
        const availabilitySlots = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayStartTimestamp = Math.floor(today.getTime() / 1000);

        const availabilityMap = new Map();

        for (let day = 0; day < $totalDaysLoaded; day++) {
            const dayTimestamp = dayStartTimestamp + (day * 86400);

            for (let hour = 0; hour < 24; hour++) {
                const hourStart = dayTimestamp + (hour * 3600);
                const hourEnd = hourStart + 3600;
                const timeKey = `${day}-${hour}`;

                const anyAssetAvailable = group.assets.some(asset => {
                    return !filteredAppointments.some(app =>
                        app.asset === asset &&
                        app.startTime < hourEnd &&
                        app.endTime > hourStart
                    );
                });

                availabilityMap.set(timeKey, anyAssetAvailable);
            }
        }

        for (let day = 0; day < $totalDaysLoaded; day++) {
            let startHour = -1;

            for (let hour = 0; hour < 24; hour++) {
                const isAvailable = availabilityMap.get(`${day}-${hour}`);

                if (isAvailable && startHour === -1) {
                    startHour = hour;
                } else if ((!isAvailable || hour === 23) && startHour !== -1) {
                    const endHour = isAvailable && hour === 23 ? 24 : hour;

                    const startTimestamp = dayStartTimestamp + (day * 86400) + (startHour * 3600);
                    const endTimestamp = dayStartTimestamp + (day * 86400) + (endHour * 3600);

                    const slotId = `${availabilityId}-${day}-${startHour}-${endHour}`;

                    availabilitySlots.push({
                        _id: slotId,
                        asset: group.id,
                        title: 'Beschikbaar',
                        description: `${startHour}:00 - ${endHour}:00`,
                        startTime: startTimestamp,
                        endTime: endTimestamp,
                        isAvailabilityIndicator: true
                    });

                    startHour = -1;
                }
            }
        }

        return availabilitySlots;
    }
</script>

<div>
    <div class="main-container">
        <div class="asset-container bg-white dark:bg-gray-600 dark:text-white">
            {#if $assetGroups && $assetGroups.length > 0}
                {#each $assetGroups as group (group.id)}
                    <div
                            class="font-bold transition cursor-not-allowed h-[50px] flex items-center px-4 bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                            on:click={() => toggleGroup(group.id)}>
                        <span class={`transform transition-transform mr-2 ${$collapsedGroups[group.id] ? '' : 'rotate-90'}`}>➤</span>
                        <span class="font-bold">{group.name} ({group.assets.length})</span>
                    </div>

                    {#if !$collapsedGroups[group.id]}
                        {#each group.assets as asset (asset)}
                            <div class="h-[50px] w-max flex items-center pl-8">{asset}</div>
                        {/each}
                    {/if}
                {/each}
            {/if}
        </div>
        <div class="flex-col whitespace-nowrap flex-grow overflow-hidden bg-white dark:bg-gray-600 dark:text-white">
            <Timeline {totalDaysLoaded}/>
            <div bind:this={rowsContainer} class="flex-col overflow-x-auto rows"
                 on:scroll={handleRowsScroll}>
                {#if $assetGroups && $assetGroups.length > 0}
                    {#each $assetGroups as group (group.id)}
                        <div class="group-grid-header {$collapsedGroups[group.id] ? 'collapsed' : ''}">
                            <Row
                                    appointments={$collapsedGroups[group.id] ? generateGroupAvailabilityData(group) : []}
                                    {totalDaysLoaded}
                                    assetName={group.name}
                                    isAvailabilityRow={$collapsedGroups[group.id]}
                                    isGroupHeaderRow={!$collapsedGroups[group.id]}
                            />
                        </div>

                        {#if !$collapsedGroups[group.id]}
                            {#each group.assets as asset (asset)}
                                <Row
                                        appointments={filteredAppointments.filter(app => app.asset === asset)}
                                        {totalDaysLoaded}
                                        assetName={asset}
                                />
                            {/each}
                        {/if}
                    {/each}
                {/if}
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
        padding-top: 60px;
        position: sticky;
        left: 0;
        background: #fff;
        z-index: 10;
        display: flex;
        flex-direction: column;
        min-width: 180px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .rows {
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .rows::-webkit-scrollbar {
        display: none;
    }

    .group-header {
        font-weight: bold;
        border-bottom: 1px solid #ddd;
        transition: background-color 0.2s;
    }

    :global(.dark) .group-header {
        border-bottom: 1px solid #4b5563;
    }

    .group-grid-header {
        background-color: #f0f2f5;
    }

    .group-grid-header.collapsed {
        background-color: #e8f5e9;
    }

    :global(.dark) .group-grid-header {
        background-color: #374151;
    }

    :global(.dark) .group-grid-header.collapsed {
        background-color: #1e3a2f;
    }
</style>