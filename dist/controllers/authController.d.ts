import { Request, Response } from 'express';
export declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const logout: (_req: Request, res: Response) => Promise<void>;
export declare const getAllUsers: (_req: Request, res: Response) => Promise<void>;
export declare const getUserById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
