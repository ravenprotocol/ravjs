import { resolve, dirname } from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
    entry: './src/index.js',
    output: {
        path: resolve(__dirname, 'dist'),
        filename: 'ravjs.js',
        library: {
            name: "ravJS",
            type: "umd"
        }
    },
    target: 'node'
};