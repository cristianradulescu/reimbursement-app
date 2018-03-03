const express = require('express');
const router = express.Router();
const moment = require('moment');
const models = require('../models');
const documentService = require('../services/documentService');

let getDocumentFormData = (document = undefined) => {
  var formData = {};
  return models.Employee
    .findAll(
      { 
        attributes: ['id', 'last_name', 'first_name'],
        order: [['last_name', 'ASC'], ['first_name', 'ASC']]
      }
    )
    .then(employees => {
      formData.employees = employees;

      return models.DocumentType
        .findAll()
        .then(documentTypes => {
          formData.documentTypes = documentTypes;

          return models.DocumentStatus
            .findAll()
            .then(documentStatuses => {
              formData.documentStatuses = documentStatuses;

              return models.ReimbursementType
                .findAll()
                .then(reimbursementTypes => {
                  formData.reimbursementTypes = reimbursementTypes;
              
                  return models.TravelPurpose
                    .findAll()
                    .then(travelPurposes => {
                      formData.travelPurposes = travelPurposes;

                      return models.TravelDestination
                        .findAll()
                        .then(travelDestinations => {
                          formData.travelDestinations = travelDestinations;

                          return formData;
                        })
                    });
                });
            });
        });
    });
};

let printTravelDocument = (res, document) => {
  res.render(
    'documents/print/travel', 
    { 
      layout: false,
      
      PLACEHOLDER_COST_CENTER: document.employee.company.cost_center,
      PLACEHOLDER_EMPLOYEE_NAME: document.employee.name,
      PLACEHOLDER_EMPLOYEE_JOB_TITLE: document.employee.jobTitle.name,
      PLACEHOLDER_TRAVEL_PURPOSE: document.travel.purpose.name,
      PLACEHOLDER_TRAVEL_DESTINATION: document.travel.destination.name,
      PLACEHOLDER_COMPANY_NAME: document.employee.company.name,
      PLACEHOLDER_EMPLOYEE_ICN: document.employee.identity_card_number,
      PLACEHOLDER_EMPLOYEE_PNC: document.employee.personal_numeric_code,
      PLACEHOLDER_DATE_FROM: moment(document.travel.date_start).format('DD.MM.YYYY'),
      PLACEHOLDER_DATE_TO: moment(document.travel.date_end).format('DD.MM.YYYY'),
      PLACEHOLDER_DESTINATION_ARRIVAL_TIME: moment(document.travel.destination_arrival_time).format('DD.MM.YYYY HH:mm'),
      PLACEHOLDER_DESTINATION_LEAVE_TIME: moment(document.travel.destination_leave_time).format('DD.MM.YYYY HH:mm'),
      PLACEHOLDER_STARTPOINT_LEAVE_TIME: moment(document.travel.departure_leave_time).format('DD.MM.YYYY HH:mm'),
      PLACEHOLDER_STARTPOINT_ARRIVAL_TIME: moment(document.travel.departure_arrival_time).format('DD.MM.YYYY HH:mm'),
      PLACEHOLDER_MANAGER_LAST_NAME: document.employee.company.divisionManager.last_name,
      PLACEHOLDER_MANAGER_FIRST_NAME: document.employee.company.divisionManager.first_name,
      PLACEHOLDER_EMPLOYEE_LAST_NAME: document.employee.last_name,
      PLACEHOLDER_EMPLOYEE_FIRST_NAME: document.employee.first_name,
      PLACEHOLDER_TRAVEL_TOTAL_AMOUNT: document.travel.totalAmount,
      PLACEHOLDER_DAYS_ON_TRAVEL: document.travel.period,
      PLACEHOLDER_TRAVEL_ALLOWANCE: document.travel.travelAllowance
    }
  );
}

let printReimbursementDocument = (res, document) => {
  res.render(
    'documents/print/reimbursement', 
    { 
      layout: false,
      
      PLACEHOLDER_COST_CENTER: document.employee.company.cost_center,
      PLACEHOLDER_COMPANY_NAME: document.employee.company.name,
      PLACEHOLDER_EMPLOYEE_NAME: document.employee.name,
      PLACEHOLDER_EMPLOYEE_JOB_TITLE: document.employee.jobTitle.name,
      PLACEHOLDER_MANAGER_LAST_NAME: document.employee.company.divisionManager.last_name,
      PLACEHOLDER_MANAGER_FIRST_NAME: document.employee.company.divisionManager.first_name,
      PLACEHOLDER_REIMBURSEMENT_TOTAL_AMOUNT: document.totalAmount,
      reimbursements: document.reimbursements
    }
  );
}

