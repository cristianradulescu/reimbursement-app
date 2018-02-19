const Sequelize = require('sequelize');
var db = require('../db');

var DocumentStatusModel = db.define(
  'document_status', 
  {
    name: {
      type: Sequelize.STRING
    }
  },
  {
    timestamps: false
  }
);

module.exports = DocumentStatusModel;