import express, {Application} from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import morgan from 'morgan';
import { config } from './config/env';
import { DependencyInjection } from "./di/index";
import { AuthRoutes } from "./routes/auth/auth.routes";
import { AdminRoutes } from "./routes/admin/admin.routes";
import { container } from "tsyringe";
import logger from "./shared/utils/logger.helper";
import { corsOption } from "./middlewares/cors.middleware";
import { errorMiddleware } from "./middlewares/error.handler.middleware";

export default class App {
    private _app: Application;
    private _port: number;

    constructor() {
        this._app = express();
        this._port = config.server.PORT;
        this.initialize();
    }

    private initialize(): void {
        
        DependencyInjection.registerDependencies(); // Register dependencies
        //resolver
        this.configureMiddleware();
        this.configureRoutes();
        this._app.use(errorMiddleware)
        
    }

    private configureMiddleware(): void {
        this._app.use(express.json());
        this._app.use(cors(corsOption));
        this._app.use(cookieParser());
        this._app.use(morgan('combined', {
            stream:{
                write: (message) => logger.http(message.trim())
            }
        }))
        this._app.use(express.urlencoded({ extended: true }));
        
        //  middleware configurations 
    }

    private configureRoutes(): void {
        // Define routes here
        this._app.get("/", (req, res) => {
            res.send("Welcome to the Travel Log API");
        });
        this._app.use("/api/v1/auth", container.resolve(AuthRoutes).router);
        this._app.use('/api/v1/admin', container.resolve(AdminRoutes).router);
    }

    public start(): void {
        this._app.listen(this._port, () => {
            logger.info(`Server is running on http://localhost:${this._port}`);
        });
    }
}

