const File = require('../models/file.model');
const Folder = require('../models/folder.model');
const base64 = require('file-base64');
const path = require('path');
const Dir = path.join(__dirname, '../STORAGE');
exports.globalQueries = class {
    static setFile(data) {
        return new Promise(async next => {
            let folder;
            folder = await Folder.findOne({
                name: data.foldername
            }).then(r => r);
            if (folder === null) {
                folder = await new Folder({
                    name: data.foldername
                }).save();
            }
            const file = await new File({
                name: data.name,
                buffer: data.buffer,
                mimetype: data.mimetype,
                type: data.type,
                size: data.size
            });
            file.save();
            folder.files.push(file);
            folder.save();
            await Folder.findOne({
                name: data.foldername
            }).populate('files').then(r => {
                next({
                    etat: true,
                    data: r
                });
            }).catch(e => {
                next({
                    etat: false,
                    err: e
                });
            })
        })
    }

    static setUnderFolder(data) {
        return new Promise(async next => {
            const folder = await Folder.findOne({
                name: data.foldername
            }).then(r => r);
            const file = new File({
                name: data.folder,
                type: "folder"
            });
            file.save();
            const folder2 = await new Folder({
                name: data.folder
            });
            folder2.save();
            folder.files.push(file);
            folder.save()
            await Folder.findOne({
                name: data.foldername
            }).populate('files').then(r => {
                next({
                    etat: true,
                    data: r
                });
            }).catch(e => {
                next({
                    etat: false,
                    err: e
                });
            })
        })
    }

    static setFolder(name) {
        return new Promise(async next => {
            const folder = await new Folder({
                name: name
            });
            folder.save().then(r => {
                next({
                    etat: true,
                    data: r
                });
            }).catch(e => {
                next({
                    etat: false,
                    err: e
                });
            })
        })
    }


    static removeFile(data) {
        return new Promise(async next => {
            await Folder.findOne({
                name: data.foldername
            }, {
                $pull: {
                    files: data.fileid
                }
            }).then(r => {
                next({
                    etat: true,
                    data: r
                });
            }).catch(err => {
                next({
                    etat: false,
                    err: err
                });
            });
        })
    }


    static removeFolder(name) {
        return new Promise(async next => {
            await Folder.findOneAndRemove({
                name: name
            }).then(r => {
                next({
                    etat: true,
                    data: r
                });
            }).catch(err => {
                next({
                    etat: false,
                    err: err
                });
            });
        })
    }


    static getFolder(name) {
        return new Promise(async next => {
            await Folder.findOne({
                name: name
            }).populate('files').then(r => {
                next({
                    etat: true,
                    data: r
                });
            }).catch(err => {
                next({
                    etat: false,
                    err: err
                });
            });
        })
    }



    static ResultFiles(data) {
        return new Promise(async next => {
            const output = [];
            await data.files.forEach(file => {
                if (file.type === "file") {
                    base64.decode(file.buffer, path.join(Dir, file.name + '.' + file.mimetype), function (err, data) {
                        console.log('success');
                    })
                }
                const obj = {};
                obj.name = file.type === "file" ? file.name + '.' + file.mimetype : file.name;
                obj.size = file.type === "file" ? file.size : getAllFolderSize(file.name).then(r => r);
                obj.date = file.date_creation;
                output.push(obj);
            });
            next({
                etat: true,
                result: output
            });
        })
    }
}

async function getAllFolderSize(data) {
    return new Promise(async next => {
        const folder = await Folder.findOne({
            name: data
        }).populate('files').then(res => res);
        console.log('folder', folder);
        let size = 0;
        folder.files.forEach(file => {
            size += file.size;
        });
        next(size);
    })

}