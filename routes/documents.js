var express = require('express');
var router = express.Router();
var DocumentModel = require('../model/document')
var DocumentStatusModel = require('../model/documentStatus')

/* GET documents listing. */
router.get('/', function(req, res, next) {

  DocumentModel.findAll(
    { 
      order: [['status_id', 'ASC'], ['updated_at', 'DESC']], 
      include: ['status', 'employee'] 
    }
  )
  .then(documents => {
      res.render(
        'documents', 
        { 
          title: 'Reimbursements',
          documents: documents
        }
      );
    })
  });

module.exports = router;
