const { envz, save } = require('../lib/envz');
const fs = require('fs');
let defaultYaml = '';

const {
    serial: test
} = require('ava');

test('When file doesnt exist', async t => {
    await t.throwsAsync(async () => {
        envz('file-doesnt-exist.yaml');
    }, { instanceOf: Error, message: 'Env yaml file does not exist' });
});

test('Without NODE_ENV set, defaults to "development"', async t => {
    const env = envz('env.yaml');

    t.is(env.env, 'development');
});

test('NODE_ENV is respected', async t => {
    // Set env
    process.env.NODE_ENV = 'production';
    const env = envz('env.yaml');

    t.is(env.env, 'production');
});

test('Check stops cascading', async t => {
    // Set env
    process.env.NODE_ENV = 'development';
    const env = envz('env.yaml');

    t.is(env.env, 'development');
    t.is(env.DATABASE, 'dev');
});

test('Check read successfully cascades and respects production', async t => {
    // Set env
    process.env.NODE_ENV = 'production';
    const env = envz('env.yaml');

    t.is(env.env, 'production');
    t.is(env.DATABASE, 'prod');
});

test('Check value ONLY set in development cascades to production', async t => {
    // Set env
    process.env.NODE_ENV = 'production';
    const env = envz('env.yaml');

    t.is(env.env, 'production');
    t.is(env.config.secret, 'fwdsdgl');
});

test('Check value ONLY set in production not set when in development', async t => {
    // Set env
    process.env.NODE_ENV = 'development';
    const env = envz('env.yaml');

    t.is(env.env, 'development');
    t.not(env.config.key, 'puwndklf');
});

test('Check base value cascades no matter the environment set (development)', async t => {
    // Set env
    process.env.NODE_ENV = 'development';
    const env = envz('env.yaml');

    t.is(env.env, 'development');
    t.is(env.config.default, 'test');
});

test('Check base value cascades no matter the environment set (production)', async t => {
    // Set env
    process.env.NODE_ENV = 'production';
    const env = envz('env.yaml');

    t.is(env.env, 'production');
    t.is(env.config.default, 'test');
});

test('Check truthy values - Boolean', async t => {
    // Set env
    process.env.NODE_ENV = 'production';
    const env = envz('env.yaml');

    t.is(env.env, 'production');
    t.is(typeof env.config.truthy, 'boolean');
    t.true(env.config.truthy);
});

test('Check truthy values - Numeric', async t => {
    // Set env
    process.env.NODE_ENV = 'production';
    const env = envz('env.yaml');

    t.is(env.env, 'production');
    t.is(typeof env.config.token, 'number');
});

test('Check truthy values - Object', async t => {
    // Set env
    process.env.NODE_ENV = 'production';
    const env = envz('env.yaml');

    t.is(env.env, 'production');
    t.is(typeof env.config, 'object');
});

test('Check truthy values - Array', async t => {
    // Set env
    process.env.NODE_ENV = 'production';
    const env = envz('env.yaml');

    t.is(env.env, 'production');
    t.true(Array.isArray(env.config.allowed));
});

test('Check truthy values - String', async t => {
    // Set env
    process.env.NODE_ENV = 'production';
    const env = envz('env.yaml');

    t.is(env.env, 'production');
    t.is(typeof env.config.key, 'string');
});

test('Dont pass in a file', async t => {
    // Set env
    process.env.NODE_ENV = 'production';
    const env = envz();

    t.is(env.env, 'production');
    t.true(Array.isArray(env.config.allowed));
});

test('Pass in the env manually', async t => {
    // Set env
    const env = envz('env.yaml', { environment: 'production' });

    t.is(env.env, 'production');
});

test('Shift the config one level to remove unwanted', async t => {
    // Set env
    process.env.NODE_ENV = 'production';
    const env = envz('env.yaml').config;

    t.is(env.token, 67890);
});

test('Manual environment variables overriding env files', async t => {
    // Set env
    process.env.PORT = 9999999;
    const env = envz('env.yaml');

    t.is(env.PORT, '9999999');
});

test('"yamlFileOverride" allows for environment variables to override .yaml files', async t => {
    // Set env
    process.env.PORT = 9999999;
    const env = envz('env.yaml', { yamlFileOverride: true });

    t.is(env.PORT, 80);
});

test('"yamlFileOverride" false makes .yaml files override environment variables', async t => {
    // Set env
    process.env.PORT = 9999999;
    const env = envz('env.yaml', { yamlFileOverride: false });

    t.is(env.PORT, '9999999');
});

test('Update env object and save', async t => {
    const updateObj = {
        base: {
            config: {
                default: 'fdfdfdfd'
            }
        }
    };
    const saveObj = await save({
        envfile: 'env.yaml',
        data: updateObj
    });

    t.is(saveObj.error, '');
    t.is(saveObj.data.base.config.default, updateObj.base.config.default);
});

test('Try save a file which doesnt exist', async t => {
    await t.throwsAsync(async () => {
        await save({
            envfile: 'file-doesnt-exist.yaml',
            data: {}
        });
    }, { instanceOf: Error, message: 'Env yaml file does not exist' });
});

test('Update env object and save, re-read yaml file & check updated', async t => {
    // Set port back null
    delete process.env.PORT;

    // Update PORT object
    const updateObj = {
        production: {
            PORT: 8080,
            config: {
                key: 'test-token'
            }
        }
    };

    // Save config file
    const saveObj = await save({
        envfile: 'env.yaml',
        data: updateObj
    });

    // Read back config file
    const env = envz('env.yaml', { environment: 'production' });

    // Check port is updated
    t.is(saveObj.error, '');
    t.is(saveObj.data.production.PORT, env.PORT);
    t.is(saveObj.data.production.config.key, env.config.key);
});

// This will always run, regardless of earlier failures
test.afterEach(() => {
    delete process.env.PORT;
    delete process.env.config;

    // Revert the test file to original
    fs.writeFileSync('env.yaml', defaultYaml);
});

// Removing ENV and Ava adds TEST
test.beforeEach(() => {
    delete process.env.NODE_ENV;
});

// Before all, read the env file
test.before(() => {
    defaultYaml = fs.readFileSync('env.yaml', 'utf-8');
});
