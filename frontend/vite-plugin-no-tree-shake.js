
export function noTreeShake() {
  return {
    name: 'no-tree-shake',
    transform(code, id) {
      if (id.includes('Router.tsx') || id.includes('Admin')) {
        return {
          code,
          moduleSideEffects: 'no-treeshake'
        };
      }
    }
  };
}