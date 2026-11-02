const express = require('express');
const {
  createViolation,
  getViolations,
  updateViolation,
  deleteViolation,
} = require('../controllers/violationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.use(protect);
router.get('/', getViolations);
router.post('/', authorize('admin', 'auditor'), createViolation);
router.put('/:id', authorize('admin', 'auditor'), updateViolation);
router.delete('/:id', authorize('admin'), deleteViolation);

module.exports = router;
