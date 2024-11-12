import { Router } from 'express'
import {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  getDeletedTemplates,
  restoreTemplate,
  permanentDeleteTemplate,
} from '../controllers/template.controller'
import {
  getInboxTemplates,
  sendTemplate,
  servePdf,
  getTemplateForSigning,
  submitSignedTemplate,
  getSentTemplates,
  downloadSignedTemplate,
  toggleFavorite,
} from '../controllers/templateActions.controller'
import { authenticateJWT } from '../middlewares/auth.middleware'
import upload from '../middlewares/multer'

const router = Router()

// Public routes (no authentication required)
router.get('/pdf/:filename', servePdf)
router.get('/:id/signing', getTemplateForSigning)
router.post('/:id/submit', submitSignedTemplate)

// Protected routes
router.use(authenticateJWT)

// Make sure /deleted and /sent routes are before /:id routes to avoid conflicts
router.get('/deleted', getDeletedTemplates)
router.get('/sent', getSentTemplates)
router.get('/inbox', getInboxTemplates);

// Other protected routes
router.post('/', upload.single('documentTemplateUrl'), createTemplate)
router.get('/', getTemplates)
router.get('/:id', getTemplateById)
router.put('/:id', updateTemplate)
router.delete('/:id', deleteTemplate)
router.post('/:id/send', sendTemplate)
router.get('/:id/download', downloadSignedTemplate)
router.post('/:id/toggle-favorite', toggleFavorite)
router.post('/:id/restore', restoreTemplate);
router.delete('/:id/permanent-delete', permanentDeleteTemplate);

export default router
