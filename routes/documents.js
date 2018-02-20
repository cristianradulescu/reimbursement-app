var express = require('express');
var router = express.Router();
var hbs = require('hbs');
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
      include: ['employee', 'status', 'type', 'reimbursements', 'travel'] 
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

router.get('/new/', function(req, res, next) {
  var employeesData = [];
  var documentTypes = [];

  var getEmployees = () => {
    return model.EmployeeModel.findAll(
      { 
        attributes: ['id', 'last_name', 'first_name'],
        order: [['last_name', 'ASC'], ['first_name', 'ASC']] 
      }
    );
  };

  var getDocumentTypes = () => {
    return model.DocumentTypeModel.findAll();
  };

  getEmployees().then(employees => {
    getDocumentTypes().then(documentTypes => {
      res.render(
        'documents/new', 
        { 
          title: 'Reimbursement | Create new document',
          employees: employees,
          documentTypes: documentTypes
        }
      );
    });
  });
}).post('/new', function(req, res, next) {
  console.log(req);
  res.send(JSON.stringify(req.body));
});

module.exports = router;
