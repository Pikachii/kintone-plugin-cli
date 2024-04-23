import { CommandDef } from "citty";

const _rDefault = (r: any) => (r.default || r) as Promise<CommandDef>;

export const commands = {
  init: () => import('./init.js').then(_rDefault),
  dev: () => import('./dev.js').then(_rDefault),
  build: () => import('./build.js').then(_rDefault),
} as const;