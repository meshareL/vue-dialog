import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import PATH from 'node:path';
import { fileURLToPath } from 'node:url';
import sass from 'sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import _cssnano from 'cssnano';

const __dirname = PATH.dirname(fileURLToPath(import.meta.url))
    , outDir = PATH.resolve(__dirname, '../dist')
    , cssnano = _cssnano({
    preset: [
        'default', {
            discardComments: { removeAll: true },
            normalizeUnicode: false
        }
    ]
});

new Promise(resolve => {
    if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true });
    }

    const result = sass.compile(
        PATH.resolve(__dirname, '../src/index.scss'),
        { sourceMap: false, verbose: true, style: 'expanded' }
    );
    resolve(result);
})
    .then(compiled => {
        const normal = {
            from: PATH.resolve(outDir, 'index.css'),
            to: PATH.resolve(outDir, 'index.css'),
            map: false
        }
            , condensate = Object.assign({}, normal, {
            to: PATH.resolve(outDir, 'index.min.css'),
            map: {
                inline: false,
                sourcesContent: true,
                annotation: true,
                absolute: false,
                prev: false
            }
        });

        return Promise.all([
            postcss([ autoprefixer ]).process(compiled.css, normal),
            postcss([ autoprefixer, cssnano ]).process(compiled.css, condensate)
        ]);
    })
    .then(results => {
        for (const result of results) {
            writeFileSync(result.opts.to, result.css, 'utf8');

            if (result.map) {
                writeFileSync(`${result.opts.to}.map`, result.map.toString(), 'utf8');
            }
        }
    });
