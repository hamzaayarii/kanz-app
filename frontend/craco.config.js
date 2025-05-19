const path = require('path');
const { whenDev } = require('@craco/craco');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Cache babel-loader
      const babelLoaderConfig = webpackConfig.module.rules.find(
        (rule) => rule.oneOf
      ).oneOf.find(
        (rule) => rule.loader && rule.loader.includes('babel-loader')
      );
      
      if (babelLoaderConfig) {
        babelLoaderConfig.options.cacheDirectory = true;
        babelLoaderConfig.options.cacheCompression = false;
      }

      // Disable source maps in development for faster builds
      whenDev(() => {
        webpackConfig.devtool = 'eval';
      });

      // Speed up build by limiting the number of chunks
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 10,
          minSize: 0,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                // Get the name of the npm package
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                // Return a readable format to avoid long filenames in chunks
                return `npm.${packageName.replace('@', '')}`;
              },
              priority: -10
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true
            }
          }
        },
        runtimeChunk: 'single'
      };

      return webpackConfig;
    }
  },
  devServer: {
    hot: true,
    client: {
      overlay: false
    }
  }
};
