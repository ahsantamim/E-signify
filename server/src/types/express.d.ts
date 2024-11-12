import { User } from './path-to-user-interface' // Adjust the import path accordingly

declare global {
  namespace Express {
    interface Request {
      user?: User // Adjust 'User' to your actual user type/interface
    }
  }
}
