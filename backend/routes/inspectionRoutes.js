const express = require('express');
const {
  createInspection,
  getInspections,
  getInspectionById,
  updateInspection,
  deleteInspection,
} = require('../controllers/inspectionController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.use(protect);
router.get('/', getInspections);
router.get('/:id', getInspectionById);
router.post('/', authorize('admin', 'auditor'), createInspection);
router.put('/:id', authorize('admin', 'auditor'), updateInspection);
router.delete('/:id', authorize('admin'), deleteInspection);

module.exports = router;
