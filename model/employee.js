const Sequelize = require('sequelize');
var db = require('../db');

var EmployeeModel = db.define(
  'employee', 
  {
    first_name: {
      type: Sequelize.STRING
    },
    last_name: {
      type: Sequelize.STRING
    },
    personal_numeric_code: {
      type: Sequelize.INTEGER
    },
    identity_card_number: {
      type: Sequelize.INTEGER
    },
  },
  {
    getterMethods: {
      fullName() {
        return `${this.last_name} ${this.first_name}`; 
      }
    }
  }
);

module.exports = EmployeeModel;