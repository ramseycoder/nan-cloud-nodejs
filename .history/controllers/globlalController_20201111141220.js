const fs = require('fs');
const path = require('path');
const { join } = require('path');
const { promisify } = require('util');
const { createReadStream, stat } = require('fs');
const random = require('random-key');
const child_process = require('child_process');
const fetch = require('node-fetch');
const uniqid = require('uniqid');

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
    let link = folder_path === '' ? path.join(__dirname, '../BigData') : path.join(__dirname, '../BigData', folder_path);
    console.log('link', link);
    let tab = req.file.originalname.split('');
    const B = {};
    B.name = req.file.originalname.slice(0, verifPoint(req.file.originalname));
    B.mimetype = tab.slice(verifPoint(tab) + 1, tab.length).join('');
    console.log('mimetype', B.mimetype);
    fs.createReadStream(req.file.path).pipe(fs.createWriteStream(path.join(link, req.file.originalname)));
    B.type = "file";
    B.size = req.file.size;
    B.folder_id = currentFolderId;
    const resu = await globalQueries.setFile(B);
    if (resu.etat) {
        res.json({
            status: true,
            message: 'merci à vous'
        });
    }
};


exports.shared1 = async (req, res) => {
    if (req.session.shared) {
        console.log('session', req.session.shared);
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
                                req.session.sharedlink = uniqid('shared-', '-link');
                                req.session.save();
                                res.render('sharefile', {
                                    typeFile: filename.split('').slice(verifPoint(filename.split('')) + 1, filename.split('').length).join(''),
                                    key: req.params.key,
                                    token: req.session.sharedlink
                                });
                            } else {
                                req.session.shared = {
                                    key: random.generate(16),
                                    keyShared: obj.crypt_link,
                                    path: '',
                                    realPath: t.slice(0, t.length - 1) === '' ? '' : t.slice(0, t.length - 1).join('/')
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
                    console.log('obj', obj);
                    if (obj.password !== null && obj.password !== '') {
                        res.render('loginShared', {
                            key: obj.crypt_link,
                            errorLogin: false
                        });
                    } else {
                        let t = obj.path.split('/');
                        let filename = t[t.length - 1];
                        if (filename.includes('.')) {
                            req.session.sharedlink = uniqid('shared-', '-link');
                            req.session.save();;
                            res.render('sharefile', {
                                typeFile: filename.split('').slice(verifPoint(filename.split('')) + 1, filename.split('').length).join(''),
                                key: req.params.key,
                                token: req.session.sharedlink
                            });
                        } else {
                            req.session.shared = {
                                key: random.generate(16),
                                keyShared: obj.crypt_link,
                                path: '',
                                realPath: t.slice(0, t.length - 1) === '' ? '' : t.slice(0, t.length - 1).join('/')
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

exports.shareFile = async (req, res) => {
    let SO = await globalQueries.getAllSharedFiles();
    if (SO.etat) {
        sharedObject = SO.result;
        const sharefile = sharedObject[req.params.key];
        const range = req.headers.range;
        if (req.session.sharedlink !== req.params.token) {
            res.status(404).send('not found');
        } else if (!range || (range && ((req.headers['sec-fetch-mode'] === undefined || req.headers['sec-fetch-site'] === undefined) || (req.headers['sec-fetch-mode'] !== undefined && req.headers['sec-fetch-mode'] === "navigation") || (req.headers['sec-fetch-site'] !== undefined && req.headers['sec-fetch-site'] === "none")))) {
            res.status(404).send('not found');
        } else {
            const video = join(__dirname, '../bigData', sharefile.path);
            const videoStat = await promisify(stat)(video);
            const parts = range.replace('bytes=', '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : videoStat.size - 1;
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${videoStat.size}`,
                "Accept-Range": 'bytes',
                "Content-Length": videoStat.size,
            });
            createReadStream(video, { start, end }).pipe(res);
        }
    }
};

exports.shared1Post = async (req, res) => {
    let SO = await globalQueries.getAllSharedFiles();
    if (SO.etat) {
        sharedObject = SO.result;
        if (Object.keys(sharedObject).includes(req.body.key)) {
            let obj = sharedObject[req.body.key];
            if (req.body.password === obj.password) {
                let t = obj.path.split('/');
                let filename = t[t.length - 1];
                if (filename.includes('.')) {
                    req.session.sharedlink = uniqid('shared-', '-link');
                    req.session.save();
                    res.render('sharefile', {
                        typeFile: filename.split('').slice(verifPoint(filename.split('')) + 1, filename.split('').length).join(''),
                        key: req.body.key,
                        token: req.session.sharedlink
                    });
                } else {
                    req.session.shared = {
                        key: random.generate(16),
                        keyShared: obj.crypt_link,
                        path: '',
                        realPath: t.slice(0, t.length - 1) === '' ? '' : t.slice(0, t.length - 1).join('/')
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
                    req.session.shared.realPath = setPath(req.session.shared.realPath, folder);
                    let resuOne = await globalQueries.getFolder(folder);
                    if (resuOne.etat) {
                        console.log('data', resuOne.data);
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
                    req.session.realPath = t.slice(0, t.length - 1) ? '' : t.slice(0, t.length - 1).join('/');
                    let parent = t[t.length - 2] === '' ? 'root' : t[t.length - 2];
                    if (t[t.length - 1].includes('.')) {
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

exports.download = async (req, res) => {
    let p = folder_path === '' ? path.join(__dirname, '../BigData') : path.join(__dirname, '../BigData', folder_path);
    if (req.query.type == "file") {
        console.log('oui');
        res.download(path.join(p, req.query.file))
    } else {
        child_process.execSync(`zip -r ${req.query.dir} *`, {
            cwd: p
        });
        res.download(path.join(p, `${req.query.dir}.zip`), (err) => {
            if (!err) (
                fs.unlink(path.join(p, `${req.query.dir}.zip`), (err, f) => {
                    if (err) throw err;
                })
            )
        });
        /*   */
    }
}

exports.downloadShare = async (req, res) => {
    if (req.session.shared) {
        // console.log('path', req.session.shared.realPath);
        let p = req.session.shared.realPath === '' ? path.join(__dirname, '../BigData') : path.join(__dirname, '../BigData', req.session.shared.realPath);
        console.log('path', p);
        if (req.query.type == "file") {
            res.download(path.join(p, req.query.file));
        } else {
            child_process.execSync(`zip -r ${req.query.dir} *`, {
                cwd: p
            });
            res.download(path.join(p, `${req.query.dir}.zip`), (err) => {
                if (!err) (
                    fs.unlink(path.join(p, `${req.query.dir}.zip`), (err, f) => {
                        if (err) throw err;
                    })
                )
            });

        }
    } else {
        res.status(404).render('error');
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