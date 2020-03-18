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
            folder.size += file.size
            folder.files.push(file);
            folder.save();
            await Folder.findOne({
                _id: data.folder_id
            }).then(async r => {
                await File.findOne({
                    folder_id: r._id
                }).then(s => {
                    console.log('sss', s);
                    if (s !== null) {
                        s.size = r.size;
                        s.save();
                    }
                });
                next({
                    etat: true,
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
                        next({
                            etat: true,
                            data: file.folder_id
                        });
                    }
                })
            }).catch(err => {
                next({
                    etat: false,
                    err: err
                });
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
                        next({
                            etat: true,
                            data: re._id
                        });
                    })
                } else {
                    next({
                        etat: true,
                        data: r._id
                    });
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
                } else {
                    next({
                        etat: true,
                        type: "folder",
                        data: r,
                        size: r.size + await getAllFolderSize(r.name).then(r => r)
                    })
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
                    console.log('file', file);
                    let r = file.type === 'file' ? file.size : 20;
                    if (file.type === "file" && file.mimetype !== "mp4") {
                        fs.writeFileSync(path.join(Dir, file.name + '.' + file.mimetype), file.buffer, function (err) {
                            if (err) throw err;
                            console.log('writing file succesfuly');
                        })
                    }
                    const obj = {};
                    if (file.type === "file") {
                        obj._id = file._id;
                        obj.name = file.name + '.' + file.mimetype;
                        obj.size = r;
                        obj.shared = file.shared;
                        obj.sharedOptions = file.sharedOptions;
                        obj.date = file.date_creation;
                    } else {
                        obj._id = file._id;
                        obj.name = file.name;
                        obj.size = file.size + r;
                        obj.shared = file.shared;
                        obj.sharedOptions = file.sharedOptions;
                        obj.date = file.date_creation;
                        obj.folder_id = file.folder_id;
                    }
                    output.push(obj);
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
    let size = 0;
    await Folder.findOne({
        name: data
    }).populate('files').then(s => {
        s.files.forEach(file => {
            if (file.type === "folder") {
                size += file.size
            }
        })
    });
    return size;
}