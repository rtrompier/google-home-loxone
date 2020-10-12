import { homedir } from 'os';
import yargs from "yargs";
import { Server } from './server';

const argv = yargs.options({
    verbose: {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging'
    },
    port: {
        alias: 'p',
        type: 'number',
        default: 3000,
        description: 'Http server port'
    },
    jwt: {
        alias: 'j',
        type: 'string',
        default: homedir + '/.google-home-loxone/jwt.json',
        description: 'JWT file path'
    },
    config: {
        alias: 'c',
        type: 'string',
        default: homedir + '/.google-home-loxone/config.json',
        description: 'Config file path'
    }
}).argv;

new Server(argv);
