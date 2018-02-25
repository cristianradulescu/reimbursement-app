var express = require('express');
var router = express.Router();
var hbs = require('hbs');
var db = require('../db');
var model = require('../model/models.js');


hbs.registerHelper('documentStatusBadge', (status_id) => {
  if (status_id == 1) {
    return 'danger';
  }

  if (status_id == 2) {
    return 'warning';
  }

  if (status_id == 3) {
    return 'success';
  }
});

hbs.registerHelper('documentTypeIcon', (type_id) => {
  if (type_id == 1) {
    return 'truck';
  }

  if (type_id == 2) {
    return 'dollar-sign';
  }
});

/* GET documents listing. */
router.get('/', function(req, res, next) {
  model.DocumentModel.findAll(
    { 
      order: [['status_id', 'ASC'], ['updated_at', 'DESC']], 
      include: ['employee', 'status', 'type', 'reimbursements', 'travel']
    }
  )
  .then(documents => {
    res.render(
      'documents/list', 
      { 
        title: 'Reimbursement | List documents',
        documents: documents
      }
    );
  })
});

router.get('/show/:documentId', function(req, res, next) {
  model.DocumentModel.findById(
    req.params.documentId,
    { 
      include: [{ all: true, nested: true }]
    }
  )
  .then(document => {
    res.render(
      'documents/show', 
      { 
        title: `Reimbursement | Show document #${document.id}`,
        document: document
      }
    );
  })
});

var getNewDocumentFormData = () => {
  var formData = {};
  return model.EmployeeModel
    .findAll(
      { 
        attributes: ['id', 'last_name', 'first_name'],
        order: [['last_name', 'ASC'], ['first_name', 'ASC']] 
      }
    )
    .then(employees => {
      formData.employees = employees;
      return model.DocumentTypeModel
        .findAll()
        .then(documentTypes => {
          formData.documentTypes = documentTypes;
          return model.ReimbursementTypeModel
            .findAll()
            .then(reimbursementTypes => {
              formData.reimbursementTypes = reimbursementTypes;
              return model.TravelPurposeModel
                .findAll()
                .then(travelPurposes => {
                  formData.travelPurposes = travelPurposes;
                  return model.TravelDestinationModel
                    .findAll()
                    .then(travelDestinations => {
                      formData.travelDestinations = travelDestinations;
                      return formData;
                    })
                });
            });
        });
    });
};

var createNewDocument = (params, transaction) => {
  return model.DocumentModel.create(
    {
      'employee_id': params['employee_id'],
      'status_id': model.DocumentStatusModel.newStatusId,
      'type_id': params['type_id']
    },
    {
      transaction: transaction
    }
  );
};

var createNewTravelDocument = (document, params, transaction) => {
  return model.TravelModel.create(
    {
      'employee_id': document.employee_id,
      'purpose_id': params['purpose_id'],
      'destination_id': params['destination_id'],
      'date_start': params['date_start'],
      'date_end': params['date_end'],
      'departure_leave_time': params['departure_leave_time'],
      'destination_arrival_time': params['destination_arrival_time'],
      'destination_leave_time': params['destination_leave_time'],
      'departure_arrival_time': params['departure_arrival_time']
    },
    {
      transaction: transaction
    }
  )
};

var createNewReimbursementDocument = (document, params, transaction) => {
  return model.ReimbursementModel.create(
    {
      'employee_id': document.employee_id,
      'type_id': params['type_id'],
      'number': params['number'],
      'date': params['date'],
      'value': params['value'],
    },
    {
      transaction: transaction
    }
  );
};

router.get('/create', function(req, res, next) {  
  getNewDocumentFormData().then(formData => {
    res.render(
      'documents/create', 
      { 
        title: 'Reimbursement | Create new document',
        formData
      }
    );
  });
});

router.post('/create', function(req, res, next) {
  var params = req.body;

  db.connection.transaction(createDocumentTransaction => {
    return createNewDocument(params['document'], createDocumentTransaction)
      .then(document => {

        switch (parseInt(params['document']['type_id'])) {
          case model.DocumentTypeModel.travelTypeId:
            console.log('Creating a new Travel document');
            return createNewTravelDocument(document, params['travel'], createDocumentTransaction)
              .then(travel => {
                document.setTravel(travel);
                return document.id;
              });
      
          case model.DocumentTypeModel.reimbursementTypeId:
            console.log('Creating a new Reimbursement document');
            return new Promise((resolve, reject) => {
              params['reimbursement'].forEach(reimbursementParams => {
                console.log(reimbursementParams);
                createNewReimbursementDocument(document, reimbursementParams, createDocumentTransaction)
                  .then(reimbursement => {
                    document.addReimbursement(reimbursement);
                  });
              });
              resolve(document.id);
            });
        
          default: 
            throw 'Invalid document type';
        }
      });
  }).then(result => {
    console.log('Transaction has been committed');
    console.log('Added new document #'+result);
    res.redirect('/documents');

    // result is whatever the result of the promise chain returned to the transaction callback
  }).catch(err => {
    console.log('Transaction has been rolled back');
    // err is whatever rejected the promise chain returned to the transaction callback

    res.render(
      'error',
      {
        'message': 'Transaction has been rolled back',
        'error': err
      }
    );
  });
});

module.exports = router;
