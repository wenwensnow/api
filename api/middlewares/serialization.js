var config = require('../../config/config'),
    File = require('../models/file')

function serializeParams(req) {

    var storagePath = config.storage_root_folder + (req.params.user || req.decoded.name) + '/'
    var url = './data/browser/'
    var root = (req.query.path == null || req.query.path=='')

    var decodedPath = decodeURI(req.query.path)
    var localPath = "" , parentFolder = ""
    var fileType = File.FILETYPE.FILE

    if(!root) {
        localPath = decodedPath
        url += decodedPath
        storagePath += decodedPath
        parentFolder = storagePath.substr(0, storagePath.lastIndexOf("\/"))
    }

    //pathData.localPath = pathData.localPath.replace(/([^:]\/)\/+/g, "$1");

    var pathData = {root: root, storagePath: storagePath, url: url, localPath: localPath, parentFolder: parentFolder}

    return pathData
}

function serializeFileData(fileData, pathData, file) {

    var sd = {
        alias: fileData.alias,
        hash: fileData.hash,
        type: fileData.type,
        date: fileData.date,
        size: fileData.size || 0,
        extension: fileData.extension || null,
        url: pathData.url + '/' + file,
        path: pathData.localPath + '/' + file
    }

    sd.url = sd.url.replace(/([^:]\/)\/+/g, "$1");
    sd.path = sd.path.replace(/([^:]\/)\/+/g, "$1");
    if(sd.url.charAt(0) == '/') sd.url = sd.url.substr(1);
    if(sd.path.charAt(0) == '/') sd.path = sd.path.substr(1);

    return sd;
}

function randomHashString() {
    return Math.random().toString(36).substring(7).hashCode()
}

String.prototype.hashCode = function() {
    var hash = this.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)
    return Math.abs(hash);
};

module.exports.serializeFileData = serializeFileData;
module.exports.serializeParams = serializeParams;
module.exports.randomHashString = randomHashString;
