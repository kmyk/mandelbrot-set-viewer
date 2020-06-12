var path = require('path');
module.exports = {
    mode: 'production',
    entry: {
        app :'./src/main.ts',
    },
    output: {
        path: path.resolve("./public/"),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                exclude: /(node_modules)/,
                loaders: [ "babel-loader", "ts-loader" ],
            },
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /(node_modules)/,
                loaders: [ "raw-loader", "glslify-loader" ],
            },
        ],
    },
};