/* GET documents listing. */
router.get('/', function(req, res, next) {
  models.Document.findAll(
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
  documentService.getDocumentById(req.params.documentId)
    .then(document => {
      res.render(
        'documents/show', 
        { 
          title: `Reimbursement | Show document #${document.id}`,
          document: document
        }
      );
    }).catch(err => {
      res.render(
        'error',
        {
          'message': 'Unable to display the requested document',
          'error': err
        }
      );
    })
});

router.get('/create', function(req, res, next) {  
  getDocumentFormData().then(formData => {
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

  models.sequelize.transaction(createDocumentTransaction => {
    return documentService.createDocument(params['document'], createDocumentTransaction)
      .then(document => {

        switch (parseInt(params['document']['type_id'])) {
          case models.DocumentType.build().travelTypeId:
            console.log('Creating a new Travel document');
            return documentService.createTravelDocument(document, params['travel'], createDocumentTransaction)
              .then(travel => {
                document.setTravel(travel);
                return document;
              });
      
          case models.DocumentType.build().reimbursementTypeId:
            console.log('Creating a new Reimbursement document');
            return new Promise((resolve, reject) => {
              params['reimbursement'].forEach(reimbursementParams => {
                console.log(reimbursementParams);
                documentService.createReimbursementDocument(document, reimbursementParams, createDocumentTransaction)
                  .then(reimbursement => {
                    document.addReimbursement(reimbursement);
                  });
              });
              resolve(document);
            });
        
          default: 
            throw 'Invalid document type';
        }
      });
  })
  .then(document => {
    console.log('Transaction has been committed');
    console.log('Added new document #'+document.id);
    res.redirect('/documents/show/'+document.id);
  })
  .catch(err => {
    console.log('Transaction has been rolled back');
    res.render(
      'error',
      {
        'message': 'Transaction has been rolled back',
        'error': err
      }
    );
  });
});

router.get('/edit/:documentId', function(req, res, next) {
  documentService.getDocumentById(req.params.documentId)
    .then(document => {
      getDocumentFormData(document)
        .then(formData => {
          res.render(
            'documents/edit', 
            { 
              title: `Reimbursement | Edit document #${document.id}`,
              document,
              formData
            }
          );
        });
      })
      .catch(err => {
        res.render(
          'error',
          {
            'message': 'Unable to edit the requested document',
            'error': err
          }
        );
      });
});

router.post('/edit/:documentId', function(req, res, next) {
  var params = req.body;

  models.sequelize.transaction(editDocumentTransaction => {
    return documentService.getDocumentById(req.params.documentId)
      .then(document => {
        return document.update(
          {
            employee_id: params['document']['employee_id'],
            status_id: params['document']['status_id']
          },
          {
            editDocumentTransaction
          }
        )
        .then(document => {
          if (document.isTravel) {
            return documentService.updateTravelDocument(document.travel, params['travel'], editDocumentTransaction)
              .then(travel => {
                return document;
              })
          } else if (document.isReimbursement) {
            return new Promise((resolve, reject) => {
              document.reimbursements.forEach(reimbursement => {
                var reimbursementParams = params.reimbursement[reimbursement.id];
                documentService.updateReimbursementDocument(reimbursement, reimbursementParams, editDocumentTransaction)
              });
              
              resolve(document);
            });
          }

          throw Error('Document type is invalid.');
        });
      });
    })
    .then(document => {
      console.log('Transaction has been committed');
      console.log('Updated document #'+document.id);
      res.redirect('/documents/show/'+document.id);
    }).catch(err => {
      console.log('Transaction has been rolled back');
      res.render(
        'error',
        {
          'message': 'Transaction has been rolled back',
          'error': err
        }
      );
    });
});

router.get('/print/:documentId', function(req, res, next) {
  documentService.getDocumentById(req.params.documentId)
  .then(document => {
    if (document.isTravel) {
      printTravelDocument(res, document);
    } else if (document.isReimbursement) {
      printReimbursementDocument(res, document);
    }
  }).catch(err => {
    res.render(
      'error',
      {
        'message': 'Unable to display the requested document',
        'error': err
      }
    );
  })
});

module.exports = router;
