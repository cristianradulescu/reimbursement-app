var Sequelize = require('sequelize');
var connection = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

var authenticate = () => {
  return connection.authenticate()
    .then(() => {
      console.log('Connection has been established successfully.'); 
    })
    .catch((err) => {
      console.error(`Unable to connect to the database. Error code: ${err.original.code}`);
    });
}

var define = (modelName, attributes, options = {}) => {
  var defaultOptions = {
    freezeTableName: true,
    timestamps: true, 
    underscored: true
  };

  return connection.define(
    modelName,
    attributes,
    Object.assign(defaultOptions, options)
  )
}

module.exports = {
  authenticate,
  connection,
  define
};