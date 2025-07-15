import { Router } from 'express';

export abstract class BaseRoute {
    protected _router: Router;

    constructor() {
        this._router = Router();
    }

    // Abstract method to initialize routes
    protected abstract initializeRoutes(): void;

    // Method to get the router instance
    public get router(): Router {
        return this._router;
    }
}