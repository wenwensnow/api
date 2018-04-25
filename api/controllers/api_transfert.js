module.exports = (app) => {

    var multer = require('multer'),
        fs = require('fs-extra'),
        verifyToken = require('../middlewares/verify_token'),
        fileDao = require('../dao/file_dao'),
        path = require('path'),
        config = require('../../config/config'),
        File = require('../models/file'),
        serialization = require('../middlewares/serialization')

    /* MULTER CONFIGURATION */
    var store = multer.diskStorage({
        destination: function(req, file, cb){
            cb(null, config.storage_root_folder)
        },
        filename: function(req, file, cb){
            cb(null,file.originalname)
        }
    })
    var upload = multer({storage:store}).single('fileToUpload')

    /* CHECKS IF FILE EXISTS, THEN RENAME IT */
    function updatePath(newPath, filename) {

        var fileExtension = path.extname(filename)
        var nameWithoutExtension = path.basename(filename, path.extname(filename))
        var validate = false;
        var index = 0;

        if (fs.existsSync(newPath)) {
            while(!validate) {
                index++;

                newPath = newPath.substr(0, newPath.lastIndexOf("\/"))
                newPath += '/' + nameWithoutExtension + ' (' + index + ')' + fileExtension;

                if (!fs.existsSync(newPath)) {
                    validate = true;
                }

                console.log(newPath)
            }
        }

        return newPath
    }

    app.post('/upload-file', verifyToken, (req, res) => {

        var fileHash = serialization.randomHashString()

        upload(req,res, (err) => {
            if(err){
                return res.status(501).json({message:err})
            }

            if(req.file == null || req.file.destination == null || req.file.filename == null)
                return res.status(403).json({message:'Cant upload this file'})

            var tempPath = req.file.destination + req.file.filename
            var destinationPath = config.storage_root_folder + '/' + req.decoded.name + '/' + req.body.path  + '/' + fileHash;
            //destinationPath = updatePath(destinationPath, req.file.filename)

            /* Adding our file in the database */
            var stats = fs.statSync(tempPath);
            stats["alias"] = path.basename(tempPath)
            stats["ext"] = path.extname(tempPath)
            stats["hash"] = fileHash
            stats["type"] = File.FILETYPE.FILE

            //destinationPath = updatePath(destinationPath, req.file.filename)

            fs.move(tempPath, destinationPath, (err) => {
                if(err) {
                    return res.status(403).send({message: "Can't upload this file"})
                }

                fileDao.addFile(req, stats)

                return res.status(200).send({message: 'File uploaded succesfully'})

            });

        })
    })
}
