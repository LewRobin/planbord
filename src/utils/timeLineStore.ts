import { writable } from 'svelte/store';

export const timelineContainer = writable<HTMLElement | null>(null);

export function scrollToToday() {
    timelineContainer.update(container => {
        if (container) {
            container.scrollLeft = 0;
        }
        return container;
    });
}