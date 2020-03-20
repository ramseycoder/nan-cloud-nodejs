const fs = require('fs');
const path = require('path');
const random = require('random-key');
const {
    globalQueries
} = require('../Queries/globalQuerie');


exports.index = async (req, res) => {
    if (req.session.admin) {
        const Id = await globalQueries.getFolderId('root');
        if (Id.etat) {
            res.redirect(`app/files/?dir=/&fileid=${Id.data}`);
        }
    } else {
        res.redirect('admin/cloud')
    }
}

exports.adminLogin = async (req, res) => {
    res.render('adminLogin', {
        errorLogin: false
    });
}

exports.adminLoginPost = async (req, res) => {
    const resuOne = await globalQueries.getAdmin(req.body);
    if (resuOne.etat && resuOne.data !== null) {
        req.session.admin = {
            id: resuOne.data._id,
            name: resuOne.data.name
        };
        req.session.save();
        res.redirect('/');
    } else {
        res.render('adminLogin', {
            errorLogin: true
        });
    }
}

exports.appFiles = async (req, res) => {
    if (req.session.admin) {
        const Dir = req.query.dir;
        const id = req.query.fileid;
        if (id === undefined) {
            //const Id = await globalQueries.getFolderId(Dir);
            folder_path = setPath(folder_path, Dir);
            const Id = await globalQueries.getUnderFolderId(folder_path);
            if (Id.etat) {
                res.redirect(`/app/files/?dir=/${folder_path}&fileid=${Id.data}`);
            }
        } else {
            folder_path = Dir === '/' ? '' : folder_path;
            let path = Dir === '/' ? 'none' : folder_path.includes('/') ? folder_path.split('/') : folder_path;
            currentFolderId = id;
            const resOne = await globalQueries.getFolderById(id);
            if (resOne.etat) {
                const layout = await globalQueries.ResultFiles(resOne.data);
                if (layout.etat) {
                    res.render('adminside', {
                        path: path,
                        files: layout.result,
                        admin: req.session.admin
                    });
                }
                /* const output = await globalQueries.ResultFiles(resOne.data); */

                // console.log('path', path);
            }
        }
    } else {
        res.redirect('/');
    }
}


exports.uploadFile = async (req, res) => {
    console.log('file', req.file)
    let mimetype = req.file.mimetype.slice(req.file.mimetype.indexOf('/') + 1, req.file.mimetype.length);
    if (mimetype === "mp4") {
        const B = {};
        B.name = req.file.originalname.slice(0, verifPoint(req.file.originalname));
        B.mimetype = req.file.mimetype.slice(req.file.mimetype.indexOf('/') + 1, req.file.mimetype.length);
        fs.createReadStream(req.file.path).pipe(fs.createWriteStream(path.join(__dirname, '../BigData', req.file.originalname)));
        B.buffer = null
        B.type = "file";
        B.size = req.file.size;
        B.folder_id = currentFolderId;
        const resu = await globalQueries.setFile(B);
        if (resu.etat) {
            /*  const output = await globalQueries.ResultFiles(resu.data);
              if (output.etat) {  
                console.log('result', output.result);
              } */
            res.json({
                status: true,
                message: 'merci à vous'
            });
        }
    } else {
        fs.readFile(req.file.path, async (err, data) => {
            if (err) throw err;
            const B = {};
            B.name = req.file.originalname.slice(0, verifPoint(req.file.originalname));
            B.mimetype = req.file.mimetype.slice(req.file.mimetype.indexOf('/') + 1, req.file.mimetype.length);
            B.buffer = Buffer.from(data, 'base64');
            B.size = req.file.size;
            B.type = "file";
            B.folder_id = currentFolderId;
            const resu = await globalQueries.setFile(B);
            if (resu.etat) {
                /*  const output = await globalQueries.ResultFiles(resu.data);
                  if (output.etat) {  
                    console.log('result', output.result);
                  } */
                res.json({
                    status: true,
                    message: 'merci à vous'
                });
            }
        });
    }
};


