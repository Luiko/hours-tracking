const Path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Webpack = require('webpack');

module.exports = {
  entry: ['babel-polyfill', './src/index'],
  output: {
    filename: 'bundle.js',
    path: Path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: [ 'style-loader',
          { loader: 'css-loader', options: { minimize: true } }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        html5: true,
        removeAttributeQuotes: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true
      }
    }),
    new Webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new Webpack.optimize.UglifyJsPlugin()
  ]
};
