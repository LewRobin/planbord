<script>
    import {Navbar, NavBrand, NavLi, NavUl, NavHamburger, DarkMode, Dropdown} from 'flowbite-svelte';
    import TimeScaleSwitcher from "../timeline/TimeScaleSwitcher.svelte";


</script>

<Navbar>
    <NavBrand href="/">
        <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Planbord</span>
    </NavBrand>
    <NavHamburger  />
    <NavUl >
        <NavLi>

        </NavLi>
        <NavLi>
            <TimeScaleSwitcher/>
        </NavLi>
        <NavLi>
            <DarkMode/>
        </NavLi>
    </NavUl>
</Navbar>