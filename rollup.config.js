import { defineConfig } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

export default defineConfig({
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/index.esm.js',
            format: 'module',
            sourcemap: true
        },
        {
            file: 'dist/index.esm.min.js',
            format: 'module',
            sourcemap: true,
            plugins: [ terser() ]
        },
        {
            file: 'dist/index.umd.js',
            format: 'umd',
            name: 'VueDialog',
            exports: 'named',
            globals: { vue: 'Vue' },
            sourcemap: true
        },
        {
            file: 'dist/index.umd.min.js',
            format: 'umd',
            name: 'VueDialog',
            exports: 'named',
            globals: { vue: 'Vue' },
            sourcemap: true,
            plugins: [ terser() ]
        }
    ],
    external: [ 'vue' ],
    plugins: [
        nodeResolve(),
        commonjs(),
        typescript({ include: 'src/**/*.ts', noForceEmit: true }),
        babel({
            exclude: 'node_modules/**',
            babelHelpers: 'runtime',
            extensions: [ '.js', '.ts', '.cjs', '.mjs' ]
        })
    ]
});
