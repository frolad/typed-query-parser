import pluginTypescript from '@rollup/plugin-typescript';
import pluginEsBuild from 'rollup-plugin-esbuild';
import pluginResolve from '@rollup/plugin-node-resolve';
import pluginBabel from '@rollup/plugin-babel';
import pluginDTS from 'rollup-plugin-dts';
import pluginEsLint from '@rollup/plugin-eslint';

function external(id) {
  return !id.startsWith('.') && !id.includes('typed-query-parser');
}

export default function () {
  return [
    {
      input: 'src/index.ts',
      output: {dir: 'dist/dts'},
      external,
      plugins: [
        pluginTypescript({
          declaration: true,
          emitDeclarationOnly: true,
          outDir: 'dist/dts',
        }),
        pluginEsLint({
          throwOnError: true,
          throwOnWarning: true,
        }),
      ],
    },
    {
      input: 'src/index.ts',
      output: [{file: `dist/index.mjs`, format: 'esm'}],
      plugins: [
        pluginEsBuild({
          target: 'node12',
          tsconfig: './tsconfig.json',
        }),
      ],
      external,
    },
    {
      input: 'src/index.ts',
      output: {file: `dist/index.js`, format: 'cjs', exports: 'named'},
      plugins: [
        pluginResolve({extensions: ['.ts']}),
        pluginBabel({
          babelrc: false,
          ignore: ['./node_modules'],
          presets: [
            [
              '@babel/preset-env',
              {
                loose: true,
                modules: false,
                targets: {ie: 11},
              },
            ],
          ],
          plugins: [['@babel/plugin-transform-typescript']],
          extensions: ['.ts'],
          comments: false,
          babelHelpers: 'bundled',
        }),
      ],
      external,
    },
    {
      input: './dist/dts/index.d.ts',
      output: [{file: 'dist/index.d.ts', format: 'es'}],
      plugins: [pluginDTS()],
    },
  ];
}
