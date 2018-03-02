var express = require('express');
var router = express.Router();
const models = require('../models');
const documentService = require('../services/documentService');

var getDocumentFormData = () => {
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

                  return formData;
                });
            });
        });
    });
};

router.get('/create/:documentId', function(req, res, next) {
  documentService.getDocumentById(req.params.documentId)
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

  models.sequelize.transaction(createReimbursementTransaction => {
    return documentService.getDocumentById(req.params.documentId)
      .then(document => {
        console.log('Creating a new Reimbursement document');

        return new Promise((resolve, reject) => {
          params.reimbursement.forEach(reimbursementParams => {

            return documentService.createReimbursementDocument(document, reimbursementParams, createReimbursementTransaction)
              .then(reimbursement => {
                document.addReimbursement(reimbursement);
              });
            });

          resolve(document);
        });
      });
  })
  .then(document => {
    console.log('Transaction has been committed');
    console.log('Added new reimbursement for document #'+document.id);
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

module.exports = router;