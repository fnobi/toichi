'use strict';

const path = require('path');
const extend = require('util')._extend;
const EventEmitter = require('events').EventEmitter;

const im = require('imagemagick');
const async = require('async');
const del = require('del');

const extractExt = require(__dirname + '/extractExt');
const commonPart = require(__dirname + '/commonPart');

class Toichi extends EventEmitter {
    constructor (opts) {
        super();
        this.opts = opts || {};
    }

    start () {
        this.concat(this.opts, (result) => {
            this.emit('end', result);
        });
    }

    concat (opts, done) {
        opts = opts || {};
        done = done || new Function();


        // check files
        const files = opts.files || [];
        if (files.length < 2) {
            this.emit('error', new Error('give 2 files at least'));
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


        const result = {
            count: files.length,
            outputFile: dest
        };
        

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
                tasks.push((cb) => {
                    this.concat(rowOpts, (result) => {
                        cb();
                    });
                });
            })(i);

            async.parallel(tasks, (err) => {
                if (err) {
                    this.emit('error', err);
                }
                delete opts.column;
                opts.files = columnFiles;
                this.concat(opts, () => {
                    del(columnFiles);
                    done(result);
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

        const loop = () => {
            convert((err) => {
                if (err) {
                    throw err;
                }
                
                if (img1 !== dest) {
                    this.emit('file', {
                        index: 0,
                        all: result.count,
                        path: img1,
                        dest: dest
                    });
                }
                this.emit('file', {
                    index: index,
                    all: result.count,
                    path: img2,
                    dest: dest
                });

                index++;

                if (!files[index]) {
                    done(result);
                    return;
                }

                img1 = dest;
                img2 = files[index];
                
                setImmediate(loop);
            });
        };
        
        setImmediate(loop);
    }
};

module.exports = Toichi;
