const express = require('express');
const { saveForm, getForm,saveResponses} = require('../controllers/formController');
const router = express.Router();

router.post('/form', saveForm);
router.get('/form/:formId/:language', getForm);
router.post('/saveResponses', saveResponses);

module.exports = router;