exports.shared1 = async (req, res) => {
    if (req.session.shared) {
        res.redirect(`/shared?key=${req.session.shared.keyShared}`)
    } else {
        let SO = await globalQueries.getAllSharedFiles();
        if (SO.etat) {
            sharedObject = SO.result;
            if (Object.keys(sharedObject).includes(req.params.key)) {
                let obj = sharedObject[req.params.key];
                if (obj.expirationDate !== null) {
                    let todaySec = new Date().getTime() / 1000;
                    let sharedSec = new Date(obj.expirationDate).getTime() / 1000;
                    if (todaySec < sharedSec) {
                        if (obj.password !== null && obj.password !== '') {
                            res.render('loginShared', {
                                key: obj.crypt_link,
                                errorLogin: false
                            });
                        } else {
                            let t = obj.path.split('/');
                            let filename = t[t.length - 1];
                            if (filename.includes('.')) {
                                res.redirect(`/STORAGE/${filename}`);
                            } else {
                                req.session.shared = {
                                    key: random.generate(16),
                                    keyShared: obj.crypt_link,
                                    path: ''
                                };
                                req.session.save();
                                let parent = t[t.length - 2] === '' ? 'root' : t[t.length - 2];
                                let q = await globalQueries.getOneFolder(parent, filename);
                                if (q.etat) {
                                    res.render('clientside', {
                                        path: 'none',
                                        key: obj.crypt_link,
                                        privileges: obj.privileges,
                                        files: q.files
                                    })
                                }
                            }
                        }
                    } else {
                        res.render('link_expired')
                    }
                } else {
                    if (obj.password !== null && obj.password !== '') {
                        res.render('loginShared');
                    } else {
                        let t = obj.path.split('/');
                        let filename = t[t.length - 1];
                        if (filename.includes('.')) {
                            res.redirect(`/STORAGE/${filename}`);
                        } else {
                            req.session.shared = {
                                key: random.generate(16),
                                keyShared: obj.crypt_link,
                                path: ''
                            };
                            req.session.save();
                            let parent = t[t.length - 2] === '' ? 'root' : t[t.length - 2];
                            let q = await globalQueries.getOneFolder(parent, filename);
                            if (q.etat) {
                                res.render('clientside', {
                                    path: 'none',
                                    key: obj.crypt_link,
                                    privileges: obj.privileges,
                                    files: q.files
                                })
                            }
                        }
                    }
                }
            } else {
                res.status(404).render('error');
            }
        }
    }
}

exports.shared1Post = async (req, res) => {
    let SO = await globalQueries.getAllSharedFiles();
    if (SO.etat) {
        sharedObject = SO.result;
        if (Object.keys(sharedObject).includes(req.body.key)) {
            let obj = sharedObject[req.body.key];
            if (req.body.username === "nancloud" && req.body.password === obj.password) {
                let t = obj.path.split('/');
                let filename = t[t.length - 1];
                if (filename.includes('.')) {
                    res.redirect(`/STORAGE/${filename}`);
                } else {
                    req.session.shared = {
                        key: random.generate(16),
                        keyShared: obj.crypt_link,
                        path: ''
                    };
                    req.session.save();
                    let parent = t[t.length - 2] === '' ? 'root' : t[t.length - 2];
                    let q = await globalQueries.getOneFolder(parent, filename);
                    if (q.etat) {
                        res.render('clientside', {
                            path: 'none',
                            key: obj.crypt_link,
                            privileges: obj.privileges,
                            files: q.files
                        })
                    }
                }
            } else {
                res.render('loginShared', {
                    key: req.body.key,
                    errorLogin: true,
                });
            }
        } else {
            res.json({
                status: false,
                message: "bad request"
            });
        }
    }
}


exports.shared2 = async (req, res) => {
    if (req.session.shared) {
        let SO = await globalQueries.getAllSharedFiles();
        if (SO.etat) {
            sharedObject = SO.result;
            let Key = req.query.key;
            let folder = req.query.dir;
            if (Object.keys(sharedObject).includes(Key)) {
                let obj = sharedObject[Key];
                if (folder !== undefined) {
                    req.session.shared.path = setPath(req.session.shared.path, folder);
                    let resuOne = await globalQueries.getFolder(folder);
                    if (resuOne.etat) {
                        let layout = await globalQueries.ResultFiles(resuOne.data);
                        if (layout.etat) {
                            res.render('clientside', {
                                path: req.session.shared.path.includes('/') ? req.session.shared.path.split('/') : req.session.shared.path,
                                privileges: obj.privileges,
                                key: Key,
                                files: layout.result,
                            })
                        }
                    }
                } else {
                    req.session.shared.path = '';
                    let t = obj.path.split('/');
                    let parent = t[t.length - 2] === '' ? 'root' : t[t.length - 2];
                    if (obj.path.includes('.')) {
                        res.redirect(`/STORAGE/${obj.path}`);
                    } else {
                        let q = await globalQueries.getOneFolder(parent, t[t.length - 1]);
                        if (q.etat) {
                            res.render('clientside', {
                                path: 'none',
                                key: obj.crypt_link,
                                privileges: obj.privileges,
                                files: q.files
                            })
                        }
                    }
                }

            } else {
                res.status(404).render('error');
            }
        }
    } else {
        res.redirect(`/shared/${req.query.key}`);
    }
}



function setPath(Gpath, folder) {
    if (Gpath === '') {
        return `${folder}`;
    } else {
        let Tpath = Gpath.split('/');
        if (Tpath.includes(folder)) {
            Tpath = Tpath.slice(0, Tpath.indexOf(folder) + 1);
            return Tpath.join('/');
        } else {
            return Gpath + `/${folder}`;
        }
    }
}

function verifPoint(str) {
    const tab = [];
    for (let i = 0; i < str.length; i++) {
        if (str[i] === ".") {
            tab.push(i);
        }
    }
    return tab[tab.length - 1];
}