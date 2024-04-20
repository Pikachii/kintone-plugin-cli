import { CommandDef } from "citty";

const _rDefault = (r: any) => (r.default || r) as Promise<CommandDef>;

export const commands = {
  init: () => import('./init.js').then(_rDefault),
} as const;