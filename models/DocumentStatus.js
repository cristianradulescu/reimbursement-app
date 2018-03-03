const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
    'document_status', 
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
        order: [['id', 'ASC']]
      },

      getterMethods: {
        newStatusId() {
          return 1;
        },
        pendingStatusId() {
          return 2;
        },
        completedStatusId() {
          return 3
        }
      }
    }
  );
}