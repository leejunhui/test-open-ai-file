const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const specificContent =
  'https://github.com/electron/electron/releases/download/';
const newContent = 'https://npm.taobao.org/mirrors/electron/';

const prefix = ''; //'registry.npmmirror.com+';
// const filePath = path.resolve(
//   __dirname,
//   `../node_modules/@electron/get/dist/cjs/artifact-utils.js`
// );

// const exist = fs.existsSync(filePath);
// if (!exist) {
//   throw new Error('🚦🚦🚦: 请先 yarn!');
// }

// const newFile = fs
//   .readFileSync(filePath, { encoding: 'utf-8' })
//   .replace(specificContent, newContent);
// fs.writeFileSync(filePath, newFile);

// const installFilePath = path.resolve(
//   __dirname,
//   `../node_modules/electron/install.js`
// );
// execSync(`node ${installFilePath}`);
// console.log('🚀🚀🚀: 修复 electron 脚本成功');

const electronPkgPath = path.join(
  __dirname,
  '../node_modules/electron/package.json'
);
const electronPkg = require(electronPkgPath);

electronPkg.config = electronPkg.config || {};
electronPkg.config.electronMirror = 'https://npmmirror.com/mirrors/electron/';

fs.writeFileSync(electronPkgPath, JSON.stringify(electronPkg, null, 2));

console.log('Electron package.json has been updated with the correct mirror.');
