<script>
    export let type = 'primary';
    export let active = false;
    export let icon = null;
</script>

<button class="button {type} {active ? 'active' : ''}" on:click>
    {#if icon}
        <span class="icon">{icon}</span>
    {/if}
    <span class="text">
    <slot></slot>
  </span>
</button>

<style>
    .button {
        padding: 8px 12px;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
    }

    .button:hover {
        transform: translateY(-1px);
    }

    .button:active {
        transform: translateY(1px);
    }

    .primary {
        background-color: #4a90e2;
        color: white;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .primary:hover {
        background-color: #3a7bc8;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
    }

    .primary:active {
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .secondary {
        background-color: #f0f0f0;
        color: #333;
        border: 1px solid #ccc;
    }

    .secondary:hover {
        background-color: #e0e0e0;
    }

    .secondary.active {
        background-color: #4a90e2;
        color: white;
        border-color: #3a7bc8;
    }

    .icon {
        font-size: 16px;
    }

    .text {
        font-size: 14px;
    }
</style>