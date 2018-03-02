const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'reimbursement',
    {
      type_id: {
        type: Sequelize.INTEGER
      },
      number: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE
      },
      value: {
        type: Sequelize.DECIMAL(10, 2)
      },
      employee_id: {
        type: Sequelize.INTEGER
      },
      document_id: {
        type: Sequelize.INTEGER
      }
    },
    {
      freezeTableName: true,
      underscored: true,
      timestamps: true
    }
  );
}