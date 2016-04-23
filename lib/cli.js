(function () {
    var optimist = require('optimist');

    var toichi = require(__dirname + '/toichi');

    var argv = optimist
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

    toichi({
        files: argv._,
        dest: argv.out,
        column: isNaN(argv.column) ? 1 : argv.column,
        interval: argv.interval
    }, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        console.log('[done]');
        console.log('image count: %s', result.count);
        console.log('output file: %s', result.outputFile);
    });
})();
