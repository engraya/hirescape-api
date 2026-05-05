import { Request, Response, NextFunction } from 'express';
export declare const isAuthenticated: (req: Request, res: Response, next: NextFunction) => Promise<void>;
