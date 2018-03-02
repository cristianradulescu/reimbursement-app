const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'employee_job_title',
    {
      name: {
        type: Sequelize.STRING
      }
    },
    {
      freezeTableName: true,
      underscored: true,
      timestamps: false,
      
      defaultScope: {
        order: [[ 'name', 'ASC' ]]
      },
    }
  );
}