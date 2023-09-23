module.exports = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
      };
    }

    return config;
  },
};
