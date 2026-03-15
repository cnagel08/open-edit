// UMD entry point — exports OpenEdit as the default so that Vite/Rollup
// sets window.OpenEdit = { create, version, locales, plugins, markdown }
// instead of the double-namespace window.OpenEdit.OpenEdit.create
export { OpenEdit as default } from './index.js';
