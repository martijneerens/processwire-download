const fs = require('fs');
const Download = require('download');
const async = require('async');
const Papa = require('papaparse');
const fetch = require('node-fetch');


const defaultOpts = {
    dataPath: 'data.json',
    mediaPath: './media/', // This is used for saving the file
    mediaBookPath: 'media/', // And this is used for replacing
    item: null, //tables to be fetched from the API
    baseUrl: '',
    apiUrl: '',
    skipExistingFiles: true,
    prettifyJson: false
};

class ProcesswireDownload {

    constructor(opts) {
        this.opts = Object.assign({}, defaultOpts, opts);
        this.data = {};
    }

    fileExists(filename, callback) {
        if (!this.opts.skipExistingFiles) {
            callback(false);
            return;
        }

        fs.stat(filename, (err, stat) => {
            if (err === null) {
                callback(true);
            } else if (err.code === 'ENOENT') {
                callback(false);
            } else {
                throw err;
            }
        });
    }

    downloadMedia() {
        let downloads = [];


        for (let media of this.data.files) {
            downloads.push((downloadCallback) => {
                this.fileExists(media.localpath, (pathExists) => {
                    if (pathExists) {
                        console.log(`Skipping ${media.filename}, exists`);
                        downloadCallback();
                    } else {
                        console.log(`Going to download ${media.url}`);

                        new Download().get(media.url).dest(this.opts.mediaPath).rename(media.filename).run(() => {
                            console.log(`Downloaded '${media.filename}'`);
                            downloadCallback();
                        });
                    }
                });
            });
        }

        return new Promise((resolve) => {
            console.log(`Going to download ${downloads.length} images`);
            async.parallel(downloads, resolve);
        });
    }

    stringifyJson(data) {
        if (this.opts.prettifyJson) {
            return JSON.stringify(data, null, 4);
        } else {
            return JSON.stringify(data);
        }
    }

    writeJson(json) {
        let itemJson = this.stringifyJson(json);
        for (let item of json.files) {
            itemJson = itemJson.replace(item.preview_url, item.localpath)
        }

        return new Promise((resolve, reject) => {
            fs.writeFile(this.opts.dataPath, itemJson, 'utf-8', (err, written) => {
                if (err) {
                    reject();
                } else {
                    console.log(`Written JSON file at ${this.opts.dataPath}`);
                    resolve();
                }
            });
        });
    }

    start() {
        fetch(this.opts.apiUrl + this.opts.item)
            .then(res => res.json())
            .then(json => this.allItemsProcessed(json));
    }

    allItemsProcessed(data) {
        console.log('all data done!');
        this.writeJson(data);

        this.data = data;
        this.downloadMedia()
            .then(this.opts.callback);

    }
};

module.exports = function (opts) {
    const pwdownload = new ProcesswireDownload (opts);
    pwdownload.start();
}