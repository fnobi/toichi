'use strict';

module.exports = (files) => {
    const common = files[0];
    let length = common.length;
    files.forEach((file) => {
        while (file.substr(0, length) != common.substr(0, length) && length > 0) {
            length--;
        }
    });

    return common.substr(0, length);
};
