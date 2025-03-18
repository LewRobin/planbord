<script lang="ts">
    export let time: number;
    export let isAppointment: boolean;
    export let color: string;

    //should export this from the interface
    const width = 100;
    const height = 100;

    const formatDate = (epoch, options) => new Date(epoch * 1000).toLocaleString(undefined, options);
</script>

<div class="cell"
     style="min-width: {width}px; min-height: {height}; background-color: {isAppointment ? color : 'transparent'}">
</div>

<style>
    .cell {
        border: 1px solid #cacaca;
        padding: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>