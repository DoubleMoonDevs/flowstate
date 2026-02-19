import { Router } from 'express';
import { authRequired } from '../middleware/auth';
import { list, get, create, update, remove } from '../controllers/calendarController';

const router = Router();

router.use(authRequired);
router.get('/', list);
router.get('/:id', get);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
