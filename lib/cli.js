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

            .argv;

    if (argv.h) {
        optimist.showHelp();
        return;
    }

    toichi({
        files: argv._,
        dest: argv.out
    }, function (err, destFile) {
        if (err) {
            console.error(err);
            return;
        }
        console.log('done. [%s]', destFile);
    });
})();
