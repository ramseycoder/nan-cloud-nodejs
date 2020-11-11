var express = require('express');
var router = express.Router();
const multer = require('multer');
const globalController = require('../controllers/globlalController');
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({
  storage: storage
});





/* GET home page. */
router.get('/', globalController.index);
router.get('/app/files', globalController.appFiles);
router.post('/upload-file', upload.single('file'), globalController.uploadFile);
router.get('/admin/cloud', globalController.adminLogin);
router.post('/admin/cloud', globalController.adminLoginPost);
router.get('/shared', globalController.shared2);
router.get('/file/:key', globalController.shareFile);
router.get('/shared/:key', globalController.shared1);
router.post('/shared/:key', globalController.shared1Post);
router.get('/download', globalController.download);
router.get('/downloadShare', globalController.downloadShare);

module.exports = router;