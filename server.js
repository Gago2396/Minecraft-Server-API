var express = require('express') //llamamos a Express
const cors = require("cors");
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

db.sequelize.sync({ force: true }).then(() => {
    console.log('Drop and Resync Db');
    initial();
}); 


function initial() {

    var req = {
        body: {
            username: 'Alberto',
            email: 'admin',
            password: 'alberto123',
            roles: ['admin', 'user']
        }
    }

    Role.create({
        id: 1,
        name: "user"
    });

    Role.create({
        id: 2,
        name: "admin"
    });


    User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
    }).then(user => {
        Role.findAll({
            where: {
                name: {
                    [Op.or]: req.body.roles
                }
            }
        }).then(roles => {
            user.setRoles(roles)
        });
    })
} 