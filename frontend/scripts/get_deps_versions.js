const pkg = require('./../package.json');
const pkgLock = require('./../package-lock.json');

const cmsPkg = require('./../../cms/package.json');
const cmsPkgLock = require('./../../cms/package-lock.json');

const getPkgVersions = (deps, lock) => Object.fromEntries(
  Object.keys(deps).map(dep => {
    return [dep, lock.packages[`node_modules/${dep}`].version];
  })
);

const installedDeps = getPkgVersions(pkg.dependencies, pkgLock);
const installedDevDeps = getPkgVersions(pkg.devDependencies, pkgLock);
const installedCMSDeps = getPkgVersions(cmsPkg.dependencies, cmsPkgLock);
const installedCMSDevDeps = getPkgVersions(cmsPkg.devDependencies, cmsPkgLock);

console.log('installedDeps', JSON.stringify(installedDeps, null, ' '));
console.log('installedDevDeps', JSON.stringify(installedDevDeps, null, ' '));
console.log('installedCMSDeps', JSON.stringify(installedCMSDeps, null, ' '));
console.log('installedCMSDevDeps', JSON.stringify(installedCMSDevDeps, null, ' '));
