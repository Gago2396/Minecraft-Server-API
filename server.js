var express = require('express') //llamamos a Express
const cors = require("cors");
const cron = require('node-cron');
var app = express()
// parse requests of content-type - application/json
app.use(express.json());

var corsOptions = {
    origin: ["http://localhost:8101", "http://localhost:8100", "http://localhost:4200"]
};

app.use(cors(corsOptions));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
const controller = require('./app/controllers/user.controller');

var port = process.env.PORT || 3005  // establecemos nuestro puerto

// iniciamos nuestro servidor
app.listen(port)
console.log('API escuchando en el puerto ' + port)

const db = require("./app/models");
const Role = db.role;
const User = db.user;

var bcrypt = require("bcryptjs");
const Op = db.Sequelize.Op;

//Iniciar a 0 la base de datos.

// db.sequelize.sync({ force: true }).then(() => {
//     console.log('Drop and Resync Db');
//     initial();
// });

cron.schedule('0 2 * * *', () => {
    controller.backup();
});

controller.start();

function initial() {
    Role.create({
        id: 1,
        name: "user"
    });

    Role.create({
        id: 2,
        name: "admin"
    });

    User.create({
        username: 'Alberto',
        email: 'admin',
        password: bcrypt.hashSync('alberto123', 8),
    }).then(user => {
        Role.findAll({
            where: {
                name: {
                    [Op.or]: ['admin', 'user']
                }
            }
        }).then(roles => {
            user.setRoles(roles)
        });
    });

    User.create({
        username: 'blackdiamond',
        email: 'blackdiamond@mail.com',
        password: bcrypt.hashSync('matuja420', 8),
    }).then(user => {
        Role.findAll({
            where: {
                name: {
                    [Op.or]: ['user']
                }
            }
        }).then(roles => {
            user.setRoles(roles)
        });
    });
}