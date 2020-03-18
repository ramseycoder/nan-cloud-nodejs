var express = require('express');
var router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const base64 = require('file-base64');
const grid = require('gridfs-stream');
const {
  globalQueries
} = require('../Queries/globalQuerie');
// repertoire générale
const GeneralPahtName = path.join(__dirname, '../STORAGE');
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})



const upload = multer({
  storage: storage
});


/* GET home page. */
router.get('/', async (req, res) => {
  const Id = await globalQueries.getFolderId('root');
  console.log('result', Id);
  if (Id.etat) {
    console.log('result', Id);
    res.redirect(`app/files/?dir=/&fileid=${Id.data}`);
  }
});
router.get('/app/files', async (req, res) => {
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
      const output = await globalQueries.ResultFiles(resOne.data);
      if (output.etat) {
        console.log('result', output.result);
        res.render('index', {
          path: path,
          files: output.result
        });
      }
      // console.log('path', path);
    }
  }
});


router.post('/upload-file', upload.single('file'), async (req, res) => {
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
});



/* function getBase64(link) {
   return new Promise(async next => {
     await base64.encode(link, function (err, res) {
       console.log(res);
       next(res);
     });
   })
 } */

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
module.exports = router;