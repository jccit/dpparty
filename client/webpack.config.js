const path = require('path');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');

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
            path: path.resolve(__dirname, 'dist')
        },
        plugins: [
            new Dotenv(),
            new CopyPlugin({
                patterns: [
                    { from: 'public', to: '.' },
                ],
            })
        ]
    }
}

module.exports = getConfig(['background', 'player', 'popup', 'content']);