const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const localeConfig = require('./config/locale.webpack');
const vendorLibs = require('./config/vendor-libs');
const BundleTracker = require('webpack-bundle-tracker');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const gitRevisionPlugin = new GitRevisionPlugin({
  versionCommand: 'rev-list HEAD | wc -l', // this counts the number of commits and is used as a build number.
});

const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';

let config;
let localePath = '../../';
switch (process.env.NODE_ENV) {
  case 'production':
    config = require('./config/env/production');
    break;
  case 'staging':
    config = require('./config/env/staging');
    break;
  case 'fakeapi':
    config = require('./config/env/fakeapi');
    localePath = 'fake';
    break;
  case 'dev-staging':
    config = require('./config/env/dev-staging');
    break;
  case 'dev-local':
    config = require('./config/env/dev-local');
    localePath = 'fake';
    break;
  case 'illia-dev':
    config = require('./config/env/illia-dev');
    localePath = 'fake';
    break;
  default:
    config = require('./config/env/development');
}

const extractStyles = new MiniCssExtractPlugin({
  filename: '[name].[hash].css',
  chunkFilename: '[name].[hash].css',
});

const entry = {
  bundle: ['babel-polyfill', './src/App.js'],
  vendor: vendorLibs,
};

const { localeEntries, localeCatalog } = localeConfig.resolveLocale(entry);
const babelPlugins = ['transform-flow-strip-types', 'react-hot-loader/babel'];

// Webpack base config (env specifics below)
let webpackConfig = {
  mode: isProd ? process.env.NODE_ENV : 'development',
  devtool: !isProd ? 'cheap-source-map' : 'source-map',
  entry: {
    app: ['babel-polyfill', './src/App.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].js',
    publicPath: config.publicPath,
    sourceMapFilename: '[name].[hash].js.map',
  },
  resolve: {
    modules: ['src', 'node_modules'],
    alias: {
      'grank-locale': path.join(__dirname, localePath, 'locale'),
    },
    extensions: ['.js', '.json', '.jsx'],
    symlinks: false,
  },
  module: {
    rules: [
      // JS compiler
      {
        test: /\.(js|jsx)$/,
        enforce: 'pre',
        include: path.resolve(__dirname, 'src'),
        exclude: /(node_modules|fake\/api|config)/,
        use: [
          {
            loader: require.resolve('eslint-loader'),
          },
        ],
      },

      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        oneOf: [
          {
            test: /\.(js|jsx)$/,
            exclude: [/[/\\\\]node_modules[/\\\\]/],
            use: [
              require.resolve('thread-loader'),
              {
                loader: require.resolve('babel-loader'),
                options: {
                  babelrc: false,
                  plugins: babelPlugins,
                  presets: [
                    [
                      'babel-preset-env',
                      {
                        modules: false,
                      },
                    ],
                    'stage-1',
                    'react',
                    'flow',
                  ],
                  compact: isDev,
                  cacheDirectory: true,
                  highlightCode: true,
                },
              },
            ],
          },
          {
            test: /\.po$/,
            exclude: /(node_modules|fake\/api|config)/,
            loader: require.resolve('po-catalog-loader'),
            query: {
              referenceExtensions: ['.js', '.jsx'],
              domain: 'grank',
            },
          },

          {
            test: /\.s?css$/,
            use: [
              require.resolve('style-loader'),
              MiniCssExtractPlugin.loader,
              {
                loader: require.resolve('css-loader'),
                options: { importLoaders: 2, localIdentName: '[hash:base64:5]' },
              },
              {
                loader: require.resolve('sass-loader'),
                options: { includePaths: [path.resolve(__dirname, './src/css')] },
              },
            ],
          },
          {
            test: /\.(graphql|gql)$/,
            exclude: /(node_modules|fake\/api|config)/,
            loader: require.resolve('graphql-tag/loader'),
          },

          {
            test: /\.svg$/,
            oneOf: [
              {
                resourceQuery: /inline/,
                use: [
                  'babel-loader',
                  'svg-react-loader',
                  {
                    loader: 'svgo-loader',
                    options: {
                      plugins: [
                        { removeViewBox: false },
                        { removeUselessStrokeAndFill: false },
                        { convertShapeToPath: false },
                      ],
                    },
                  },
                ],
              },
              {
                loader: 'file-loader',
                query: {
                  name: 'static/media/[name].[hash:8].[ext]',
                },
              },
            ],
          },

          // Fallback "file" loader
          {
            exclude: [/\.html$/, /\.(js|jsx)(\?.*)?$/, /\.s?css$/, /\.json$/, /\.po$/],
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
        ],
      },
    ],
  },
  externals: {
    config: JSON.stringify(config),
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
    runtimeChunk: false,
  },
  plugins: [
    extractStyles,
    new webpack.DefinePlugin({
      COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
      BUILDNUMBER: JSON.stringify(gitRevisionPlugin.version()),
    }),
    new webpack.ContextReplacementPlugin(
      /locale$/,
      path.join(__dirname, localePath, 'locale', path.sep),
      true,
      new RegExp(`(${localeCatalog.supported_locales.join('|')})/.*\\.po$`),
    ),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new HtmlWebpackPlugin({ template: './index.html' }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new BundleTracker({ filename: './webpack-stats.json' }),
    new WebpackCleanupPlugin(),
  ],
  devServer: {
    historyApiFallback: true,
    disableHostCheck: true,
    clientLogLevel: 'error',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};

// Dev specific
if (!isProd)
  webpackConfig = {
    ...webpackConfig,
    plugins: [
      ...webpackConfig.plugins,
      new webpack.EnvironmentPlugin({ NODE_ENV: 'development' }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
    ],
  };

// Prod specific
if (isProd)
  webpackConfig = {
    ...webpackConfig,
    plugins: [
      ...webpackConfig.plugins,
      new UglifyJsPlugin({
        cache: true,
        parallel: 8,
        sourceMap: true,
        uglifyOptions: {
          compress: {
            pure_funcs: ['console.log'],
          },
        },
      }),
    ],
  };

// Export env webpack config
module.exports = webpackConfig;
