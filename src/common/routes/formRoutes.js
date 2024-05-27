const express = require('express');
const { saveForm, getForm } = require('../controllers/formController');
const router = express.Router();

router.post('/form', saveForm);
router.get('/form/:formId/:language', getForm);

module.exports = router;
