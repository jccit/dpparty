const path = require('path');
const Dotenv = require('dotenv-webpack');

const isProd = process.env.NODE_ENV === 'production';

function getConfig(modules) {
    const entry = {};

    modules.forEach(mod => {
        entry[mod] = `./src/${mod}/index.ts`
    });

    return {
        entry,
        mode: isProd ? 'production' : 'development',
        devtool: isProd ? 'none' : 'inline-source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?/,
                    use: [{
                        loader: 'ts-loader',
                        options: {
                            onlyCompileBundledFiles: true
                        }
                    }],
                    exclude: /node_modules/
                }
            ]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js']
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname)
        },
        plugins: [
            new Dotenv()
        ]
    }
}

module.exports = getConfig(['background', 'player', 'popup', 'content']);