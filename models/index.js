const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_DATABASE, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
);

// load models
var models = [
  'Company',
  'Document',
  'DocumentStatus',
  'DocumentType',
  'Employee',
  'EmployeeJobTitle',
  'Reimbursement',
  'ReimbursementType',
  'Travel',
  'TravelDestination',
  'TravelPurpose'
];
models.forEach(function(model) {
  console.log('Loading ', model);
  module.exports[model] = sequelize.import(__dirname + '/' + model);
});

// describe relationships
(function(m) {
  m.Document.belongsTo(m.Employee, {foreign_key: 'employee_id', as: 'employee'});
  m.Document.belongsTo(m.DocumentStatus, {foreignKey: 'status_id', as: 'status'});
  m.Document.belongsTo(m.DocumentType, {foreignKey: 'type_id', as: 'type'});
  m.Document.hasMany(m.Reimbursement, {foreignKey: 'document_id', as: 'reimbursements'});
  m.Document.hasOne(m.Travel, {foreignKey: 'document_id', as: 'travel'});

  m.Employee.belongsTo(m.EmployeeJobTitle, {foreignKey: 'job_title_id', as: 'jobTitle'});
  m.Employee.belongsTo(m.Company, {foreignKey: 'company_id', as: 'company'});
  m.Employee.hasMany(m.Document, {foreignKey: 'employee_id', as: 'documents'});

  m.Reimbursement.belongsTo(m.ReimbursementType, {foreignKey: 'type_id', as: 'type'});
  m.Reimbursement.belongsTo(m.Employee, {foreignKey: 'employee_id', as: 'employee'});

  m.Travel.belongsTo(m.TravelPurpose, {foreignKey: 'purpose_id', as: 'purpose'});
  m.Travel.belongsTo(m.TravelDestination, {foreignKey: 'destination_id', as: 'destination'});
})(module.exports);

module.exports.sequelize = sequelize;