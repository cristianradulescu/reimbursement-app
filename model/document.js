const Sequelize = require('sequelize');
var db = require('../db');
var DocumentStatusModel = require('./documentStatus');
var EmployeeModel = require('./employee');

var DocumentModel = db.define(
  'document', 
  {
    employee_id: {
      type: Sequelize.INTEGER
    },
    status_id: {
      type: Sequelize.INTEGER
    },
    type_id: {
      type: Sequelize.INTEGER
    }
  }
);

DocumentModel.belongsTo(DocumentStatusModel, {foreignKey: 'status_id', as: 'status'});
DocumentModel.belongsTo(EmployeeModel, {as: 'employee'});

module.exports = DocumentModel;