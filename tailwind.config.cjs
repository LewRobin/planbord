/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{html,js,svelte,ts}",
        "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}"
    ],
    plugins: [
        require('flowbite/plugin')
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Optional: customize Flowbite's primary colors
                primary: {
                    50: '#fff5f2',
                    100: '#fff1ee',
                    200: '#ffe4de',
                    300: '#ffd5cc',
                    400: '#ffbcad',
                    500: '#fe795d',
                    600: '#ef562f',
                    700: '#eb4f27',
                    800: '#cc4522',
                    900: '#a5371b'
                },
                appointments: {
                    500: 'rgba(59,162,246)',
                    600: 'rgba(59,131,246)',
                    700: 'rgb(24,95,175)',

                }
            }
        }
    }
}