<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { AssetGroup } from '../../utils/assetGroupStore';
    import { toggleGroupExpansion } from '../../utils/assetGroupStore';
    import Row from './Row.svelte';
    import type { Appointment } from '../appointment/AppointmentData';
    import { cellWidthPx } from '@/utils/calculations';
    import { fly } from 'svelte/transition';

    export let group: AssetGroup;
    export let appointments: Appointment[] = [];
    export let totalDaysLoaded: number;
    export let isCollapsed: boolean = false;

    const dispatch = createEventDispatcher();

    function handleToggle() {
        toggleGroupExpansion(group.id);
        dispatch('toggle', { groupId: group.id, isCollapsed: !isCollapsed });
    }

    function generateAvailabilityData() {
        const availabilityId = `availability-${group.id}-${Date.now()}`;

        const baseAvailability = {
            _id: availabilityId,
            title: 'Beschikbaar',
            description: `Er zijn boten beschikbaar in groep ${group.name}`,
            isAvailabilityIndicator: true
        };

        const availabilityMap = new Map();
        const availabilitySlots = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayStartTimestamp = Math.floor(today.getTime() / 1000);

        for (let day = 0; day < totalDaysLoaded; day++) {
            const dayTimestamp = dayStartTimestamp + (day * 86400);

            for (let hour = 0; hour < 24; hour++) {
                const hourStart = dayTimestamp + (hour * 3600);
                const hourEnd = hourStart + 3600;
                const timeKey = `${day}-${hour}`;

                const anyAssetAvailable = group.assets.some(asset => {
                    return !appointments.some(app =>
                        app.asset === asset &&
                        app.startTime < hourEnd &&
                        app.endTime > hourStart
                    );
                });

                availabilityMap.set(timeKey, anyAssetAvailable);
            }
        }

        for (let day = 0; day < totalDaysLoaded; day++) {
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
                        ...baseAvailability,
                        _id: slotId,
                        asset: group.id,
                        startTime: startTimestamp,
                        endTime: endTimestamp
                    });

                    startHour = -1;
                }
            }
        }

        return availabilitySlots;
    }

    $: groupAppointments = appointments.filter(app =>
        group.assets.includes(app.asset)
    );

    let availabilityData = [];

    $: {
        if (isCollapsed) {
            availabilityData = generateAvailabilityData();
        }
    }

    function getAssetCount() {
        return group.assets.length;
    }

    function calculateFreeSlotsPerHour() {
        const result = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayStartTimestamp = Math.floor(today.getTime() / 1000);

        for (let hour = 0; hour < 24; hour++) {
            const hourStart = dayStartTimestamp + (hour * 3600);
            const hourEnd = hourStart + 3600;

            let freeCount = 0;

            for (const asset of group.assets) {
                const isBusy = appointments.some(app =>
                    app.asset === asset &&
                    app.startTime < hourEnd &&
                    app.endTime > hourStart
                );

                if (!isBusy) {
                    freeCount++;
                }
            }

            result[hour] = freeCount;
        }

        return result;
    }

    const freeSlotsInfo = calculateFreeSlotsPerHour();
</script>

<div class="asset-group">
    <div
            class="group-header bg-gray-200 dark:bg-gray-700 p-2 flex justify-between cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            on:click={handleToggle}
    >
        <div class="flex items-center gap-2">
            <span class={`transform transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>➤</span>
            <span class="font-bold">{group.name}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">({getAssetCount()} items)</span>
        </div>

        <div>
            <button class="text-sm text-blue-500 hover:underline">
                {isCollapsed ? 'Uitklappen' : 'Inklappen'}
            </button>
        </div>
    </div>

    {#if !isCollapsed}
        <div>
            {#each group.assets as asset (asset)}
                <div class="asset-row" in:fly={{ y: 20, duration: 300 }}>
                    <Row
                            appointments={groupAppointments.filter(app => app.asset === asset)}
                            {totalDaysLoaded}
                            assetName={asset}
                    />
                </div>
            {/each}
        </div>
    {:else}
        <div class="availability-section" in:fly={{ y: -20, duration: 300 }}>
            <div class="availability-row">
                <Row
                        appointments={availabilityData}
                        {totalDaysLoaded}
                        assetName={`${group.id}-availability`}
                        isAvailabilityRow={true}
                />
            </div>

            <div class="availability-summary h-[40px] bg-gray-100 dark:bg-gray-800 flex items-center pl-4 border-t border-gray-200 dark:border-gray-700 text-sm">
                <span class="text-gray-700 dark:text-gray-300">
                    Beschikbaarheid: {Object.values(freeSlotsInfo).filter(count => count > 0).length > 0 ?
                    `${Math.max(...Object.values(freeSlotsInfo))}/${group.assets.length} beschikbaar vandaag` :
                    'Vandaag geen beschikbaarheid'}
                </span>
            </div>
        </div>
    {/if}
</div>

<style>
    .asset-group {
        border-bottom: 1px solid #eaeaea;
    }

    :global(.asset-row) {
        border-bottom: 1px solid #f3f3f3;
    }

    .availability-section {
        background-color: rgba(0, 128, 0, 0.05);
    }
</style>