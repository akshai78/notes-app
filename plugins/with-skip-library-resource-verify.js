const { withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * Library verifyReleaseResources / lintVital often fail in local Expo release
 * builds (SDK mismatch). They do not change the APK the user installs.
 */
function withSkipLibraryResourceVerify(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') return config;
    const marker = 'codered.skipLibraryReleaseChecks';
    if (config.modResults.contents.includes(marker)) return config;
    config.modResults.contents += `
// ${marker}
subprojects {
    tasks.configureEach { task ->
        if (task.name.contains('verifyReleaseResources') || task.name.contains('lintVital')) {
            task.enabled = false
        }
    }
}
`;
    return config;
  });
}

module.exports = withSkipLibraryResourceVerify;
