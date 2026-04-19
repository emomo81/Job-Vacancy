import express, { Request, Response, Router } from 'express';

import User from '../models/User';
import Organization from '../models/Organization';
import { requireAuth } from '../middleware/auth';
import { ok, fail } from '../utils/apiResponse';

const router: Router = express.Router();

router.get('/settings/account', requireAuth, async (req: Request, res: Response) => {
  try {
    return ok(res, {
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.patch('/settings/account', requireAuth, async (req: Request, res: Response) => {
  try {
    const { fullName, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          fullName: fullName ?? req.user.fullName,
          email: email ? String(email).toLowerCase() : req.user.email,
        },
      },
      { new: true }
    ).lean();

    if (!user) return fail(res, 404, 'NOT_FOUND', 'User not found');

    return ok(res, {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.get('/settings/profile-summary', requireAuth, async (req: Request, res: Response) => {
  try {
    const organization = req.user.organizationId
      ? await Organization.findById(req.user.organizationId).lean()
      : null;

    return ok(res, {
      fullName: req.user.fullName,
      role: req.user.role,
      organizationName: organization?.name || '',
    });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

export default router;
