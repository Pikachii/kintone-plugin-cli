import * as fs from 'fs';
import { defineCommand } from "citty";
import { resolve } from "pathe";
import { consola } from 'consola';
import { downloadTemplate } from 'giget';

import packer from '@kintone/plugin-packer';
import archiver from 'archiver';

const DEFAULT_REGISTRY =
  'https://raw.githubusercontent.com/pikachii/kintone-plugin-cli/main/templates'
const DEFAULT_TEMPLATE_NAME = 'template';

export default defineCommand({
  meta: {
    name: 'init',
    description: 'Initialize a new project',
  },
  args: {
    dir: {
      type: 'positional',
      description: 'Project directory',
      default: 'sample-plugin',
    }
  },
  async run(ctx) {
    consola.info('Initializing project...');
    const cwd = resolve('.')
    const template = await createProjectDir(ctx.args.dir, cwd);
    const pluginDir = resolve(template.dir, 'plugin');
    editConfigHtml(ctx.args.dir, pluginDir);
    editManifestJson(ctx.args.dir, pluginDir);
    createPluginJsFiles(pluginDir);

    await createPpk(template.dir);
  }
})

async function createProjectDir(dir: string, cwd: string) {
  const templateName = DEFAULT_TEMPLATE_NAME;
  // Download template
  try {
    return await downloadTemplate(templateName, {
      dir,
      cwd,
      registry: DEFAULT_REGISTRY,
    })
  } catch (err) {
    if (process.env.DEBUG) {
      throw err
    }
    consola.error((err as Error).toString())
    process.exit(1)
  }    
}

function editConfigHtml(dir: string, path: string) {
  consola.info('Editing config.html...');

  // config.html を開く
  const configHtml = fs.readFileSync(resolve(path, 'html', 'config.html'), 'utf-8');
  
  // title を変更する
  const newConfigHtml = configHtml.replace('id=""', `id="${dir}-settings"`);
  fs.writeFileSync(resolve(path, 'html', 'config.html'), newConfigHtml);
}

function editManifestJson(dir: string, path: string) {
  consola.info('Editing manifest.json...');

  // manifest.json を開く
  const manifestFile = fs.readFileSync(resolve(path, 'manifest.json'), 'utf-8');
  
  // name を変更する
  const manifest = JSON.parse(manifestFile);
  manifest.name.ja = dir;
  manifest.name.en = dir;
  manifest.description.ja = dir;
  manifest.description.en = dir;
  fs.writeFileSync(resolve(path, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

function createPluginJsFiles(path: string) {
  consola.info('Creating plugin/js files...');
  // plugin/js フォルダを作成する
  fs.mkdirSync(resolve(path, 'js'));

  // pluginフォルダ配下に、config.js, desktop.js, mobile.js を作成する
  fs.writeFileSync(resolve(path, 'js', 'config.js'), '');
  fs.writeFileSync(resolve(path, 'js', 'desktop.js'), '');
  fs.writeFileSync(resolve(path, 'js', 'mobile.js'), '');
}

async function createPpk(cwd: string) {
  consola.info('Creating .ppk file...');

  // dist フォルダを作成する
  const distDir = resolve(cwd, 'dist');
  fs.mkdirSync(distDir);

  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  // dist/plugin-dev.zip ファイルを作成する
  const output = fs.createWriteStream(resolve(distDir, 'plugin-dev.zip'));
  archive.pipe(output);
  archive.directory(resolve(cwd, 'plugin'), false);
  await archive.finalize();

  await new Promise((resolve, reject) => {
    output.on("close", resolve);
    output.on("error", reject);
  });

  // ZIPファイルをBufferに変換する
  const buffer = fs.readFileSync(resolve(distDir, 'plugin-dev.zip'));

  // プラグインをパッキングする
  const result = await packer(buffer);

  // private.ppk ファイルを作成する
  fs.writeFileSync(resolve(cwd, 'private.ppk'), result.privateKey);
}