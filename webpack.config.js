'use strict';

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const TerserPlugin = require('terser-webpack-plugin');
// const Dotenv = require('dotenv-webpack');

const prd = false;
const join = (p) => path.join(__dirname, p);
const sourceMaps = prd ? 'cheap-module-eval-source-map' : 'source-map';
const MAIN_PACKAGES = ['background', 'popup', 'example'];
const ALL_PACKAGES = [...MAIN_PACKAGES, 'content-script', 'injected-script'];

module.exports = {
  entry: ALL_PACKAGES.reduce((entry, p) => {
    entry[p] = path.resolve(`src/${p}/${p}.js`);
    return entry;
  }, {}),
  output: {
    path: path.resolve('./dist'),
    pathinfo: false,
    filename: '[name].js',
    globalObject: 'this',
  },
  mode: !prd ? 'development' : 'production',
  // optimization: {
  //   minimizer: [
  //     new TerserPlugin({
  //       terserOptions: {
  //         safari10: true,
  //       },
  //     }),
  //   ],
  //   // splitChunks: {
  //   //   chunks: 'all',
  //   // },
  // },
  module: {
    rules: [
      {
        test: /\.js$/i,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_module/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/i,
        include: [path.resolve(__dirname, 'src')],
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|woff2)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      src: path.resolve('./src'),
    },
  },
  plugins: [
    // new Dotenv(),
    new CopyWebpackPlugin([{ from: 'src/public' }]),
    ...MAIN_PACKAGES.map(
      (template) =>
        new HtmlWebpackPlugin({
          filename: `${template}.html`,
          template: join(`src/${template}/${template}.html`),
          chunks: [template],
          minify: prd
            ? false
            : {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
              },
        })
    ),
  ],

  devtool: sourceMaps,

  devServer: {
    disableHostCheck: true,
    writeToDisk: false,
    clientLogLevel: 'silent',
  },
};
