const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'document_type', 
    {
      name: {
        type: Sequelize.STRING
      }
    },
    {
      freezeTableName: true,
      underscored: true,
      timestamps: false,

      getterMethods: {
        travelTypeId() {
          return 1;
        },
        reimbursementTypeId() {
          return 2;
        }
      },

      defaultScope: {
        order: [[ 'name', 'ASC' ]]
      },
    }
  );
}