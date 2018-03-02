const Sequelize = require('sequelize');

const luxon = require('luxon');

module.exports = function(sequelize, DataTypes) {  
  return sequelize.define(
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
      
      getterMethods: {
        travelPeriod() {
          if (this.travel == undefined) {
            throw 'Current document is not associated with a travel';
          }
          var date_start = luxon.DateTime.fromISO(this.travel.date_start);
          var date_end = luxon.DateTime.fromISO(this.travel.date_end);
        
          // The period in days must be incremented to take into consideration also the first day
          var period = date_end.diff(date_start, 'days').toObject();
          period.days = period.days == undefined ? 1 : period.days + 1;
        
          return period;
        },
        totalAmount() {
          if (this.travel) {
            return (this.travel.travelAllowance * this.travelPeriod.days).toFixed(2);
          }

          var totalAmount = 0;
          this.reimbursements.forEach((element) => {
            totalAmount = totalAmount + parseFloat(element.value);
          });
          
          return totalAmount.toFixed(2);
        },
        isTravel() {
          return this.type_id == this.type.travelTypeId;
        },
        isReimbursement() {
          return this.type_id == this.type.reimbursementTypeId;
        }
      }
    }
  );
}