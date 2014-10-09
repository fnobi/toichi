var path = require('path');

var im = require('imagemagick');

var extractExt = require(__dirname + '/extractExt');
var commonPart = require(__dirname + '/commonPart');

var toichi = function (opts, callback) {
    opts = opts || {};
    callback = callback || function () {};


    // check files
    var files = opts.files || [];
    if (files.length < 2) {
        return callback(new Error('give 2 files at least'));
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

    // start loop
    var img1 = files[0], img2 = files[1];
    var index = 1;

    if (interval) {
        (function loop () {
            im.convert(['-delay', interval * 100, img1, img2, dest], function (err) {
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
    } else {
        (function loop () {
            im.convert(['-append', img1, img2, dest], function (err) {
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
    }
};

module.exports = toichi;
