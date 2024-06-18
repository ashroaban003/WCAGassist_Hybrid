const express = require("express");
const { addLog, getAllLogs, deleteAllLogs } = require('../controllers/PostController.js')

const router = express.Router();

router.post('/', addLog);
router.get('/', getAllLogs);
router.delete('/', deleteAllLogs)

module.exports = router;