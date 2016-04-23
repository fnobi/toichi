'use strict';

(() => {
    const optimist = require('optimist');
    const colors = require('colors');

    const Toichi = require(__dirname + '/Toichi');

    const argv = optimist
            .boolean('h')
            .alias('h', 'help')
            .default('h', false)
            .describe('h', 'show this help.')

            .string('o')
            .alias('o', 'out')
            .describe('o', 'output file name.')

            .string('i')
            .alias('i', 'interval')
            .describe('i', 'gif animation interval.')

            .string('c')
            .alias('c', 'column')
            .default('c', '1')
            .describe('c', 'sprite columns')

            .argv;

    if (argv.h) {
        optimist.showHelp();
        return;
    }

    const toichi = new Toichi({
        files: argv._,
        dest: argv.out,
        column: isNaN(argv.column) ? 1 : argv.column,
        interval: argv.interval
    });

    toichi.on('error', (err) => {
        console.error(err);
    });

    toichi.on('file', (file) => {
        console.log(
            '[file]'.green,
            `(${file.index + 1} / ${file.all})`,
            `${file.path} -> ${file.dest}`
        );
    });

    toichi.on('end', (result) => {
        console.log(
            '[done]'.green,
            `${result.outputFile} (${result.count} files)`
        );
    });

    toichi.start();
})();
