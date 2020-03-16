var express = require('express');
var router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const base64 = require('file-base64');
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
  res.redirect(`app/files/?dir=/&fileid=${Id}`);
})
router.get('/app/files', async (req, res) => {
  const Dir = req.query.dir;
  const id = req.query.fileid;
  if (id === undefined) {
    //const Id = await globalQueries.getFolderId(Dir);

    folder_path = setPath(folder_path, Dir);
    const Id = await globalQueries.getUnderFolderId(folder_path);
    console.log('id', Id);
    res.redirect(`/app/files/?dir=/${folder_path}&fileid=${Id}`);
  } else {
    folder_path = Dir === '/' ? '' : folder_path;
    let path = Dir === '/' ? 'none' : folder_path.includes('/') ? folder_path.split('/') : folder_path;
    currentFolderId = id;
    const resOne = await globalQueries.getFolderById(id);
    if (resOne.etat) {
      console.log('data', resOne.data);
      const output = await globalQueries.ResultFiles(resOne.data);
      console.log('output', output);
      console.log('path', path);
      res.render('index', {
        path: path,
        files: output.result
      });
    }
  }
});


router.post('/upload-file', upload.single('file'), async (req, res) => {
  const data = {};
  data.name = req.file.originalname.slice(0, verifPoint(req.file.originalname));
  data.mimetype = req.file.mimetype.slice(req.file.mimetype.indexOf('/') + 1, req.file.mimetype.length);
  data.buffer = Buffer.from(req.file.path, 'base64');
  data.size = req.file.size;
  data.type = "file";
  data.folder_id = currentFolderId;
  const resu = await globalQueries.setFile(data);
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
      console.log('un', Tpath);
      Tpath = Tpath.slice(0, Tpath.indexOf(folder) + 1);
      console.log('deux', Tpath);
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