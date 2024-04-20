import * as fs from 'fs';
import { defineCommand } from "citty";
import { resolve } from "pathe";
import { consola } from 'consola';
import { DownloadTemplateResult, downloadTemplate } from 'giget';

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
      default: '',
    }
  },
  async run(ctx) {
    consola.info('Initializing project...');
    const template = await createProjectDir(ctx.args.dir);
    editManifestJson(ctx.args.dir, template.dir);
  }
})

async function createProjectDir(dir: string) {
  const cwd = resolve('.')
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

function editManifestJson(dir: string, path: string) {
  consola.info('Creating manifest.json...');

  // manifest.json を開く
  const manifestFile = fs.readFileSync(resolve(path, 'manifest.json'), 'utf-8');
  
  // name を変更する
  const manifest = JSON.parse(manifestFile);
  manifest.name.ja = dir;
  manifest.name.en = dir;
  fs.writeFileSync(resolve(path, 'manifest.json'), JSON.stringify(manifest, null, 2));
}
