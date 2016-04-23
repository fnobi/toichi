var path = require('path');
var extend = require('util')._extend;

var im = require('imagemagick');
var async = require('async');
var del = require('del');

var extractExt = require(__dirname + '/extractExt');
var commonPart = require(__dirname + '/commonPart');

var toichi = function (opts, callback) {
    opts = opts || {};
    callback = callback || function () {};


    // check files
    var files = opts.files || [];
    if (files.length < 2) {
        callback(new Error('give 2 files at least'));
        return;
    }


    // fetch files parts
    var ext = extractExt(files);
    var common = commonPart(files);
    common = common.replace(/(\.|_|-)+$/, '');


    // check interval
    var interval = opts.interval || 0;
    if (interval) {
        ext = '.gif';
    }


    // dest file
    var dest = opts.dest || common;
    var destExt = path.extname(dest);
    if (!destExt) {
        dest = dest + ext;
    }

    
    // check direction
    var direction = opts.direction || '-';
    

    // check column
    var columns = isNaN(opts.column) ? 1 : opts.column;

    if (columns > 1) {
        var tasks = [];
        var columnFiles = [];
        for (var i = 0; i < files.length / columns; i++) (function (index) {
            var rowDest = path.resolve(
                path.dirname(dest),
                ['row-' + index, path.basename(dest)].join('.')
            );
            
            var rowOpts = extend({}, opts);
            delete rowOpts.column;
            rowOpts.direction = '+';
            rowOpts.files = files.slice(index * columns, (index + 1) * columns);
            rowOpts.dest = rowDest;

            columnFiles.push(rowDest);
            tasks.push(function (cb) {
                toichi(rowOpts, cb);
            });
        })(i);

        async.parallel(tasks, function (err) {
            if (err) {
                throw err;
            }
            delete opts.column;
            opts.files = columnFiles;
            toichi(opts, function (err, result) {
                del(columnFiles);
                callback(err, result);
            });
        });
        
        return;
    }
    

    // start loop
    var img1 = files[0], img2 = files[1];
    var index = 1;

    var convert;
    if (interval) {
        convert = function (cb) {
            im.convert(['-delay', interval * 100, img1, img2, dest], cb);
        };
    } else {
        convert = function (cb) {
            im.convert([direction + 'append', img1, img2, dest], cb);
        };
    }

    (function loop () {
        convert(function (err) {
            if (err) {
                throw err;
            }

            index++;

            if (!files[index]) {
                return callback(null, {
                    count: index,
                    outputFile: dest
                });
            }

            img1 = dest;
            img2 = files[index];
            return setTimeout(loop);
        });
    })();
};

module.exports = toichi;
