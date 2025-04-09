<script>
    import {Navbar, NavBrand, NavLi, NavUl, NavHamburger, DarkMode, Dropdown} from 'flowbite-svelte';
    import TimeScaleSwitcher from "../timeline/TimeScaleSwitcher.svelte";
    import AppointmentButton from "../appointment/AppointmentButton.svelte";
    import { Search, Button } from 'flowbite-svelte';


</script>

<Navbar>
    <NavBrand href="/">
        <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Planbord</span>
    </NavBrand>
    <NavHamburger  />
    <NavUl >
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
            <TimeScaleSwitcher/>
        </NavLi>
        <NavLi>
            <DarkMode/>
        </NavLi>
    </NavUl>
</Navbar>