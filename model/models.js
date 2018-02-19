const Sequelize = require('sequelize');
var db = require('../db');

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
  }
);

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

DocumentModel.belongsTo(EmployeeModel, {as: 'employee'});
DocumentModel.belongsTo(DocumentStatusModel, {foreignKey: 'status_id', as: 'status'});
DocumentModel.belongsTo(DocumentTypeModel, {foreignKey: 'type_id', as: 'type'});

module.exports = { 
  DocumentModel,
  DocumentTypeModel,
  DocumentStatusModel,
  EmployeeModel
};