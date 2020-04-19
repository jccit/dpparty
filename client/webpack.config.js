const path = require('path');

function getConfig(modules) {
    const entry = {};

    modules.forEach(mod => {
        entry[mod] = `./src/${mod}/index.ts`
    });

    return {
        entry,
        mode: 'development',
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
        }
    }
}

module.exports = getConfig(['background', 'player', 'popup', 'content']);