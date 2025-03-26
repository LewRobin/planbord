<script>
    import {fade} from 'svelte/transition';

    export let message;
    export let position = 'top';
</script>

<div class="loading-indicator {position}" transition:fade={{ duration: 300 }}>
    {message}
</div>

<style>
    .loading-indicator {
        position: fixed;
        right: 20px;
        background-color: rgba(25, 118, 210, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 100;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        font-weight: bold;
        animation: bounce 1s infinite alternate;
    }

    .top {
        top: 10px;
    }

    .bottom {
        bottom: 20px;
    }

    @keyframes bounce {
        from {
            transform: translateY(0);
        }
        to {
            transform: translateY(-5px);
        }
    }
</style>