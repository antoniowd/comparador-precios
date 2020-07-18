const path = require('path')
const fs = require('fs')

const PATHS = {
  pages: './src/pages/'
}

var entries = {
  landing_index: PATHS.pages + 'landing/index.js',
  landing_resultado: PATHS.pages + 'landing/resultado.js',
  producto_index: PATHS.pages + 'producto/index.js',
  categoria_index: PATHS.pages + 'categoria/index.js',
  oferta_index: PATHS.pages + 'oferta/index.js',
}

module.exports = {
  entry: entries,
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public/javascripts')
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(scss)$/,
        use: [
          {
            // Adds CSS to the DOM by injecting a `<style>` tag
            loader: 'style-loader'
          },
          {
            // Interprets `@import` and `url()` like `import/require()` and will resolve them
            loader: 'css-loader'
          },
          {
            // Loader for webpack to process CSS with PostCSS
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [
                  require('precss'),
                  require('autoprefixer')
                ]
              }
            }
          },
          {
            // Loads a SASS/SCSS file and compiles it to CSS
            loader: 'sass-loader'
          }
        ]
      }
    ]
  }
}