<script>
    import {Navbar, NavBrand, NavLi, NavUl, NavHamburger, DarkMode, Dropdown, DropdownItem, Button} from 'flowbite-svelte';
    import AppointmentButton from "../appointment/AppointmentButton.svelte";
    import TodayButton from "../timeline/TodayButton.svelte";
    import SearchComponent from "./SearchComponent.svelte";
    import {onMount} from 'svelte';
    import {timeScales, getSelectedScale, setSelectedScale} from '../../utils/calculations.js';
    import {writable} from 'svelte/store';
    import {activeFilter} from '../../utils/filterStore';

    let dropdownOpen = false;

    const currentScale = writable(getSelectedScale());

    const scaleLabels = {
        [timeScales.halfHour]: '30 min',
        [timeScales.hour]: 'Uur',
        [timeScales.day]: 'Dag'
    };

    const availableScales = [
        {value: timeScales.halfHour, label: scaleLabels[timeScales.halfHour]},
        {value: timeScales.hour, label: scaleLabels[timeScales.hour]},
        {value: timeScales.day, label: scaleLabels[timeScales.day]}
    ];

    function changeScale(newScale) {
        setSelectedScale(newScale);
        currentScale.set(newScale);

        const timelineContainer = document.querySelector('.timeline-container');
        const rowsContainer = document.querySelector('.rows');

        if (timelineContainer) timelineContainer.scrollLeft = 0;
        if (rowsContainer) rowsContainer.scrollLeft = 0;

        window.dispatchEvent(new CustomEvent('timeScaleChanged', {
            detail: {scale: newScale},
            bubbles: true,
        }));

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));

            window.dispatchEvent(new CustomEvent('forceTimelineUpdate', {
                detail: {scale: newScale, timestamp: Date.now()}
            }));

            if (timelineContainer) {
                timelineContainer.dispatchEvent(new Event('scroll', {bubbles: true}));
            }
            if (rowsContainer) {
                rowsContainer.dispatchEvent(new Event('scroll', {bubbles: true}));
            }
        }, 50);
    }

    function handleFilter(event) {
        activeFilter.set(event.detail.term);
    }

    function handleClearFilter() {
        activeFilter.set(null);
    }

    onMount(() => {
        currentScale.set(getSelectedScale());

        const checkScale = setInterval(() => {
            const scale = getSelectedScale();
            if ($currentScale !== scale) {
                currentScale.set(scale);
            }
        }, 1000);

        return () => clearInterval(checkScale);
    });
</script>

<Navbar>
    <NavBrand href="/">
        <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Planbord</span>
    </NavBrand>
    <NavHamburger />
    <NavUl>
        <NavLi>
            <SearchComponent
                    on:filter={handleFilter}
                    on:clearFilter={handleClearFilter}
            />
        </NavLi>
        <NavLi>
            <TodayButton/>
        </NavLi>
        <NavLi>
            <AppointmentButton/>
        </NavLi>
        <NavLi>
            <Button>{scaleLabels[$currentScale] || 'Weergave'}</Button>
            <Dropdown bind:open={dropdownOpen}>
                {#each availableScales as scale}
                    <DropdownItem
                            on:click={() => {
                            changeScale(scale.value);
                            dropdownOpen = false;
                        }}
                            active={$currentScale === scale.value}
                    >
                        {scale.label}
                    </DropdownItem>
                {/each}
                <DropdownItem divider={true}/>
                <DropdownItem on:click={() => dropdownOpen = false}>Instellingen</DropdownItem>
            </Dropdown>
        </NavLi>
        <NavLi>
            <DarkMode/>
        </NavLi>
    </NavUl>
</Navbar>