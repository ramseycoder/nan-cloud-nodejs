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
  fs.readdir(GeneralPahtName, (err, files) => {
    if (files.length === 0) {
      res.render('index', {
        root: 0
      });
    } else {
      res.render('index', {
        root: files
      });
    }
  })
});

router.post('/upload-file', upload.single('file'), async (req, res) => {
  console.log(req.file);
  const data = {};
  data.name = req.file.originalname.slice(0, verifPoint(req.file.originalname));
  data.mimetype = req.file.mimetype.slice(req.file.mimetype.indexOf('/') + 1, req.file.mimetype.length);
  data.buffer = await getBase64(req.file.path).then(r => r);
  data.size = req.file.size;
  data.type = "file";
  data.foldername = folder;
  const resu = await globalQueries.setFile(data);
  if (resu.etat) {
    /* const output = await globalQueries.ResultFiles(resu.data);
      if (output.etat) {
        console.log('result', output.result);
      } */
    res.json({
      status: true,
      message: 'merci à vous'
    });
  }
});


function getBase64(link) {
  return new Promise(async next => {
    await base64.encode(link, function (err, res) {
      console.log(res);
      next(res);
    });
  })
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