const express = require('express');
const { saveOpinionsQuestion,getOpinions,saveResponsesgOpinions} = require('../controllers/saveOpinionesController');
const router = express.Router();

router.post('/saveOpinionesQuest', saveOpinionsQuestion);
router.get('/formOpiniones/:formId/:language', getOpinions);
router.post('/saveResponsesgOpinions', saveResponsesgOpinions);

module.exports = router;
