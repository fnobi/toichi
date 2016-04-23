'use strict';

const path = require('path');
const _ = require('underscore');

module.exports = (files) => {
    const obj = {};
    files.forEach((file) => {
        obj[path.extname(file)] = true;
    });

    const extList = _.keys(obj);

    if (extList.length > 1) {
        throw new Error(`exts are intermingled. (${extList.join(', ')})`);
    }

    return extList.shift();
};
