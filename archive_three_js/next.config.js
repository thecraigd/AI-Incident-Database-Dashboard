module.exports = {
  reactStrictMode: true,
  webpack: (config) => {
    // Add worker-loader for web workers
    config.module.rules.push({
      test: /\.worker\.js$/,
      loader: 'worker-loader',
      options: {
        name: 'static/[hash].worker.js',
        publicPath: '/_next/',
      },
    });

    return config;
  },
};