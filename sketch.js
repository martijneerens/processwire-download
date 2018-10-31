var dsdownload = require('./processwire-download');

dsdownload({
    dataPath: './data/data.json',
    mediaPath: './media/', // This is used for saving the file
    mediaBookPath: 'media/', // And this is used for replacing
    fieldbookCompatible: false,
    csvPath: false,
    skipExistingFiles: true,
    useImageObjects: true, //return full directus file object instead of the url as a string only
    baseUrl: 'http://pw.loc',
    apiUrl: 'http://pw.loc/api/longreads/',
    prettifyJson: true,
    depth: 10,
    limit: 1000,
    item:  'dalai-lama',
    callback: function () {
        console.log('this is ready');
    }
});