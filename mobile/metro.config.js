const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force transpile packages that use private class fields (#field syntax)
config.transformer.unstable_allowRequireContext = true;
config.resolver.unstable_enablePackageExports = false;

const originalAsyncRequireModulePath = config.transformer.asyncRequireModulePath;

config.resolver.sourceExts = [...config.resolver.sourceExts];

// Transpile axios and other packages that use unsupported syntax
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
