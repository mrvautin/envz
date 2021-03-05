# envz

envz is a dead simple module for storing and managing your environment variables in a simple and easy to read yaml file.

```bash
# with npm
npm install envz

# or with Yarn
yarn add envz
```

## Usage

You should use `envz` as early on in the entry point of your app as possible. Eg: app.js or index.js file which loads your app. 

Rather than override `process.env` object, `envz` will return a new object to use throughout your app. 

```javascript
const envz = require('envz');
```

Create a `env.yaml` or any other named file and load the file

```javascript
const env = envz('env.yaml');
```

## env YAML file structure

The idea is that the `process.env` will be merged with loaded `yaml` file. 

`env` uses a cascading (sequential order) configuration method which sometimes is better understood looking at an example.

``` yaml
base:
  PORT: 1234
  config:
    default: test

development:
  PORT: 3000
  DATABASE: dev
  config:
    token: 12345
    secret: fwdsdgl

production:
  PORT: 80
  DATABASE: prod
  config:
    token: 67890
    key: puwndklf
    truthy: true
    allowed:
      - card
      - phone
```

The idea here is that the values in `base` are loaded, anything in `development` overrides that and finally `production` overrides that depending on the `NODE_ENV` set.

For example, when a `NODE_ENV` of `development` is set the following `env` object is returned:

```
PORT: 3000,
config: { 
    default: 'test', 
    token: 12345, 
    secret: 'fwdsdgl' 
},
DATABASE: 'dev'
...
```

Eg: Where the `PORT` of 3000 from `development` overrides the `base` setting of 1234. If the `NODE_ENV` is set to `production`, then the `PORT` will be set to 80.

The idea behind `base` (or whatever you want to call it) is that you don't need to redefine defaults over and over for each environment.

## Options

You can set an environment manually rather than using `NODE_ENV` by adding an `evironment` object. Eg:

``` javascript
const env = envz('env.yaml', { environment: 'production' });
```

By default the `process.env` values override what is set in the yaml file. You can override this so that the yaml file is king by adding the following flag:

``` javascript
const env = envz('env.yaml', { yamlFileOverride: true });
```