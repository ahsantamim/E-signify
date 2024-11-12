import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Return void here
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication token missing or invalid' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    ;(req as any).user = decoded // Attach decoded user info to request object
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
