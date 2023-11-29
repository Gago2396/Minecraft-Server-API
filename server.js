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
        username: 'Eric',
        email: '',
        password: bcrypt.hashSync('eric123', 8),
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


var spawn = require('child_process').spawn;

var minecraftServerProcess = spawn('java', [
    '-Xmx4G',
    '-jar',
    'fabric-server-mc.1.20.1-loader.0.14.24-launcher.0.11.2.jar',
    'nogui'
]);

function log(data) {
    process.stdout.write(data.toString());
}
minecraftServerProcess.stdout.on('data', log);
minecraftServerProcess.stderr.on('data', log);

app.post('/command', function(request, response) {

    var command = request.body.command;
    minecraftServerProcess.stdin.write(command+'\n');

    var buffer = [];
    var collector = function(data) {
        data = data.toString();
        buffer.push(data.split(']: ')[1]);
    };
    minecraftServerProcess.stdout.on('data', collector);
    setTimeout(function() {
        minecraftServerProcess.stdout.removeListener('data', collector);
        response.send(buffer.join(''));
    }, 250);
});

app.post('/start', function(request, response) {
    if (!minecraftServerProcess) {
        minecraftServerProcess = spawn('java', [
            '-Xmx4G',
            '-jar',
            'fabric-server-mc.1.20.1-loader.0.14.24-launcher.0.11.2.jar',
            'nogui'
        ]);

        minecraftServerProcess.stdout.on('data', log);
        minecraftServerProcess.stderr.on('data', log);

        response.send('Minecraft server started.');
    } else {
        response.send('Minecraft server is already running.');
    }
});

app.post('/stop', function(request, response) {
    if (minecraftServerProcess) {
        minecraftServerProcess.stdin.write('/stop' + '\n');
        console.log(minecraftServerProcess);
        minecraftServerProcess = null;
        response.send('Minecraft server stopped.');
    } else {
        response.send('Minecraft server is not running.');
    }
});

