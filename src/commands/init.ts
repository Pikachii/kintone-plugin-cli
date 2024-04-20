import * as fs from 'fs';
import { defineCommand } from "citty";
import { resolve } from "pathe";
import { consola } from 'consola';
import { downloadTemplate } from 'giget';

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
    const projectDirPath = createProjectDir(ctx.args.dir);

    initPlugin(projectDirPath);
    await createPluginFiles(ctx.args.dir, projectDirPath);
    await editManifestJson(ctx.args.dir, projectDirPath);
    initPluginJs(projectDirPath);
  }
})

function createProjectDir(projectDir: string) {
  const cwd = resolve('.');
  const projectDirPath = resolve(cwd, projectDir);
  consola.info('Creating project directory...');
  // プロジェクトディレクトリを作成する
  const dirExists = fs.existsSync(projectDirPath);
  if (dirExists) {
    consola.error(`Project directory already exists.: ${projectDir}`);
    process.exit(1);
  } else {
    fs.mkdirSync(projectDirPath);
    return projectDirPath;
  }
}

function initPlugin(path: string) {
  consola.info('Creating plugin folder...');
  // plugin フォルダを作成する
  const pluginDir = resolve(path, 'plugin');
  const pluginExists = fs.existsSync(pluginDir);
  if (pluginExists) {
    consola.info('plugin clean up...');
    fs.rmdirSync(resolve('plugin'), { recursive: true });
  }
  fs.mkdirSync(resolve(pluginDir), { recursive: true });
}

async function createPluginFiles(dir: string, path: string) {
  consola.info('Creating plugin files...');
  // html/config.html, image/icon.png を作成する
  const htmlDir = resolve(path, 'html');
  fs.mkdirSync(resolve(htmlDir), { recursive: true });
  fs.writeFileSync(resolve(htmlDir, 'config.html'), `<div id="${dir}-settings"></div>`);

  const imageDir = resolve(path, 'image');
  fs.mkdirSync(resolve(imageDir), { recursive: true });
  await downloadTemplate('https://raw.githubusercontent.com/pikachii/kintone-plugin-cli/templates/icon.png', { dir: resolve(imageDir)});

  await downloadTemplate('https://raw.githubusercontent.com/pikachii/kintone-plugin-cli/templates/manifest.json', { dir: resolve(path)});
}

async function editManifestJson(dir: string, path: string) {
  consola.info('Creating manifest.json...');

  // manifest.json を開く
  const manifestFile = fs.readFileSync(resolve(path, 'manifest.json'), 'utf-8');
  
  // name を変更する
  const manifest = JSON.parse(manifestFile);
  manifest.name.ja = dir;
  manifest.name.en = dir;
  fs.writeFileSync(resolve(path, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

function initPluginJs(dir: string) {
  consola.info('Creating plugin JavaScript Files...');
  // js フォルダを作成する
  const pluginJsDir = resolve(dir, 'js');
  fs.mkdirSync(resolve(pluginJsDir), { recursive: true });
  
  // config.js, desktop.js, mobile.js を作成する
  fs.writeFileSync(resolve(pluginJsDir, 'config.js'), '');
  fs.writeFileSync(resolve(pluginJsDir, 'desktop.js'), '');
  fs.writeFileSync(resolve(pluginJsDir, 'mobile.js'), '');
}