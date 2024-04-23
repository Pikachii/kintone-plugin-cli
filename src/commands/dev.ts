import * as fs from 'fs';
import KintonePlugin from '@kintone/webpack-plugin-kintone-plugin';
import * as uploader from '@kintone/plugin-uploader';
import { defineCommand } from "citty";
import consola from "consola";
import webpack from "webpack";
import { defineWebpackConfig } from "../config/webpack.config.js";
import { pluginZipFilePath } from '../utils/zipPath.js';
import { resolve } from 'pathe';

export default defineCommand({
  meta: {
    name: 'dev',
    description: 'Upload plugin for development',
  },
  async run() {
    consola.info('Upload plugin for development...');

    const zipFilePath = await pluginZipFilePath(process.cwd());
    const kintonePlugin = new KintonePlugin({
      manifestJSONPath: resolve(process.cwd(), 'plugin/manifest.json'),
      privateKeyPath: resolve(process.cwd(), 'private.ppk'),
      pluginZipPath: resolve('dist', zipFilePath),
    });
    const config = defineWebpackConfig(process.cwd(), kintonePlugin);

    // .envファイルが存在しない場合は作成する
    await generateDotEnv();
    const env = (await import('dotenv')).config().parsed;
    if(!env) {
      consola.error('Failed to upload plugin for development');
      process.exit(1);
    }

    webpack({ ...config, mode: 'development', watch: true, devtool: 'eval-source-map' }, (err, stats) => {
      if (err || stats?.hasErrors()) {
        consola.error('Failed to upload plugin for development');
        return;
      }
      consola.success('Successfully uploaded plugin for development');
      uploader.run(`https://${env.KINTONE_DOMAIN}.cybozu.com`, env.KINTONE_USERNAME, env.KINTONE_PASSWORD, resolve('dist', zipFilePath), { lang: 'ja'});
    });
  }
});

async function generateDotEnv() {
  if (!fs.existsSync(resolve(process.cwd(), '.env'))) {
    consola.info('Please Tell me your kintone domain, username, and password.');
    // domain, username, passwordを入力してもらう
    consola.info('Please input your kintone domain.');
    const domain = await consola.prompt('Domain:');
    consola.info('Please input your kintone username.');
    const username = await consola.prompt('Username:');
    consola.info('Please input your kintone password.');
    // password は入力時に表示されないようにする
    const password = await consola.prompt('Password:');
    fs.writeFileSync(resolve(process.cwd(), '.env'), `KINTONE_DOMAIN=${domain}\nKINTONE_USERNAME=${username}\nKINTONE_PASSWORD=${password}`);
    consola.success('Successfully created .env file');
  }  
}