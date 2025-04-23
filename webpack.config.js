const path = require('path');

module.exports = {
  entry: './js/main.js',  // 入口文件
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  mode: 'development',
  // 添加 source map 支持，方便调试
  devtool: 'source-map',
  // 添加开发服务器配置
  devServer: {
    static: {
      directory: path.join(__dirname, '/'),
    },
    hot: true,
    open: true,
    port: 8080
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};