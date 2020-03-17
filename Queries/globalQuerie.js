const File = require('../models/file.model');
const Folder = require('../models/folder.model');
const base64 = require('file-base64');
const path = require('path');
const Dir = path.join(__dirname, '../BigData');
const fs = require('fs');
exports.globalQueries = class {
    static setFile(data) {
        return new Promise(async next => {
            let folder;
            folder = await Folder.findOne({
                _id: data.folder_id
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


    static getUnderFolderId(data) {
        let donne = {};
        if (!data.includes('/')) {
            donne.parent = "root";
            donne.enfant = data;
        } else {
            const tab = data.split('/');
            donne.parent = tab[tab.length - 2];
            donne.enfant = tab[tab.length - 1];
        }
        return new Promise(async next => {
            const folderRoot = await Folder.findOne({
                name: donne.parent
            }).populate('files').then(r => {
                r.files.forEach(file => {
                    if (file.name === donne.enfant) {
                        next(file.folder_id);
                    }
                })
            }).catch(err => {
                next(err);
            })
        });

    }


    static setUnderFolder(data) {
        return new Promise(async next => {
            const folder = await Folder.findOne({
                name: data.foldername
            }).then(r => r);
            const folder2 = await new Folder({
                name: data.folder
            });
            folder2.save().then(r => {
                const file = new File({
                    name: data.folder,
                    type: "folder",
                    folder_id: r._id
                });
                file.save();
                folder.files.push(file);
                folder.save().then(async r => {
                    await Folder.findOne({
                        name: r.name
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
            });
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


    static getFolderById(id) {
        return new Promise(async next => {
            await Folder.findById(id).populate('files').then(r => {
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

    static getFolderId(name) {
        return new Promise(async next => {
            await Folder.findOne({
                name: name
            }).populate('files').then(async r => {
                if (r === null) {
                    await new Folder({
                        name: name
                    }).save().then(re => {
                        next(re._id);
                    })
                } else {
                    next(r._id);
                }
            }).catch(err => {
                next({
                    etat: false,
                    err: err
                });
            });
        })
    }

    static setSharedFolder(data) {
        return new Promise(async next => {
            const file = await File.findById(data.id_file).then(r => r);
            file.shared = true;
            if (file.type === "folder") {
                file.save();
                const folder = await Folder.findById(file.folder_id).then(r => r);
                folder.shared = true,
                    folder.sharedOptions.push({
                        crypt_link: data.crypt_link,
                        privileges: data.privilege,
                        password: data.password,
                        expirationDate: data.date,
                        message: data.message
                    });
                folder.save().then(r => {
                    next({
                        etat: true,
                        data: r
                    })
                }).catch(err => {
                    next({
                        etat: false,
                        err: err,
                    })
                });
            } else {
                file.sharedOptions.push({
                    crypt_link: data.crypt_link,
                    privileges: data.privilege,
                    password: data.password,
                    expirationDate: data.date,
                    message: data.message
                });
                file.save().then(r => {
                    next({
                        etat: true,
                        data: r
                    });
                }).catch(err => {
                    next({
                        etat: false,
                        err: err
                    })
                });
            }
        });
    }

    static getFileInfo(id) {
        return new Promise(async next => {
            await File.findById(id).then(async r => {
                if (r.type === "file") {
                    next({
                        etat: true,
                        type: "file",
                        data: r
                    });
                } else if (r.type === "folder") {
                    await Folder.findById(r.folder_id).then(s => {
                        next({
                            etat: true,
                            data: s,
                            type: "folder",
                            size: await getAllFolderSize(r.name).then(r => r)
                        })
                    });

                }
            }).catch(err => {
                next({
                    etat: false,
                    err: err
                });
            })
        })
    }

    static ResultFiles(data) {
        return new Promise(async next => {
            const output = [];
            if (data.files.length == 0) {
                next({
                    etat: true,
                    result: output
                });
            } else {
                data.files.forEach(async (file, index) => {
                    if (file.type === "file" && file.mimetype !== "mp4") {
                        await fs.writeFileSync(path.join(Dir, file.name + '.' + file.mimetype), file.buffer, function (err) {
                            if (err) throw err;
                            console.log('err', err);
                            console.log('writing file succesfuly');
                        })
                    }
                    const obj = {};
                    obj._id = file._id;
                    obj.name = file.type === "file" ? file.name + '.' + file.mimetype : file.name;
                    obj.size = file.type === 'file' ? file.size : await getAllFolderSize(file.name).then(r => r);
                    obj.shared = file.shared;
                    obj.sharedOptions = file.sharedOptions;
                    obj.date = file.date_creation;
                    if (file.type === "folder") obj.folder_id = file.folder_id;
                    output.push(obj);
                    console.log('outut', output);
                    if (index === data.files.length - 1) {
                        next({
                            etat: true,
                            result: output
                        });
                    }
                });
            }
        })
    }
}

async function getAllFolderSize(data) {
    const folder = await Folder.findOne({
        name: data
    }).populate('files').then(res => res);
    let size = 0;
    folder.files.forEach(async file => {
        if (file.type === "folder") {
            size += await getAllFolderSize(file.name).then(r => r);
        } else {
            size += file.size;
        }
    });
    return size;
}