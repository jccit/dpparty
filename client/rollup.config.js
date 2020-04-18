import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/index.ts',
    output: {
        file: 'extension.js',
        format: 'iife'
    },
    plugins: [typescript()]
}