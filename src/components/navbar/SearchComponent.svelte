<script lang="ts">
    import { Search, Button } from 'flowbite-svelte';
    import { createEventDispatcher, onMount } from 'svelte';
    import { activeFilter } from '../../utils/filterStore';

    const dispatch = createEventDispatcher();

    let searchTerm = '';
    let searchInputElement;

    $: isFiltering = $activeFilter !== null && $activeFilter !== '';

    function updateFilter() {
        if (searchTerm && searchTerm.trim()) {
            activeFilter.set(searchTerm.trim());
            dispatch('filter', { term: searchTerm.trim() });
        } else {
            activeFilter.set(null);
            dispatch('clearFilter');
        }
    }

    function handleInput() {
        updateFilter();
    }

    function clearSearch() {
        searchTerm = '';
        activeFilter.set(null);
        dispatch('clearFilter');

        if (searchInputElement) {
            setTimeout(() => {
                searchInputElement.focus();
            }, 0);
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            clearSearch();
        }
    }

    onMount(() => {
        if ($activeFilter) {
            searchTerm = $activeFilter;
        }

        if (searchInputElement) {
            searchInputElement.addEventListener('input', handleInput);

            return () => {
                searchInputElement.removeEventListener('input', handleInput);
            };
        }
    });
</script>

<form class="flex gap-2">
    <Search
            size="md"
            bind:value={searchTerm}
            bind:element={searchInputElement}
            on:keydown={handleKeyDown}
            on:input={handleInput}
            placeholder="Zoek op naam..."
    />
    {#if isFiltering}
        <Button color="red" class="p-2.5!" on:click={clearSearch}>
            ✕
        </Button>
    {/if}
</form>

<style>
    form {
        position: relative;
    }
</style>