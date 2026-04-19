import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import Organization from '../models/Organization';
import CandidateProfile from '../models/CandidateProfile';
import config from '../config';
import { ok, fail } from '../utils/apiResponse';
import { requireAuth } from '../middleware/auth';
import { IUser } from '../models/User';

const router: Router = express.Router();

function createAccessToken(user: IUser): string {
  const payload = {
    sub: user._id.toString(),
    role: user.role,
  };
  
  const options: SignOptions = {
    expiresIn: config.jwtAccessExpires as any,
  };
  
  return jwt.sign(payload, config.jwtAccessSecret as Secret, options);
}

function createRefreshToken(user: IUser): string {
  const payload = {
    sub: user._id.toString(),
  };
  
  const options: SignOptions = {
    expiresIn: config.jwtRefreshExpires as any,
  };
  
  return jwt.sign(payload, config.jwtRefreshSecret as Secret, options);
}

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { role, fullName, email, password, companyName } = req.body;

    if (!role || !fullName || !email || !password) {
      return fail(res, 400, 'VALIDATION_ERROR', 'role, fullName, email and password are required');
    }

    if (!['recruiter', 'candidate'].includes(role)) {
      return fail(res, 400, 'VALIDATION_ERROR', 'role must be recruiter or candidate');
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return fail(res, 409, 'CONFLICT', 'Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      role,
      fullName,
    });

    if (role === 'recruiter') {
      const orgName = companyName?.trim() || `${fullName}'s Company`;
      const baseSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'company';
      const slug = `${baseSlug}-${String(user._id).slice(-6)}`;
      const org = await Organization.create({ name: orgName, slug, ownerUserId: user._id });
      user.organizationId = org._id;
      await user.save();
    }

    if (role === 'candidate') {
      await CandidateProfile.create({
        userId: user._id,
        source: 'rankr',
        fullName,
        professionalTitle: 'Candidate',
        location: '',
        yearsExperience: 0,
        skills: [],
        education: '',
        summary: '',
        completionPct: 20,
      });
    }

    const token = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    return ok(res, {
      token,
      refreshToken,
      user: {
        id: user._id,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        organizationId: user.organizationId,
      },
    });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return fail(res, 400, 'VALIDATION_ERROR', 'email and password are required');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return fail(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return fail(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const token = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    return ok(res, {
      token,
      refreshToken,
      user: {
        id: user._id,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        organizationId: user.organizationId,
      },
    });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  return ok(res, {
    id: req.user._id,
    role: req.user.role,
    fullName: req.user.fullName,
    email: req.user.email,
    organizationId: req.user.organizationId,
  });
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return fail(res, 400, 'VALIDATION_ERROR', 'Refresh token is required');
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, config.jwtRefreshSecret as Secret);
    } catch (err: any) {
      return fail(res, 401, 'INVALID_TOKEN', 'Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
      return fail(res, 404, 'NOT_FOUND', 'User not found');
    }

    const token = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user); // Optional: Rotate refresh token

    return ok(res, {
      token,
      refreshToken: newRefreshToken,
    });
  } catch (error: any) {
    return fail(res, 500, 'INTERNAL_ERROR', error.message);
  }
});

export default router;
