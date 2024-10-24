const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

// Make compatible plugin for Webpack 5 with NextJS
// Based on https://webpack.js.org/contribute/writing-a-plugin/#example
// and https://github.com/webdeveric/webpack-assets-manifest/blob/master/src/WebpackAssetsManifest.js

class AssetManifestPlugin {
  static name = 'AssetManifestPlugin';
  static defaultOptions = {
    outputFile: '/static/asset-manifest.json',
    isPWA: false,
    isStorybook: false,
  };

  constructor(options = {}) {
    this.options = { ...AssetManifestPlugin.defaultOptions, ...options };
  }

  apply(compiler) {
    const pluginName = AssetManifestPlugin.name;
    const { webpack } = compiler;
    const { Compilation } = webpack;
    const { RawSource } = webpack.sources;

    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        async () => {
          const assetEntries = compilation
            .getAssets()
            .map(asset => [
              asset.info.sourceFilename
                ? asset.info.sourceFilename.replace('src/', '')
                : asset.name,
              this.options.isStorybook
                ? asset.name
                : asset.name.replace('static/', ''),
            ])
            .sort(([nameA], [nameB]) => {
              if (nameA < nameB) return -1;
              if (nameA > nameB) return 1;
              return 0;
            });

          const assetManifest = assetEntries.reduce(
            (acc, [key, value]) => ({ ...acc, [key]: value }),
            {}
          );
          const data = JSON.stringify(assetManifest, null, ' ');

          compilation.emitAsset(this.options.outputFile, new RawSource(data));

          if (this.options.isPWA) {
            // Create a copy for WorkBox
            const targetPath = path.resolve(__dirname, './../public/static');
            const target = path.resolve(
              targetPath,
              this.options.outputFile.match(/[^/]*$/)[0]
            );
            await mkdirp(targetPath);
            fs.writeFileSync(target, data);
          }
        }
      );
    });
  }
}

module.exports = AssetManifestPlugin;
