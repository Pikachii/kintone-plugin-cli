const _rDefault = (r) => (r.default || r);
export const commands = {
    init: () => import('./init.js').then(_rDefault),
};
//# sourceMappingURL=index.js.map