module.exports = {
  plugins: ['@trivago/prettier-plugin-sort-imports'],

  importOrder: ['^nanoid$', '<THIRD_PARTY_MODULES>', '^@/(.*)$', '^[./]'],

  importOrderSeparation: false,
  importOrderSortSpecifiers: true,

  importOrderTypeScriptVersion: '5.0.0',
  importOrderMergeDuplicateImports: true,
  importOrderCombineTypeAndValueImports: false,
};
