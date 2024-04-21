import { defineCommand } from "citty";
import consola from "consola";

export default defineCommand({
  meta: {
    name: 'dev',
    description: 'Upload plugin for development',
  },
  async run() {
    consola.info('Upload plugin for development...');
  }
})