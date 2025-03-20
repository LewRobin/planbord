<script lang="ts">
    export let pixelsPerMinute: number;

    const color = "blue";

    // minus 2 pixels due to borders
    const width = 58 * pixelsPerMinute;
    const height = 50;
</script>

<div class="cell"
     style="min-width: {width}px; height: {height}px; background-color: 'transparent'}">
</div>

<style>
    .cell {
        border: 1px solid #cacaca;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
