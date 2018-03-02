const express = require('express');
const router = express.Router();
const hbs = require('hbs');
const models = require('../models');

hbs.registerHelper('documentStatusBadge', (status_id) => {
  if (status_id === 1) {
    return 'danger';
  }

  if (status_id === 2) {
    return 'warning';
  }

  if (status_id === 3) {
    return 'success';
  }
});

hbs.registerHelper('documentTypeIcon', (type_id) => {
  if (type_id === 1) {
    return 'truck';
  }

  if (type_id === 2) {
    return 'dollar-sign';
  }
});

var getDocumentFormData = (document = undefined) => {
  var formData = {};
  return models.Employee
    .findAll(
      { 
        attributes: ['id', 'last_name', 'first_name'],
        order: [['last_name', 'ASC'], ['first_name', 'ASC']]
      }
    )
    .then(employees => {
      employees.forEach(element => {
        element.isDefaultValue = document && (document.employee_id == element.id);
      });
      formData.employees = employees;

      return models.DocumentType
        .findAll()
        .then(documentTypes => {
          documentTypes.forEach(element => {
            element.isDefaultValue = document && (document.type_id == element.id);
          });
          formData.documentTypes = documentTypes;

          return models.DocumentStatus
            .findAll()
            .then(documentStatuses => {
              documentStatuses.forEach(element => {
                element.isDefaultValue = document && (document.status_id == element.id);
              });
              formData.documentStatuses = documentStatuses;

              return models.ReimbursementType
                .findAll()
                .then(reimbursementTypes => {
                  formData.reimbursementTypes = reimbursementTypes;
              
                  return models.TravelPurpose
                    .findAll()
                    .then(travelPurposes => {
                      travelPurposes.forEach(element => {
                        element.isDefaultValue = document && document.isTravel && (document.travel.purpose_id == element.id);
                      });
                      formData.travelPurposes = travelPurposes;

                      return models.TravelDestination
                        .findAll()
                        .then(travelDestinations => {
                          travelDestinations.forEach(element => {
                            element.isDefaultValue = document && document.isTravel && (document.travel.destination_id == element.id);
                          });
                          formData.travelDestinations = travelDestinations;

                          return formData;
                        })
                    });
                });
            });
        });
    });
};

var createNewDocument = (params, transaction) => {
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

var createNewTravelDocument = (document, params, transaction) => {
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

var createNewReimbursementDocument = (document, params, transaction) => {
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

var getDocumentById = documentId => {
  return models.Document.findById(
    documentId,
    { 
      include: [{ all: true, nested: true }]
    }
  )
  .then(document => {
    if (document == undefined) {
      throw Error(`Document with id #${documentId} was not found.`);
    }

    return document;
  });
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
  models.Document.findById(
    req.params.documentId,
    { 
      include: [{ all: true, nested: true }]
    }
  )
  .then(document => {
    if (document === undefined) {
      throw Error(`Document with id #${req.params.documentId} was not found.`);
    }
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
    return createNewDocument(params['document'], createDocumentTransaction)
      .then(document => {

        switch (parseInt(params['document']['type_id'])) {
          case models.DocumentType.build().travelTypeId:
            console.log('Creating a new Travel document');
            return createNewTravelDocument(document, params['travel'], createDocumentTransaction)
              .then(travel => {
                document.setTravel(travel);
                return document;
              });
      
          case models.DocumentType.build().reimbursementTypeId:
            console.log('Creating a new Reimbursement document');
            return new Promise((resolve, reject) => {
              params['reimbursement'].forEach(reimbursementParams => {
                console.log(reimbursementParams);
                createNewReimbursementDocument(document, reimbursementParams, createDocumentTransaction)
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
  }).then(document => {
    console.log('Transaction has been committed');
    console.log('Added new document #'+document.id);
    res.redirect('/documents/show/'+document.id);

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

router.get('/edit/:documentId', function(req, res, next) {
  getDocumentById(req.params.documentId)
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
    getDocumentById(req.params.documentId)
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
            return document.travel.update(
              {
                employee_id: document.employee_id,
                purpose_id: params['travel']['purpose_id'],
                destination_id: params['travel']['destination_id'],
                date_start: params['travel']['date_start'],
                date_end: params['travel']['date_end'],
                departure_leave_time: params['travel']['departure_leave_time'],
                destination_arrival_time: params['travel']['destination_arrival_time'],
                destination_leave_time: params['travel']['destination_leave_time'],
                departure_arrival_time: params['travel']['departure_arrival_time']
              }
            )
            .then(travel => {
              return document;
            })
          } else if (document.isReimbursement) {
            document.reimbursements.forEach(reimbursement => {
              var reimbursementParams = params.reimbursement[reimbursement.id];
              reimbursement.update(
                {
                  employee_id: reimbursementParams['employee_id'],
                  type_id: reimbursementParams['type_id'],
                  number: reimbursementParams['number'],
                  date: reimbursementParams['date'],
                  value: reimbursementParams['value'],
                }
              );
            });

            return document;
          }

          throw Error('Document type is invalid.');
        });
      })
      .then(document => {
        console.log('Transaction has been committed');
        console.log('Updated document #'+document.id);
        res.redirect('/documents/show/'+document.id);

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
});

module.exports = router;
