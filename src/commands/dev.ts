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
      pluginZipPath: zipFilePath,
    });
    const config = defineWebpackConfig(process.cwd(), kintonePlugin);
    const env = (await import('dotenv')).config().parsed;
    if(!env) {
      consola.error('Failed to upload plugin for development');
      process.exit(1);
    }

    const compiler = webpack({ ...config, mode: 'development', watch: true });
    compiler.watch({}, (err, stats) => {
      if (err || stats?.hasErrors()) {
        consola.error('Failed to upload plugin for development');
        return;
      }
      consola.success('Successfully uploaded plugin for development');
      uploader.run(`https://${env.KINTONE_DOMAIN}`, env.KINTONE_USERNAME, env.KINTONE_PASSWORD, zipFilePath, { lang: 'ja'});
    });

  }
})