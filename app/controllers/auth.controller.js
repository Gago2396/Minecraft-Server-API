const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");


exports.signup = (req, res) => {
  // Save User to Database
  User.create({
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, 8)
  }).then(user => {
    if (req.body.roles) {
      Role.findAll({
        where: {
          name: {
            [Op.or]: req.body.roles
          }
        }
      }).then(roles => {
        user.setRoles(roles).then(() => {
          res.send({ message: "El usuario se ha registrado correctamente!" });
        });
      });
    } else {
      // user role = 1
      user.setRoles([1]).then(() => {
        res.send({ message: "El usuario se ha registrado correctamente!" });
      });
    }
  })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  console.log('INICIO DE SESION CON username= ' + req.body.username)
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "Usuario no encontrado" });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Contraseña incorrecta!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          roles: authorities,
          accessToken: token,
          photo: user.photo
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.updatePhoto = (req, res) => {

  const id = req.body.userId;
  User.findByPk(id)
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "Usuario no encontrado" });
      }
      user.update({
        photo: req.body.photo
      })
        .then(() => {
          res.status(200).send({ message: "Foto de perfil actualizada correctamente" });
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.changePassword = async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({
    where: {
      id: req.body.userId
    }
  }).then(user => {
    if (!username) {
      username = user.username;
    }
    user.update({
      username: username
    })
      .then(() => {
        if (password) {
          user.update({
            password: bcrypt.hashSync(password, 8)
          })
        }
      })
      .then(() => {
        res.status(200).send({ message: "Perfil actualizado correctamente!" });
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });

  });
}