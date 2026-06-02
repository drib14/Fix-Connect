import { Router } from 'express';
import { CurrencyController } from '../controllers/CurrencyController.js';

const router = Router();
const ctrl = new CurrencyController();

// Public routes — no auth required
router.get('/rates', ctrl.getRates);
router.get('/detect', ctrl.detectCurrency);
router.get('/list', ctrl.getCurrencyList);

export default router;
