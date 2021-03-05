const yaml = require('js-yaml');
const merge = require('deepmerge');
const path = require('path');
const fs = require('fs');

const envz = (envfile, opts) => {
    opts = Object.assign(process.env, opts || {});

    // Set the CWD
    opts.cwd = process.cwd();

    // Set the env or fallback to development
    opts.env = process.env.NODE_ENV || 'development';

    // If env is supplied, override the defaults
    if(opts.environment){
        opts.env = opts.environment;
    }

    // Read in the file
    envfile = path.resolve(opts.cwd, envfile || 'env.yaml');
    const contents = fs.readFileSync(envfile, 'utf8');

    // Parse the env contents
    const parsed = yaml.load(contents);

    // Setup objects to merge
    const mergeObjects = [];

    // If set, set the ENV first and override with env.yaml file
    if(opts.yamlFileOverride === true){
        mergeObjects.push(Object.assign({}, opts, { envFilePath: envfile }));
    }

    for(const environment in parsed){
        // If an env is set, break on that and don't cascade
        if(opts.env === environment){
            mergeObjects.push(parsed[environment]);
            break;
        }
        mergeObjects.push(parsed[environment]);
    }

    // If not set or false, override file with environment variables
    if(!opts.yamlFileOverride || opts.yamlFileOverride === false || opts.yamlFileOverride === 'false'){
        mergeObjects.push(Object.assign({}, opts, { envFilePath: envfile }));
    }

    const processed = merge.all(mergeObjects);
    return processed;
};

module.exports = envz;
