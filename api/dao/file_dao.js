var File = require('../models/file');

function addFile(req, stats) {
    var file = new File({
        owner: req.decoded.name,
        alias: stats.alias,
        type: stats.type,
        hash: stats.hash,
        extension: stats.ext || null,
        size: stats.size || null,
        date: new Date()
    });

    file.save(function(err) {
        if (err) {
            throw err;
        }

        console.log("db: File added")
    });
};

function readFile(req, hash, callback) {
    console.log(hash)
    File.findOne({hash: hash, owner: req.decoded.name}, function(err, result) {
        if(err) throw err

        callback(result);
    });
}

function dropFile(req, hashes, callback) {
    var i = 0

    hashes.forEach(hash => {
        File.findOneAndRemove({hash: hash, owner: req.decoded.name}, function(err) {

        }).then((obj) => {
            console.log('db: Removed -' + hash);
            i++
            if(i >= hashes.length) {
                callback()
            }
        })
        .catch((err) => {
            console.log('db: Error: ' + err);
            callback(err)
        });
    })
}

function renameFile(req, hash, newName) {
    File.findOne({hash: hash, owner: req.decoded.name}, function(err, result) {
        if(result.extension != null) newName = newName + result.extension
        
        File.updateOne({hash: hash, owner: req.decoded.name}, {$set: {"alias": newName}}, function(err) {
            if(err) throw err;
        }).then((obj) => {
            console.log('db: Updated - ' + obj.name);
        })
        .catch((err) => {
            console.log('db: Error: ' + err);
        });
    });
}


module.exports.readFile = readFile;
module.exports.addFile = addFile;
module.exports.dropFile = dropFile;
module.exports.renameFile = renameFile;
