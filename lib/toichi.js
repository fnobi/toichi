var path = require('path');

var im = require('imagemagick');

var extractExt = require(__dirname + '/extractExt');

var toichi = function (opts, callback) {
    opts = opts || {};
    callback = callback || function () {};

    var files = opts.files || [];
    var dest = opts.dest || 'toichi';

    if (files.length < 2) {
        return callback(new Error('give 2 files at least'));
    }

    var ext = extractExt(files);

    var destFile = path.basename(dest, path.extname(dest)) + ext;

    var img1 = files[0], img2 = files[1];
    var index = 1;
    (function loop () {
        im.convert(['-append', img1, img2, destFile], function () {
            index++;

            if (!files[index]) {
                return callback(null, destFile);
            }

            img1 = destFile;
            img2 = files[index];
            setTimeout(loop);
        });
    })();
};

module.exports = toichi;
