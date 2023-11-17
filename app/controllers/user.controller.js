const db = require("../models");
const Role = db.role;
const User = db.user;

var bcrypt = require("bcryptjs");
const Op = db.Sequelize.Op;


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