import { resolve, dirname } from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
    entry: './src/index.js',
    experiments: {
        outputModule: true
    },
    output: {
        path: resolve(__dirname, 'dist'),
        filename: 'ravjs.js',
        module: true,
        library: {
            type: "module"
        }
    },
    target: 'node12.12',
    mode: 'production',
};