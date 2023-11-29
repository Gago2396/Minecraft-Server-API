const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");
const multer = require('multer');
const targetPath = '/home/garito/Escritorio/ServerFabric1.20.1/mods';
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, targetPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });


module.exports = function (app) {

    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post('/upload', upload.single('file'), (req, res) => {
        console.log(req.file);
        res.status(200).json({ message: 'Archivo subido con exito' });
    });

    app.post('/download', (req, res) => {
        const fileName = req.body.fileName;
        const filePath = path.join(targetPath, fileName);

        if (fs.existsSync(filePath)) {
            res.download(filePath);
        } else {
            res.status(404).json({ message: 'Archivo no encontrado' });
        }
    });

    app.post('/delete', (req, res) => {
        const fileName = req.body.fileName;
        const filePath = path.join(targetPath, fileName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({ message: 'Archivo eliminado exitosamente' });
        } else {
            res.status(404).json({ message: 'Archivo no encontrado' });
        }
    });

    app.get('/listMods', controller.listMods);

    app.post('/say', controller.saySomething);

    app.get('/save', controller.save);

    app.get('/status', controller.getStatus);

    app.get('/backup', controller.backup);

    app.post('/start', controller.start);

    app.post('/stop', controller.stop);

    app.post('/command', controller.command);

}
