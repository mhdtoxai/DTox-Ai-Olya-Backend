const express = require('express');
const router = express.Router();
const getQuestionnaireInfo = require('../controllers/getQuestionnaireInfo');

router.post('/onboarding', getQuestionnaireInfo);

module.exports = router;
