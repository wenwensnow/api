module.exports = (app) => {

    var fs = require('fs-extra'),
        verifyToken = require('../middlewares/verify_token'),
        util = require('util'),
        config = require('../../config/config'),
        fileDao = require('../dao/file_dao'),
        File = require('../models/file'),
        path = require('path'),
        klawSync = require('klaw-sync'),
        serialization = require('../middlewares/serialization')

    //Get files list from folder
    app.get('/api/data/files/get', verifyToken, (req, res) => {

        var pathData = serialization.serializeParams(req);
        var data = new Array()
        var fileList = new Array()
        var folderList = new Array()

        /* User trying to access his root folder, but it doesn't exists */
        if (!fs.existsSync(pathData.storagePath)) {
            if(pathData.root) {
                fs.mkdirSync(pathData.storagePath);
            } else {
                return res.status(403).send({message: 'Wrong path' })
            }
        }

        fs.readdir(pathData.storagePath, (err, files) => {

            if(err) return res.status(403).send({message: 'Wrong path'})

            if(files.length == 0)
                res.json({ data: [] });

            var index = 0
            files.forEach(file => {

                fileDao.readFile(req, file, (fileData) => {
                    index++

                    var serializedData = serialization.serializeFileData(fileData, pathData, file)

                    if(fileData.type == File.FILETYPE.FOLDER)
                        folderList.push(serializedData)
                    if(fileData.type == File.FILETYPE.FILE)
                        fileList.push(serializedData)

                    if(index >= files.length) {
                        data = data.concat(folderList.concat(fileList))
                        res.json({ data: data });
                    }
                });
            })
        })
    })

    //Create directory from path with name
    app.get('/api/data/files/create_folder', verifyToken, (req, res) => {

        var pathData = serialization.serializeParams(req)
        var hashCode = serialization.randomHashString();

        req.query.foldername = decodeURI(req.query.foldername)
        req.query.foldername = req.query.foldername.trim()

        /* Verify if foldername value exists */
        if(req.query.foldername == null || req.query.foldername == "") {
            return res.status(403).send({message: 'Incorrect folder name'})
        }

        /* Validate the folder name */
        var pattern = new RegExp('^[^\\/?%*:|"<>\.]+$')
        var validate = pattern.test(req.query.foldername)

        if(!validate) {
            return res.status(403).send({
                success: false,
                message: 'Incorrect folder name'
            })
        }

        /* Adding our folder in the database */
        //var stats = fs.statSync(pathData.storagePath + '/' + req.query.foldername);
        var stats = []
        stats["alias"] = req.query.foldername
        stats["hash"] = hashCode
        stats["type"] = File.FILETYPE.FOLDER
        fileDao.addFile(req, stats)

        fs.mkdirSync(pathData.storagePath + '/' + hashCode);

        return res.status(403).send({message: 'Folder created at ' + req.query.path})
    })

    /* Delete a file or a folder */
    app.get('/api/data/files/delete', verifyToken, (req, res) => {

        var pathData = serialization.serializeParams(req)

        if(pathData.root) return res.status(403).send({message: "Can't delete this file"})

        /* Detect if the destination is a folder */
        /* Prepare the list of the files and folders to delete */
        var stats = fs.statSync(pathData.storagePath)
        var hashes = []
        hashes.push(path.basename(pathData.storagePath))

        if(stats.isDirectory()) {
            const paths = klawSync(pathData.storagePath)
            paths.forEach(p => {
                hashes.push(path.basename(p.path))
            })
        }

        /* Delete all the file(s)/folder(s) from the database */
        fileDao.dropFile(req, hashes, (err) => {

            if(err) return res.status(403).send({ message: "Can't delete this file/folder"})

            /* Delete the file(s)/folder(s) from the storage */
            fs.remove(pathData.storagePath, function (error) {
                 if(error) return res.status(403).send({ message: "Can't delete this file/folder"})

                 return res.status(200).send({message: 'File deleted at ' + pathData.localPath})
            });
        });
    })

    app.get('/api/data/files/rename', verifyToken, (req, res) => {

        var pathData = serialization.serializeParams(req)

        /* Verify if newname key and value exists */
        if(req.query.newname == null || req.query.newname == "") {
            return res.status(403).send({message: 'Incorrect new name'})
        }

        req.query.newname = decodeURI(req.query.newname)
        req.query.newname = req.query.newname.trim()

        /* Detecting the default 'file/folder' exists */
        if (!fs.existsSync(pathData.storagePath)) {
            return res.status(403).send({message: 'File/folder doesnt exist' })
        }

        /* Regexe the file/folder name according to default rules */
        var pattern = new RegExp('^[^\\/?%*:|"<>\.]+$')
        if(!pattern.test(path.basename(req.query.newname))) {
            return res.status(403).send({message: 'Incorrect new name'})
        }

        /* Getting the file informations from the database */
        fileDao.readFile(req, path.basename(pathData.storagePath), (data) => {
            if(data == null) return res.status(403).send({message: 'File/folder doesnt exist in database' })

            /* Editind the file name in database */
            fileDao.renameFile(req, path.basename(pathData.storagePath), path.basename(req.query.newname))

            return res.status(200).send({message: 'Folder/File succesfully renamed'})

        });

    })
}
