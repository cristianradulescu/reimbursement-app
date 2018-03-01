var express = require('express');
var router = express.Router();
var db = require('../db');
var model = require('../model/models.js');

var getDocumentFormData = () => {
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

          return model.DocumentStatusModel
            .findAll()
            .then(documentStatuses => {
              formData.documentStatuses = documentStatuses;

              return model.ReimbursementTypeModel
                .findAll()
                .then(reimbursementTypes => {
                  formData.reimbursementTypes = reimbursementTypes;

                  return formData;
                });
            });
        });
    });
};

var getDocumentById = documentId => {
  return model.DocumentModel.findById(
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

router.get('/create/:documentId', function(req, res, next) {
  return getDocumentById(req.params.documentId)
    .then(document => {
      if (document == undefined) {
        throw Error(`Document with id #${documentId} was not found.`);
      }

      getDocumentFormData(document)
        .then(formData => {
          res.render(
            'reimbursements/create', 
            { 
              title: `Reimbursement | Add reimbursement on document #${document.id}`,
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

router.post('/create/:documentId', function(req, res, next) {
  var params = req.body;

  db.connection.transaction(createReimbursementTransaction => {
    return getDocumentById(req.params.documentId)
      .then(document => {
        console.log('Creating a new Reimbursement document');

        return new Promise((resolve, reject) => {
          params['reimbursement'].forEach(reimbursementParams => {
            console.log(reimbursementParams);

            return model.ReimbursementModel.create(
              {
                'employee_id': reimbursementParams['employee_id'],
                'type_id': reimbursementParams['type_id'],
                'number': reimbursementParams['number'],
                'date': reimbursementParams['date'],
                'value': reimbursementParams['value'],
              },
              {
                createReimbursementTransaction
              }
            )
            .then(reimbursement => {
              document.addReimbursement(reimbursement);
            });
          });

          resolve(document);
        });
      });
  }).then(document => {
    console.log('Transaction has been committed');
    console.log('Added new reimbursement for document #'+document.id);
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

module.exports = router;