const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force transpile packages that use private class fields (#field syntax)
// which Hermes doesn't support without transpilation
config.transformer.transformIgnorePatterns = [
  'node_modules/(?!(jest-worker|react-native|@react-native|expo|@expo|@unimodules|unimodules|sentry-expo|native-base|react-clone-referenced-element|@react-navigation|react-navigation|@react-native-community|expo-router|react-native-screens|react-native-safe-area-context|@expo/vector-icons)/)',
];

module.exports = config;
