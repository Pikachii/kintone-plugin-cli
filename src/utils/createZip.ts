import fs from 'fs';
import { resolve } from 'pathe';
import archiver from 'archiver';
import packer from '@kintone/plugin-packer';

export const createZip = async (cwd: string, zipFileName: string = 'plugin-dev.zip') => {
  // dist フォルダを作成する
  const distDir = resolve(cwd, 'dist');
  if(!fs.existsSync(distDir)) fs.mkdirSync(distDir);

  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  // dist/{zipFileName} ファイルを作成する
  const output = fs.createWriteStream(resolve(distDir, zipFileName));
  archive.pipe(output);
  archive.directory(resolve(cwd, 'plugin'), false);
  await archive.finalize();

  await new Promise((resolve, reject) => {
    output.on("close", resolve);
    output.on("error", reject);
  });

  // ZIPファイルをBufferに変換する
  const buffer = fs.readFileSync(resolve(distDir, zipFileName));

  // プラグインをパッキングする
  const result = await packer(buffer);
  return result;
}