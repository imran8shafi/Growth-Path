const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add CSS to source extensions
config.resolver.sourceExts.push('css');

module.exports = config;