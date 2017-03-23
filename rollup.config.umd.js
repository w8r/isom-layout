import config from './rollup.config';

config.format     = 'umd';
config.dest       = 'dist/som.js';
config.exports    = 'default';
config.moduleName = 'som';

export default config;
