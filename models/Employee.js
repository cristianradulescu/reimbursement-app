const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
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
      job_title_id: {
        type: Sequelize.INTEGER
      },
      division_manager_id: {
        type: Sequelize.INTEGER
      },
      company_id: {
        type: Sequelize.INTEGER
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
        order: [['last_name', 'ASC'], ['first_name', 'ASC']]
      },

      getterMethods: {
        fullName() {
          return `${this.last_name} ${this.first_name}`; 
        },
        // convenient alternative to full name
        name() {
          return this.fullName;
        }
      }
    }
  );
}