import { authService } from '../services/authService.js';

export const AuthController = {
  /**
   * POST /api/auth/signup
   */
  async signup(req, res, next) {
    try {
      const result = authService.signup(req.body);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Signup failed'
      });
    }
  },

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const result = authService.login(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Authentication failed'
      });
    }
  },

  /**
   * GET /api/auth/me
   */
  async me(req, res) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
      const user = authService.getUserFromToken(token);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token'
        });
      }

      return res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to authenticate profile'
      });
    }
  },

  /**
   * POST /api/auth/logout
   */
  async logout(req, res) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const result = authService.logout(token);
    return res.status(200).json(result);
  }
};
