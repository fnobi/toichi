'use strict';

const path = require('path');
const extend = require('util')._extend;

const im = require('imagemagick');
const async = require('async');
const del = require('del');

const extractExt = require(__dirname + '/extractExt');
const commonPart = require(__dirname + '/commonPart');

const toichi = (opts, callback) => {
    opts = opts || {};
    callback = callback || new Function();


    // check files
    const files = opts.files || [];
    if (files.length < 2) {
        callback(new Error('give 2 files at least'));
        return;
    }


    // check interval
    const interval = opts.interval || 0;


    // fetch files parts
    const ext = interval ? '.gif' : extractExt(files);
    const common = commonPart(files).replace(/(\.|_|-)+$/, '');


    // dest file
    const dest = opts.dest || common;
    const destExt = path.extname(dest);
    if (!destExt) {
        dest = dest + ext;
    }

    
    // check direction
    const direction = opts.direction || '-';
    

    // check column
    const columns = isNaN(opts.column) ? 1 : opts.column;

    if (columns > 1) {
        const tasks = [];
        const columnFiles = [];
        for (let i = 0; i < files.length / columns; i++) ((index) => {
            const rowDest = path.resolve(
                path.dirname(dest),
                ['row-' + index, path.basename(dest)].join('.')
            );
            
            const rowOpts = extend({}, opts);
            delete rowOpts.column;
            rowOpts.direction = '+';
            rowOpts.files = files.slice(index * columns, (index + 1) * columns);
            rowOpts.dest = rowDest;

            columnFiles.push(rowDest);
            tasks.push(function (cb) {
                toichi(rowOpts, cb);
            });
        })(i);

        async.parallel(tasks, (err) => {
            if (err) {
                throw err;
            }
            delete opts.column;
            opts.files = columnFiles;
            toichi(opts, (err, result) => {
                del(columnFiles);
                callback(err, result);
            });
        });
        
        return;
    }
    

    // start loop
    let img1 = files[0], img2 = files[1];
    let index = 1;

    let convert;
    if (interval) {
        convert = (cb) => {
            im.convert(['-delay', interval * 100, img1, img2, dest], cb);
        };
    } else {
        convert = (cb) => {
            im.convert([direction + 'append', img1, img2, dest], cb);
        };
    }

    (function loop () {
        convert((err) => {
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
