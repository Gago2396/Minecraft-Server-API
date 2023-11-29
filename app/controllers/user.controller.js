const db = require("../models");
const Role = db.role;
const User = db.user;

var exec = require('child_process').exec;
const axios = require('axios');

const util = require('util');
const execAsync = util.promisify(require('child_process').exec);
const fs = require('fs');

const rutaOriginal = '../../Server';
const rutaCopia = '../../../CopiaSeguridad';
const nombreCopia = 'ServerBackup-1';
const remoteFilePath = '/home/garito/Escritorio/ServerFabric1.20.1/mods/'


exports.getUsers = async (req, res) => {
    try {
        const listaUsuarios = await User.findAll({
            attributes: ["id", "username"]
        });

        var lista = []

        listaUsuarios.forEach(element => {
            lista.push({
                id: element.id,
                name: element.username
            })
        });


        return res.status(200).json(lista);


    } catch (error) {
        return res.status(500).json(error);
    }
}

exports.saySomething = async (req, res) => {
    try {
        const message = req.body.message;

        exec(`screen -S minecraft -p 0 -X stuff "/say ${message}\\r"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al enviar el mensaje: ${error.message}`);
                return res.status(500).json({ error: 'Error al enviar el mensaje' });
            }
            if (stderr) {
                console.error(`Error en la salida estándar: ${stderr}`);
            }
            console.log(`Mensaje enviado: ${message}`);
            return res.status(200).json({ message: 'Mensaje enviado!' });
        });
    } catch (error) {
        console.error(`Error en la función: ${error.message}`);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

exports.save = async (req, res) => {
    try {
        const message = req.body.message;

        exec(`screen -S minecraft -p 0 -X stuff "/save-all \\r"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al guardar: ${error.message}`);
                return res.status(500).json({ error: 'Error al guardar' });
            }
            if (stderr) {
                console.error(`Error en la salida estándar: ${stderr}`);
            }
            console.log(`Servidor guardado!`);
            return res.status(200).json({ message: 'Servidor guardado!' });
        });
    } catch (error) {
        console.error(`Error en la función: ${error.message}`);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

exports.getStatus = async (req, res) => {
    try {
        const response = await axios.get('https://api.mcstatus.io/v2/status/java/blackdiamond.ddns.net')
        const data = response.data;

        const respuestaPersonalizada = {
            online: data.online,
            players: {
                online: data.players.online,
                list: data.players.list
            }
        };

        return res.status(200).json(respuestaPersonalizada);
    } catch (error) {
        console.error(`Error al obtener el estado del servidor: ${error.message}`);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

exports.backup = async (req, res) => {
    await executeBackup();
};


const executeCommand = async (command, errorMessage) => {
    try {
        const { stdout, stderr } = await execAsync(command);
        if (stderr) throw new Error(stderr);
        console.log(`Comando ejecutado correctamente: ${stdout.trim()}`);
    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error.message}`);
        res.status(500).json({ error: errorMessage });
        throw error;
    }
};

const executeBackup = async () => {
    try {
        await executeCommand('screen -r -S minecraft -X stuff $\'\nsave-all\nsave-off\n\'', 'Error al realizar la copia de seguridad');
        await executeCommand('screen -r -S minecraft -X stuff $\'\nsay Creando copia de seguridad...\'', 'Error al realizar la copia de seguridad');
        await executeCommand(`mkdir -p ${rutaCopia}`, 'Error al crear directorio');
        await executeCommand(`cp -r ${rutaOriginal} ${rutaCopia}/${nombreCopia}`, 'Error al mover archivos');
        console.log(`Copia de seguridad completada en ${rutaCopia}/${nombreCopia}`);
        await executeCommand(`rm -r ${rutaCopia}/ServerBackup`, 'Error al borrar el archivo antiguo');
        await executeCommand(`mv ${rutaCopia}/${nombreCopia} ${rutaCopia}/ServerBackup`, 'Error al renombrar la nueva copia de seguridad');
        await executeCommand('screen -r -S minecraft -X stuff $\'\nsay Copia de seguridad creada!\nsave-on\n\'');
        res.status(200).json({ message: 'Copia de seguridad creada' });
    } catch (error) {
        console.error('Error en la operación de copia de seguridad:', error.message);
    }
};

module.exports.listMods = (req, res) => {
    fs.readdir(remoteFilePath, (err, files) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error al obtener la lista de mods' });
        } else {
            res.status(200).json({ mods: files });
        }
    });
};