<script>
    import {Navbar, NavBrand, NavLi, NavUl, NavHamburger, DarkMode, Dropdown, DropdownItem} from 'flowbite-svelte';
    import TimeScaleSwitcher from "../timeline/TimeScaleSwitcher.svelte";
    import AppointmentButton from "../appointment/AppointmentButton.svelte";
    import { Search, Button } from 'flowbite-svelte';
    import TodayButton from "../timeline/TodayButton.svelte";


</script>

<Navbar>
    <NavBrand href="/">
        <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Planbord</span>
    </NavBrand>
    <NavHamburger  />
    <NavUl >
        <NavLi>
            <TodayButton/>
        </NavLi>
        <NavLi>
            <form class="flex gap-2">
                <Search size="md" />
                <Button class="p-2.5!">X</Button>
            </form>
        </NavLi>
        <NavLi>
            <AppointmentButton/>
        </NavLi>
        <NavLi>
            <Button>Dropdown button</Button>
            <Dropdown>
                <DropdownItem>Dashboard</DropdownItem>
                <DropdownItem>Settings</DropdownItem>
                <DropdownItem>Earnings</DropdownItem>
                <DropdownItem>Sign out</DropdownItem>
            </Dropdown>
        </NavLi>
        <NavLi>
            <TimeScaleSwitcher/>
        </NavLi>
        <NavLi>
            <DarkMode/>
        </NavLi>
    </NavUl>
</Navbar>