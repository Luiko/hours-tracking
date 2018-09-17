const Path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: ['babel-polyfill', './src/index'],
  output: {
    filename: 'bundle.js',
    path: Path.resolve(__dirname, 'dist')
  },
  devtool: 'inline-source-map',
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
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' }
        ]
      },
      {
        test: /\.png$/,
        loader: 'file-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: { html5: true, removeAttributeQuotes: true, removeComments: true }
    })
  ]
};
