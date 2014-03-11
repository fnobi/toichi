var path = require('path');

var _ = require('underscore');

var extractExt = function (files) {
    var obj = {};
    files.forEach(function (file) {
        obj[path.extname(file)] = true;
    });

    var extList = _.keys(obj);

    if (extList.length > 1) {
        throw new Error('exts are intermingled. (' + extList.join(', ') + ')');
    }

    return extList.shift();
};

module.exports = extractExt;
