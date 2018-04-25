var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FILETYPE = {
    "FILE":0,
    "FOLDER":1,
    "RETURN":2
}

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('File', new Schema({
    owner: { type: String, lowercase: true, trim: true },
    alias: String,
    hash: { type: Number },
    size: { type: Number },
    type: { type: Number },
    extension: { type: String, lowercase: true, trim: true },
    date: { type: Date },
}));

module.exports.FILETYPE = FILETYPE;
