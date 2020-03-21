const File = require('../models/file.model');
const Folder = require('../models/folder.model');
const Admin = require('../models/admin.model');
const path = require('path');
const Dir = path.join(__dirname, '../BigData');
const fs = require('fs');
const rimraf = require('rimraf');
exports.globalQueries = class {
    static getAdmin(data) {
        return new Promise(async next => {
            await Admin.findOne({
                name: data.name,
                password: data.password
            }).then(r => {
                next({
                    etat: true,
                    data: r
                });
            }).catch(err => {
                next({
                    etat: false,
                    message: err
                });
            })
        })
    }
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
                }).then(async s => {
                    if (s !== null) {
                        s.size = r.size;
                        s.save();
                        await Folder.find().then(data => {
                            data.forEach(async el => {
                                if (el.files.includes(s._id)) {
                                    await this.updateFolderSize(el._id, s.size);
                                }
                            })
                        })
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
            let link = folder_path === '' ? path.join(__dirname, '../BigData') : path.join(__dirname, '../BigData', folder_path);
            fs.mkdir(path.join(link, data.folder), function (err, res) {
                if (err) throw err;
            })
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

    static getFolder(name) {
        return new Promise(async next => {
            await Folder.findOne({
                name: name
            }).populate('files').then(r => {
                console.log('r', r);
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
                file.sharedOptions.push({
                    crypt_link: data.crypt_link,
                    path: folder_path + `/${file.name}`,
                    privileges: data.privilege,
                    password: data.password,
                    expirationDate: data.date,
                    message: data.message
                });
                file.save();
                const folder = await Folder.findById(file.folder_id).then(r => r);
                folder.shared = true,
                    folder.sharedOptions.push({
                        crypt_link: data.crypt_link,
                        path: folder_path + `/${folder.name}`,
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
                    path: folder_path + `/${file.name}.${file.mimetype}`,
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

    static updateShared(data) {
        return new Promise(async next => {
            await File.findById(data.id_file).then(async s => {
                if (s.type === "folder") {
                    await Folder.findById(s.folder_id).then(e => {
                        e.sharedOptions.forEach((f, index) => {
                            if (f.crypt_link === data.crypt_link) {
                                e.sharedOptions[index].password = data.password;
                                e.sharedOptions[index].privileges = data.privilege;
                                e.sharedOptions[index].expirationDate = data.date;
                                e.sharedOptions[index].message = data.message;
                                e.save();
                            }
                        })
                    });
                }
                s.sharedOptions.forEach((f, index) => {
                    if (f.crypt_link === data.crypt_link) {
                        s.sharedOptions[index].password = data.password;
                        s.sharedOptions[parseInt(index)].privileges = data.privilege;
                        s.sharedOptions[parseInt(index)].expirationDate = data.date;
                        s.sharedOptions[parseInt(index)].message = data.message;
                        s.save().then(e => {
                            next({
                                etat: true,
                                data: s
                            });
                        })
                    }
                })
            });
        });
    }

    static getFileInfo(id) {
        return new Promise(async next => {
            await File.findById(id).then(async r => {
                next({
                    etat: true,
                    data: r
                });
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
            if (data.files.length === 0) {
                next({
                    etat: true,
                    result: []
                });
            } else {
                let output = [];
                data.files.forEach((file, index) => {
                    let obj = {
                        _id: file.id,
                        name: file.type == "file" ? file.name + '.' + file.mimetype : file.name,
                        type: file.type,
                        shared: file.shared,
                        sharedOptions: file.sharedOptions,
                        size: file.size,
                        date_creation: file.date_creation
                    }
                    output.push(obj);
                    if (index === data.files.length - 1) {
                        next({
                            etat: true,
                            result: output
                        })
                    }
                });
            }
        })
    }

    static updateFolderSize(id, size) {
        return new Promise(async next => {
            await Folder.findById(id).then(async r => {
                if (r !== null) {
                    r.size += size;
                    r.save();
                    await File.findOne({
                        folder_id: r._id
                    }).then(s => {
                        if (s !== null) {
                            s.size = r.size;
                            s.save();
                        }
                    })
                }
            })
        });
    }






    static getAllSharedFiles() {
        return new Promise(async next => {
            let BigObject = {};
            await File.find({
                shared: true
            }).then(big => {
                big.forEach((bigEl, index) => {
                    bigEl.sharedOptions.forEach(shared => {
                        BigObject[shared.crypt_link] = shared;
                    })
                    if (index === big.length - 1) {
                        next({
                            etat: true,
                            result: BigObject
                        });
                    }
                })
            });
        });
    }

    static getOneFolder(parent, child) {
        return new Promise(async next => {
            let Files = [];
            await Folder.findOne({
                name: parent
            }).populate('files').then(r => {
                r.files.forEach(file => {
                    if (file.name === child) {
                        Files.push(file);
                        next({
                            etat: true,
                            files: Files
                        });
                    }
                })
            })
        });
    }

    static getFileSize(name) {
        return new Promise(async next => {
            await File.findOne({
                name: name
            }).then(r => {
                next({
                    etat: true,
                    data: r.size
                });
            })
        });
    }

    static deleteFiles(files) {
        let link = folder_path === '' ? path.join(__dirname, '../BigData') : path.join(__dirname, '../BigData', folder_path);
        return new Promise(async next => {
            files.forEach(async (file, index) => {
                if (file["type"] === "file") {
                    console.log('originalname', file['originalname']);
                    fs.unlink(path.join(link, file["originalname"]), (err, st) => {
                        if (err) throw err;
                    });

                    await File.findOneAndRemove({
                        name: file["file"]
                    });
                } else {

                    rimraf(path.join(link, file["file"]), (err, s) => {
                        if (err) throw err;
                    });

                    await File.findOneAndRemove({
                        name: file["file"]
                    });
                    await Folder.findOne({
                        name: file["file"]
                    }).populate('files').then(r => {
                        let F = [];
                        r.files.forEach(async (f, index) => {
                            F.push({
                                "type": f.type,
                                "file": f.name
                            });
                            if (index === r.files.length - 1) {
                                await this.deleteFiles(F);
                                await Folder.findOneAndRemove({
                                    name: file['file']
                                })
                            }
                        })
                    });
                }
                if (index === files.length - 1) {
                    next({
                        etat: true
                    });
                }
            })
        });
    }


    static deleteShared(data) {
        return new Promise(async next => {
            await File.findById(data.file_id).then(async r => {
                if (r.type == "folder") {
                    await Folder.findById(r.folder_id).then(e => {
                        e.sharedOptions.forEach((shared, index) => {
                            if (shared.crypt_link === data.crypt_link) {
                                e.sharedOptions = e.sharedOptions.slice(0, index).concat(e.sharedOptions.slice(index + 1, e.sharedOptions.length));
                                e.save().then(d => {
                                    if (d.sharedOptions.length == 0) {
                                        d.shared = false;
                                        d.save();
                                    }
                                });
                            }
                        });
                    })
                }
                r.sharedOptions.forEach((shared, index) => {
                    if (shared.crypt_link === data.crypt_link) {
                        r.sharedOptions = r.sharedOptions.slice(0, index).concat(r.sharedOptions.slice(index + 1, r.sharedOptions.length));
                        r.save().then(s => {
                            if (s.sharedOptions.length == 0) {
                                s.shared = false;
                                s.save().then(d => {
                                    next({
                                        etat: true,
                                        data: d
                                    });
                                })
                            } else {
                                next({
                                    etat: true,
                                    data: s
                                });
                            }

                        })
                    }
                })
            })
        })
    }
}