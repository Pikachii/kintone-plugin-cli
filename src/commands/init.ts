import * as fs from 'fs';
import { defineCommand } from "citty";
import { relative, resolve } from 'pathe'
import { consola } from 'consola';
import { downloadTemplate } from 'giget';
import { installDependencies } from 'nypm'
import { createZip } from 'utils/createZip';

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
    consola.start('Initializing project...');
    const cwd = resolve('.')
    const template = await createProjectDir(ctx.args.dir, cwd);
    const pluginDir = resolve(template.dir, 'plugin');
    editConfigHtml(ctx.args.dir, pluginDir);
    editManifestJson(ctx.args.dir, pluginDir);
    createPluginJsFiles(pluginDir);

    await createPpk(template.dir);
    await installPackages(template.dir);

    await gitInitialize(template.dir);

    consola.log(
      `\n✨ kintone plugin project has been created with the \`${template.name}\` template. Next steps:`,
    )
    const relativeTemplateDir = relative(process.cwd(), template.dir) || '.'
    const nextSteps = [
      !ctx.args.shell &&
        relativeTemplateDir.length > 1 &&
        `\`cd ${relativeTemplateDir}\``,
      `Start development server with npm run dev\``,
    ].filter(Boolean)

    for (const step of nextSteps) {
      consola.log(` › ${step}`)
    }
  }
})

async function createProjectDir(dir: string, cwd: string) {
  consola.start('Creating project directory...')
  const templateName = DEFAULT_TEMPLATE_NAME;
  // Download template
  try {
    const template = await downloadTemplate(templateName, {
      dir,
      cwd,
      registry: DEFAULT_REGISTRY,
    })
    consola.success('Project directory created.')
    return template;
  } catch (err) {
    if (process.env.DEBUG) {
      throw err
    }
    consola.error((err as Error).toString())
    process.exit(1)
  }    
}

function editConfigHtml(dir: string, path: string) {
  consola.start('Editing config.html...');

  // config.html を開く
  const configHtml = fs.readFileSync(resolve(path, 'html', 'config.html'), 'utf-8');
  
  // title を変更する
  const newConfigHtml = configHtml.replace('id=""', `id="${dir}-settings"`);
  fs.writeFileSync(resolve(path, 'html', 'config.html'), newConfigHtml);
  consola.success('config.html edited.');
}

function editManifestJson(dir: string, path: string) {
  consola.start('Editing manifest.json...');

  // manifest.json を開く
  const manifestFile = fs.readFileSync(resolve(path, 'manifest.json'), 'utf-8');
  
  // name を変更する
  const manifest = JSON.parse(manifestFile);
  manifest.name.ja = dir;
  manifest.name.en = dir;
  manifest.description.ja = dir;
  manifest.description.en = dir;
  fs.writeFileSync(resolve(path, 'manifest.json'), JSON.stringify(manifest, null, 2));
  consola.success('manifest.json edited.');
}

function createPluginJsFiles(path: string) {
  consola.start('Creating plugin/js files...');
  // plugin/js フォルダを作成する
  fs.mkdirSync(resolve(path, 'js'));

  // pluginフォルダ配下に、config.js, desktop.js, mobile.js を作成する
  fs.writeFileSync(resolve(path, 'js', 'config.js'), '');
  fs.writeFileSync(resolve(path, 'js', 'desktop.js'), '');
  fs.writeFileSync(resolve(path, 'js', 'mobile.js'), '');
  consola.success('plugin/js files created.');
}

async function createPpk(cwd: string) {
  consola.start('Creating private.ppk file...');

  const result = await createZip(cwd);

  // private.ppk ファイルを作成する
  fs.writeFileSync(resolve(cwd, 'private.ppk'), result.privateKey);
  consola.success('private.ppk file created.');
}

async function installPackages(dir: string) {
  consola.start('Installing packages...')

  try {
    await installDependencies({
      cwd: dir,
    });
    consola.success('Installation completed.')  
  } catch (err) {
    consola.error((err as Error).toString())
    process.exit(1)
  }
}

async function gitInitialize(dir: string) {
  const gitInit = await consola.prompt('Initialize git repository?', {
    type: 'confirm',
  })

  if (!gitInit) {
    consola.info('Skipping git initialization.')
    return;
  }

  consola.start('Initializing git repository...');
  const { execa } = await import('execa');
  try{
    await execa('git', ['init', dir], {
      stdio: 'inherit',
    })
    consola.success('Git initialized.')  
  } catch(err){
    consola.warn(`Failed to initialize git repository: ${err}`)
  }
}