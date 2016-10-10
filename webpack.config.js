var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  devtool: 'source-map',
  debug: true,

  entry: {
    'angular2': [
      'rxjs',
      'reflect-metadata',
      '@angular/core',
      'hammerjs'
    ],
    'app': './src/app/app'
  },

  output: {
    path: __dirname + '/src/build/',
    publicPath: 'build/',
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
    chunkFilename: '[id].chunk.js'
  },

  resolve: {
    extensions: ['', '.js', '.ts', '.json', '.scss', '.css', '.html']
  },

  module: {
    loaders: [
      {
        test: /\.ts$/,
        loaders: ["ts", "angular2-template-loader"],
        exclude: [/node_modules/]
      },
      {
        test: /\.scss$/,
        loaders: ["raw", "sass"]
      },
      /*
       * Raw loader support for load images for bootstrap
       * Returns file content as string
       *
       * See: https://github.com/webpack/file-loader
       */
      {
        test: /\.(png|ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file?name=fonts/[name].[hash].[ext]'
      },
      /*
       * the file-loader emits files from font-awesome
       * Returns file content as string
       *
       * See: https://github.com/webpack/file-loader
       */
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file?name=fonts/[name].[hash].[ext]"
      },
      {
        test: /\.(html|css)$/,
        loaders: ["raw"]
      }
    ]
  },
  sassLoader: {
    includePaths: [path.resolve(__dirname, "./src/assets")]
  },
  plugins: [
    new CopyWebpackPlugin([{from: 'node_modules/zone.js/dist/zone.js', to: 'zone.js'}]),
    new webpack.ExternalsPlugin('commonjs', [
            'desktop-capturer',
            'electron',
            'ipc',
            'ipc-renderer',
            'native-image',
            'remote',
            'web-frame',
            'clipboard',
            'crash-reporter',
            'screen',
            'shell'
        ])
  ],
  target: 'node-webkit'
};