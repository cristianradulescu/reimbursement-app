const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'travel',
    {
      employee_id: {
        type: Sequelize.INTEGER
      },
      purpose_id: {
        type: Sequelize.INTEGER
      },
      destination_id: {
        type: Sequelize.INTEGER
      },
      date_start: {
        type: Sequelize.DATEONLY
      },
      date_end: {
        type: Sequelize.DATEONLY
      },
      departure_leave_time: {
        type: Sequelize.DATE
      },
      departure_arrival_time: {
        type: Sequelize.DATE
      },
      destination_arrival_time: {
        type: Sequelize.DATE
      },
      destination_leave_time: {
        type: Sequelize.DATE
      },
      document_id: {
        type: Sequelize.INTEGER
      }
    },
    {
      freezeTableName: true,
      underscored: true,
      timestamps: true,

      getterMethods: {
        travelAllowance() {
          return 32.5;
        }
      }
    }
  );
}