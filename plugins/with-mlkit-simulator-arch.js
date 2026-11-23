/**
 * Keeps the iOS Podfile fix that lets Apple Silicon simulators build despite
 * Google ML Kit (device-only arm64). Mirrors the post_install block in ios/Podfile.
 *
 * ML Kit features are stubbed on simulator via pnpm patches; use a physical
 * device for category/OCR.
 */
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const TAG = 'occa-mlkit-simulator-arch';

const POST_INSTALL_SNIPPET = `
    # @generated begin ${TAG} - expo prebuild (plugins/with-mlkit-simulator-arch.js)
    # Google ML Kit frameworks are device-only arm64. CocoaPods then sets
    # EXCLUDED_ARCHS[sdk=iphonesimulator*] = arm64, which leaves no valid arch on
    # Apple Silicon (Xcode 16+/27 has no x86_64 simulators). Clear that exclusion
    # and drop ML Kit from the simulator link line. Native wrappers are stubbed
    # for simulator via pnpm patches (see patches/*mlkit*).
    mlkit_framework_pattern = /-framework "(?:MLImage|MLKit[^"]*)"/
    Dir.glob(File.join(__dir__, 'Pods', 'Target Support Files', 'Pods-*', '*.xcconfig')).each do |xcconfig_path|
      text = File.read(xcconfig_path)
      original = text
      text = text.gsub(/EXCLUDED_ARCHS\\[sdk=iphonesimulator\\*\\] = arm64/, 'EXCLUDED_ARCHS[sdk=iphonesimulator*] =')

      if text =~ /^OTHER_LDFLAGS = (.*)$/
        full_ldflags = Regexp.last_match(1)
        sim_ldflags = full_ldflags.gsub(mlkit_framework_pattern, '')
        unless text.include?('OTHER_LDFLAGS[sdk=iphonesimulator*]')
          text.sub!(/^OTHER_LDFLAGS = .*$/, <<~XCCONFIG.chomp)
            OTHER_LDFLAGS = $(inherited)
            OTHER_LDFLAGS[sdk=iphoneos*] = #{full_ldflags}
            OTHER_LDFLAGS[sdk=iphonesimulator*] = #{sim_ldflags}
          XCCONFIG
        end
      end

      File.write(xcconfig_path, text) if text != original
    end
    # @generated end ${TAG}
`;

function withMlkitSimulatorArch(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = await fs.promises.readFile(podfilePath, 'utf8');
      if (contents.includes(TAG) || contents.includes('mlkit_framework_pattern')) {
        return config;
      }

      const anchor = 'ccache_enabled?(podfile_properties),';
      const idx = contents.lastIndexOf(anchor);
      if (idx === -1) {
        throw new Error(
          `[${TAG}] Could not find react_native_post_install ccache line in Podfile to inject ML Kit simulator fix.`,
        );
      }

      const insertAt = contents.indexOf(')', idx) + 1;
      contents =
        contents.slice(0, insertAt) + '\n' + POST_INSTALL_SNIPPET + contents.slice(insertAt);
      await fs.promises.writeFile(podfilePath, contents);
      return config;
    },
  ]);
}

module.exports = withMlkitSimulatorArch;
