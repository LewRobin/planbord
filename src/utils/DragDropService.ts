export interface DragState {
    isDragging: boolean;
    startX: number;
    startLeft: number;
}

export interface ResizeState {
    isResizing: boolean;
    startX: number;
    startWidth: number;
}

export class DragDropService {
    // Drag functies
    public startDrag(element: HTMLElement, event: MouseEvent | Touch, startLeft: number): DragState {
        element.style.opacity = '0.7';
        element.style.zIndex = '10';
        element.style.cursor = 'grabbing';

        return {
            isDragging: true,
            startX: event instanceof MouseEvent ? event.clientX : event.clientX,
            startLeft
        };
    }

    public onDrag(
        element: HTMLElement,
        event: MouseEvent | Touch,
        state: DragState,
        gridWidth: number,
        width: number,
        cellWidthPx: number
    ): number {
        if (!state.isDragging) return -1;

        const currentX = event instanceof MouseEvent ? event.clientX : event.clientX;
        const diffX = currentX - state.startX;
        let newLeft = state.startLeft + diffX;

        // Begrens en snap naar grid
        newLeft = Math.max(0, Math.min(newLeft, gridWidth - width));
        newLeft = Math.round(newLeft / cellWidthPx) * cellWidthPx;

        element.style.left = `${newLeft}px`;
        return newLeft;
    }

    public stopDrag(element: HTMLElement): void {
        element.style.opacity = '1';
        element.style.zIndex = '1';
        element.style.cursor = 'grab';
    }

    // Resize functies
    public startResize(element: HTMLElement, event: MouseEvent | Touch, startWidth: number): ResizeState {
        element.style.opacity = '0.8';
        element.style.zIndex = '10';

        return {
            isResizing: true,
            startX: event instanceof MouseEvent ? event.clientX : event.clientX,
            startWidth
        };
    }

    public onResize(
        element: HTMLElement,
        event: MouseEvent | Touch,
        state: ResizeState,
        gridWidth: number,
        left: number,
        cellWidthPx: number
    ): number {
        if (!state.isResizing) return -1;

        const currentX = event instanceof MouseEvent ? event.clientX : event.clientX;
        const diffX = currentX - state.startX;
        let newWidth = state.startWidth + diffX;

        // TODO begrens en snap naar grid werkt nog niet helemaal
        newWidth = Math.max(cellWidthPx, newWidth);
        newWidth = Math.min(newWidth, gridWidth - left);
        newWidth = Math.round(newWidth / cellWidthPx) * cellWidthPx;

        element.style.width = `${newWidth}px`;
        return newWidth;
    }

    public stopResize(element: HTMLElement): void {
        element.style.opacity = '1';
        element.style.zIndex = '1';
    }
}