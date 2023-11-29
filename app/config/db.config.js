module.exports = {
    HOST: "127.0.0.1",
    USER: "minecraft",
    PASSWORD: "P@ssw0rd",
    DB: "minecraft",
    dialect: "mariadb",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };