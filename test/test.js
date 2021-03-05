const envz = require('../lib/envz');

const {
    serial: test
} = require('ava');

test('Without NODE_ENV set, defaults to "development"', async t => {
    // Need to delete is as Ava defaults to 'test'
    delete process.env.NODE_ENV;
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
