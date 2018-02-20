var Sequelize = require('sequelize');
var db = require('../db');
var luxon = require('luxon');

const travelAllowance = 32.5;

var DocumentModel = db.define(
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
    getterMethods: {
      totalAmount() {
        if (this.travel) {
          return (travelAllowance * this.getTravelPeriod().days).toFixed(2);
        }

        var totalAmount = 0;
        this.reimbursements.forEach((element) => {
          totalAmount = totalAmount + parseFloat(element.value);
        });
        
        return totalAmount.toFixed(2);
      }
    }
  }
);

DocumentModel.prototype.getTravelPeriod = function() {
  if (this.travel == undefined) {
    throw 'Current document is not associated with a travel';
  }
  var date_start = luxon.DateTime.fromISO(this.travel.date_start);
  var date_end = luxon.DateTime.fromISO(this.travel.date_end);

  // The period in days must be incremented to take into consideration also the first day
  var travelPeriod = date_end.diff(date_start, 'days').toObject();
  travelPeriod.days = travelPeriod.days == undefined ? 1 : travelPeriod.days + 1;

  return travelPeriod;
};

var DocumentTypeModel = db.define(
  'document_type', 
  {
    name: {
      type: Sequelize.STRING
    }
  },
  {
    timestamps: false
  }
);

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
    created_at: {
      type: Sequelize.DATE
    },
    updated_at: {
      type: Sequelize.DATE
    }
  },
  {
    getterMethods: {
      fullName() {
        return `${this.last_name} ${this.first_name}`; 
      }
    }
  }
);

var ReimbursementModel = db.define(
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
  }
);

var ReimbursementTypeModel = db.define(
  'reimbursement_type',
  {
    name: {
      type: Sequelize.STRING
    }
  },
  {
    timestamps: false
  }
);

var TravelModel = db.define(
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
  }
);

DocumentModel.belongsTo(EmployeeModel, {as: 'employee'});
DocumentModel.belongsTo(DocumentStatusModel, {foreignKey: 'status_id', as: 'status'});
DocumentModel.belongsTo(DocumentTypeModel, {foreignKey: 'type_id', as: 'type'});
ReimbursementModel.belongsTo(ReimbursementTypeModel, {foreignKey: 'type_id', as: 'type'});
ReimbursementModel.belongsTo(EmployeeModel, {foreignKey: 'type_id', as: 'employee'});
DocumentModel.hasMany(ReimbursementModel, {foreignKey: 'document_id', as: 'reimbursements'});
DocumentModel.hasOne(TravelModel, {foreignKey: 'document_id', as: 'travel'});

module.exports = { 
  travelAllowance,
  DocumentModel,
  DocumentTypeModel,
  DocumentStatusModel,
  EmployeeModel,
  ReimbursementModel,
  ReimbursementTypeModel
};