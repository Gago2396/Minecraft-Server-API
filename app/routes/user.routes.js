const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get('/', function (req, res) {
        console.log('Ejecuto una funcion')
        res.json({ mensaje: 'Servidor Iniciado' })
    })

    app.get('/cervezas', function (req, res) {
        res.json({ mensaje: '¡A beber cerveza!' })
    })

    app.post('/', function (req, res) {
        res.json({ mensaje: 'Método post' })
    })
    
}
