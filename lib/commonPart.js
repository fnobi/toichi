var commonPart = function (files) {
    var common = files[0];
    var length = common.length;
    files.forEach(function (file) {
        while (file.substr(0, length) != common.substr(0, length) && length > 0) {
            length--;
        }
    });

    return common.substr(0, length);
};

module.exports = commonPart;
