import * as yargs from 'yargs'

yargs
    .commandDir('commands')
    .demand(1)
    .help()
    .argv
