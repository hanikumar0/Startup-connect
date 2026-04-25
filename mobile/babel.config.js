module.exports = function (api) {
    api.cache(true);
    const plugins = [];

    if (process.env.BABEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
        plugins.push('transform-remove-console');
    }

    return {
        presets: ['babel-preset-expo'],
        plugins: plugins,
    };
};
