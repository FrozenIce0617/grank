const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const localeConfig = require('./config/locale.webpack');
const BundleTracker = require('webpack-bundle-tracker');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({ size: 4 });
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const gitRevisionPlugin = new GitRevisionPlugin({
  versionCommand: 'rev-list HEAD | wc -l', // this counts the number of commits and is used as a build number.
});

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
    localePath = 'fake';
    break;
  default:
    config = require('./config/env/development');
}

const VENDOR_LIBS = [
  'apollo-cache-inmemory',
  'apollo-client',
  'apollo-link',
  'apollo-link-context',
  'apollo-link-error',
  'apollo-link-ws',
  'ar-mousetrap',
  'babel-polyfill',
  'braintree-web-drop-in',
  'copy-to-clipboard',
  'country-telephone-data',
  'debounce-promise',
  'dom-to-image',
  'file-saver',
  'graphql',
  'graphql-tag',
  'highcharts',
  'jed',
  'libphonenumber-js',
  'lodash',
  'lodash.omit',
  'path-browserify',
  'punycode',
  'qs',
  'querystring-es3',
  'raven-for-redux',
  'raven-js',
  'react',
  'react-addons-css-transition-group',
  'react-addons-transition-group',
  'react-apollo',
  'react-color',
  'react-cookies',
  'react-countdown-now',
  'react-datepicker',
  'react-deep-force-update',
  'react-dom',
  'react-dropzone',
  'react-ga',
  'react-gravatar',
  'react-grecaptcha',
  'react-highcharts',
  'react-intercom',
  'react-intl',
  'react-keydown',
  'react-places-autocomplete',
  'react-redux',
  'react-resize-detector',
  'react-router',
  'react-router-dom',
  'react-scroll-sync',
  'react-scroll-to-component',
  'react-select',
  'react-sortable-hoc',
  'react-sticky',
  'react-telephone-input',
  'react-toastify',
  'react-virtualized',
  'reactstrap',
  'redux',
  'redux-async-initial-state',
  'redux-devtools-extension',
  'redux-form',
  'redux-thunk',
  'reselect',
  'sprintf-js',
  'subscriptions-transport-ws',
  'typeface-open-sans',
  'url',
  'whatwg-fetch',
];

const extractStyles = new ExtractTextPlugin({
  filename: '[name].[contenthash].css',
  disable: process.env.NODE_ENV === 'development',
  ignoreOrder: false,
  allChunks: true,
});

const entry = {
  bundle: ['babel-polyfill', './src/App.js'],
  vendor: VENDOR_LIBS,
};

const { localeEntries, localeCatalog } = localeConfig.resolveLocale(entry);

const babelPlugins = [];

module.exports = {
  entry,
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].js',
    publicPath: config.publicPath,
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
    loaders: [
      {
        loader: 'graphql-tag/loader',
        test: /\.(graphql|gql)$/,
        exclude: /(node_modules|fake\/api|config)/,
      },
    ],
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|fake\/api|config)/,
        use: 'happypack/loader?id=jsx',
        /*
        use: [
          {
            loader: 'babel-loader',
            query: {
              compact: process.env.NODE_ENV === 'development',
              plugins: babelPlugins,
            },
          },
          {
            loader: 'eslint-loader',
          },
        ],
        */
      },
      {
        test: /\.po$/,
        exclude: /(node_modules|fake\/api|config)/,
        loader: 'po-catalog-loader',
        query: {
          referenceExtensions: ['.js', '.jsx'],
          domain: 'grank',
        },
      },
      {
        test: /\.s?css$/,
        use: extractStyles.extract({
          use: 'happypack/loader?id=styles',
          /*
          use: [
            {
              loader: 'css-loader'
            },
            {
              loader: 'sass-loader',
              options: {
                includePaths: [path.resolve(__dirname, './src/css')],
              },
            },
          ],
          */
          fallback: 'style-loader',
        }),
      },
      {
        exclude: [
          /\.html$/,
          /\.(js|jsx)(\?.*)?$/,
          /\.(ts|tsx)(\?.*)?$/,
          /\.s?css$/,
          /\.json$/,
          /\.svg$/,
          /\.po$/,
        ],
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
      {
        test: /\.svg$/,
        oneOf: [
          {
            resourceQuery: /inline/,
            // use: ['babel-loader', 'svg-react-loader'],
            use: 'happypack/loader?id=svg',
          },
          {
            loader: 'file-loader',
            query: {
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
  plugins: [
    new BundleAnalyzerPlugin({
      openAnalyzer: false,
      analyzerMode:
        process.env.NODE_ENV === 'production'
          ? 'disabled'
          : process.env.NODE_ENV === 'staging'
            ? 'disabled'
            : 'server',
    }),
    new webpack.DefinePlugin({
      COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
      BUILDNUMBER: JSON.stringify(gitRevisionPlugin.version()),
    }),
    new HappyPack({
      id: 'jsx',
      loaders: [
        {
          loader: 'babel-loader',
          query: {
            compact: process.env.NODE_ENV === 'development',
            plugins: babelPlugins,
          },
        },
        'eslint-loader',
      ],
      threadPool: happyThreadPool,
    }),
    new HappyPack({
      id: 'styles',
      loaders: [
        {
          loader: 'css-loader',
        },
        {
          loader: 'sass-loader',
          options: {
            includePaths: [path.resolve(__dirname, './src/css')],
          },
        },
      ],
      threadPool: happyThreadPool,
    }),
    new HappyPack({
      id: 'svg',
      loaders: [
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
      threadPool: happyThreadPool,
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    extractStyles,
    new webpack.optimize.CommonsChunkPlugin({
      names: [...localeEntries, ...['vendor', 'manifest']],
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.ContextReplacementPlugin(
      /locale$/,
      path.join(__dirname, localePath, 'locale', path.sep),
      true,
      new RegExp(`(${localeCatalog.supported_locales.join('|')})/.*\\.po$`),
    ),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
    new BundleTracker({ filename: './webpack-stats.json' }),
    new WebpackCleanupPlugin(),
  ],
  devServer: {
    historyApiFallback: true,
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};
