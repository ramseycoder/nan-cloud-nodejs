var express = require('express');
var router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// repertoire générale
const GeneralPahtName = path.join(__dirname, '../STORAGE');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../temporary_files/"));
  },
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
  const pathName = req.file.path;
  fs.createReadStream(pathName).pipe(fs.createWriteStream(GeneralPahtName + `/${folder_path === '' ? req.file.filename : folder_path+'/'+req.file.filename}`));
  res.json({
    status: true,
    message: 'merci à vous'
  });
  console.log('file saved successfully');
});

module.exports = router;