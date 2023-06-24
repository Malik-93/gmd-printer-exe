import express, { Router, Request, Response } from 'express';
import printerRoutes from './printer.routes';
const router: Router = express.Router();
router.get("/", (_req: Request, _res: Response) => {
    return _res.status(200).json({ active: true, message: 'Printer app is up and running...' })
});
router.use('/api/printer', printerRoutes);
export = router;