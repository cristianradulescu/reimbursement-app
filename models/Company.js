const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'company',
    {
      name: {
        type: Sequelize.STRING
      },
      cost_center: {
        type: Sequelize.STRING
      },
      created_at: {
        type: Sequelize.DATE
      },
      updated_at: {
        type: Sequelize.DATE
      }
    },
    {
      freezeTableName: true,
      underscored: true,
      timestamps: true,
      
      defaultScope: {
        order: [[ 'name', 'ASC' ]]
      },
    }
  );
}