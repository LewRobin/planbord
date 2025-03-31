import {spawn} from 'child_process';
import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import css from 'rollup-plugin-css-only';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';

const production = !process.env.ROLLUP_WATCH;

function serve() {
    let server;

    function toExit() {
        if (server) server.kill(0);
    }

    return {
        writeBundle() {
            if (server) return;
            server = spawn('npm', ['run', 'start', '--', '--dev'], {
                stdio: ['ignore', 'inherit', 'inherit'],
                shell: true
            });

            process.on('SIGTERM', toExit);
            process.on('exit', toExit);
        }
    };
}

export default {
    input: 'src/main.ts',
    output: {
        sourcemap: true,
        format: 'iife',
        name: 'app',
        file: 'public/build/bundle.js',
        globals: {
            '@sveltejs/svelte-virtual-list': 'VirtualList'
        }
    },
    plugins: [
        svelte({
            preprocess: sveltePreprocess({
                sourceMap: !production,
                typescript: {
                    tsconfigFile: './tsconfig.json'
                }
            }),
            compilerOptions: {
                dev: !production
            }
        }),
        css({output: 'bundle.css'}),

        resolve({
            browser: true,
            dedupe: ['svelte'],
            exportConditions: ['svelte'],
            extensions: ['.mjs', '.js', '.ts', '.json', '.svelte']
        }),
        commonjs(),
        typescript({
            sourceMap: !production,
            inlineSources: !production,
            tsconfig: './tsconfig.json',
            compilerOptions: {
                target: "es2018",
                module: "esnext",
                moduleResolution: "node",
                importsNotUsedAsValues: "remove",
                isolatedModules: true,
                esModuleInterop: true
            }
        }),

        !production && serve(),
        !production && livereload('public'),
        production && terser()
    ],
    external: [
        '@sveltejs/svelte-virtual-list'
    ],
    watch: {
        clearScreen: false
    }
};