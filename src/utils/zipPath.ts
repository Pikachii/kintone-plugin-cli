import * as fs from 'fs';
import { resolve } from "pathe";

const pluginZipFilePath = async (cwd: string) => {
  // manifest.jsonをcwdを使って動的インポート
  const manifestFile = fs.readFileSync(resolve(cwd, 'plugin', 'manifest.json'), 'utf-8');
  const manifest = JSON.parse(manifestFile);
  const desc = manifest.name.en
    .toLowerCase()
    .replace(/(\s|_)/g, '-')
    .replace(/[^a-z0-9-]+/g, '');
  return `${desc}-${manifest.version}.zip`;
}

export {
  pluginZipFilePath,
}