import { writable, derived } from 'svelte/store';
import { appointments } from '../components/appointment/AppointmentData';

export type AssetGroup = {
    id: string;
    name: string;
    assets: string[];
    expanded: boolean;
};

export const assetGroups = writable<AssetGroup[]>([]);

export const collapsedGroups = writable<Record<string, boolean>>({});

export function defineAssetGroups() {
    const boatPattern = /boot\s*(\d+)/i;
    const sloepPattern = /sloep(?:je)?\s*(\d+)/i;

    const unsubscribe = appointments.subscribe(apps => {
        if (!apps || !Array.isArray(apps)) return;

        const uniqueAssets = Array.from(new Set(
            apps.filter(app => app && app.asset)
                .map(app => app.asset)
        ));

        uniqueAssets.sort((a, b) => a.localeCompare(b));

        const groups: Record<string, string[]> = {
            'grote-boten': [],
            'sloepjes': [],
            'overig': []
        };

        uniqueAssets.forEach(asset => {
            if (boatPattern.test(asset)) {
                groups['grote-boten'].push(asset);
            } else if (sloepPattern.test(asset)) {
                groups['sloepjes'].push(asset);
            } else {
                groups['overig'].push(asset);
            }
        });

        const newGroups: AssetGroup[] = [
            {
                id: 'grote-boten',
                name: 'Grote Boten',
                assets: groups['grote-boten'],
                expanded: true
            },
            {
                id: 'sloepjes',
                name: 'Sloepjes',
                assets: groups['sloepjes'],
                expanded: true
            }
        ];

        if (groups['overig'].length > 0) {
            newGroups.push({
                id: 'overig',
                name: 'Overige',
                assets: groups['overig'],
                expanded: true
            });
        }

        assetGroups.set(newGroups);
    });

    return unsubscribe;
}

export function toggleGroupExpansion(groupId: string) {
    collapsedGroups.update(groups => {
        const newGroups = {...groups};
        newGroups[groupId] = !newGroups[groupId];
        return newGroups;
    });
}

export function findAvailableAssetInGroup(
    group: AssetGroup,
    startTime: number,
    endTime: number,
    allAppointments: any[]
): string | null {
    if (!group || !Array.isArray(group.assets) || !Array.isArray(allAppointments)) {
        return null;
    }

    for (const asset of group.assets) {
        const hasOverlap = allAppointments.some(app =>
            app.asset === asset &&
            app.startTime < endTime &&
            app.endTime > startTime
        );

        if (!hasOverlap) {
            return asset;
        }
    }

    return null;
}

export function isGroupAvailableAt(
    group: AssetGroup,
    timestamp: number,
    allAppointments: any[]
): boolean {
    if (!group || !Array.isArray(group.assets) || !Array.isArray(allAppointments)) {
        return false;
    }

    return group.assets.some(asset => {
        const overlappingAppointments = allAppointments.filter(app =>
            app.asset === asset &&
            app.startTime <= timestamp &&
            app.endTime > timestamp
        );

        return overlappingAppointments.length === 0;
    });
}

export function getGroupAvailabilityByHour(
    group: AssetGroup,
    date: Date,
    allAppointments: any[]
): Record<number, number> {
    const result: Record<number, number> = {};

    if (!group || !Array.isArray(group.assets) || !Array.isArray(allAppointments)) {
        return result;
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const startTimestamp = Math.floor(startOfDay.getTime() / 1000);

    for (let hour = 0; hour < 24; hour++) {
        const hourTimestamp = startTimestamp + (hour * 3600);
        let availableCount = 0;

        for (const asset of group.assets) {
            const hasAppointment = allAppointments.some(app =>
                app.asset === asset &&
                app.startTime <= hourTimestamp &&
                app.endTime > hourTimestamp
            );

            if (!hasAppointment) {
                availableCount++;
            }
        }

        result[hour] = availableCount;
    }

    return result;
}