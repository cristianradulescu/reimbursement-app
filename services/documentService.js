const models = require('../models');

var getDocumentById = documentId => {
  return models.Document.findById(
    documentId,
    { 
      include: [
        { 
          all: true, 
          nested: true 
        },
        {
          model: models.Employee, as: 'employee', include: [
            {
              all: true, 
              nested: true 
            },
            { 
              model: models.Company, 
              as: 'company', 
              include: [
                { 
                  model: models.Employee, 
                  as: 'divisionManager' 
                }
              ] 
            }
          ]
        }
      ]
    }
  )
  .then(document => {
    if (document == undefined) {
      throw Error(`Document with id #${documentId} was not found.`);
    }

    return document;
  });
}

var createDocument = (params, transaction) => {
  return models.Document.create(
    {
      employee_id: params['employee_id'],
      status_id: models.DocumentStatus.build().newStatusId,
      type_id: params['type_id']
    },
    {
      transaction
    }
  );
};

var createTravelDocument = (document, params, transaction) => {
  return models.Travel.create(
    {
      employee_id: document.employee_id,
      purpose_id: params['purpose_id'],
      destination_id: params['destination_id'],
      date_start: params['date_start'],
      date_end: params['date_end'],
      departure_leave_time: params['departure_leave_time'],
      destination_arrival_time: params['destination_arrival_time'],
      destination_leave_time: params['destination_leave_time'],
      departure_arrival_time: params['departure_arrival_time']
    },
    {
      transaction
    }
  )
};

var updateTravelDocument = (travel, params, transaction) => {
  return travel.update(
    {
      employee_id: travel.document.employee_id,
      purpose_id: params['purpose_id'],
      destination_id: params['destination_id'],
      date_start: params['date_start'],
      date_end: params['date_end'],
      departure_leave_time: params['departure_leave_time'],
      destination_arrival_time: params['destination_arrival_time'],
      destination_leave_time: params['destination_leave_time'],
      departure_arrival_time: params['departure_arrival_time']
    },
    {
      transaction
    }
  );
}

var createReimbursementDocument = (document, params, transaction) => {
  return models.Reimbursement.create(
    {
      employee_id: params['employee_id'],
      type_id: params['type_id'],
      number: params['number'],
      date: params['date'],
      value: params['value'],
    },
    {
      transaction
    }
  );
};

var updateReimbursementDocument = (reimbursement, params, transaction) => {
  return reimbursement.update(
    {
      employee_id: params['employee_id'],
      type_id: params['type_id'],
      number: params['number'],
      date: params['date'],
      value: params['value'],
    },
    {
      transaction
    }
  );
};

module.exports = {
  getDocumentById,
  createDocument,
  createTravelDocument,
  createReimbursementDocument,
  updateTravelDocument,
  updateReimbursementDocument
};