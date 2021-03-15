const yaml = require('js-yaml');
const merge = require('deepmerge');
const path = require('path');

// Do this for backward compatibility
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

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

    // Check file exists
    if(!fs.existsSync(envfile)){
        throw new Error('Env yaml file does not exist');
    }

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

const save = async (opts) => {
    let error = '';
    // Check the opts are ok
    if(!opts.envfile){
        return 'env file not supplied';
    }
    if(!opts.data){
        return 'env data not supplied';
    }

    // Get the config object
    opts.envfile = path.resolve(process.cwd(), opts.envfile || 'env.yaml');

    // Check file exists
    if(!fs.existsSync(opts.envfile)){
        throw new Error('Env yaml file does not exist');
    }

    const contents = await readFile(opts.envfile, 'utf8');

    // Parse the env contents
    const parsed = yaml.load(contents);

    // Merge supplied with current
    const processed = merge.all([parsed, opts.data]);

    // Process merged object to yaml string
    const yamlString = yaml.dump(processed, {});

    // Write yaml back to file
    try{
        await writeFile(opts.envfile, yamlString);
    }catch(ex){
        error = 'Failure to save the file';
    }

    return {
        data: processed,
        error
    };
};

module.exports = {
    envz,
    save
};
