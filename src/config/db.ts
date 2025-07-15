import mongoose from "mongoose";
import { config } from "./env";

 export class ConnectDB {
    private _dburl: string;

    constructor(){
        this._dburl = config.database.DB_URL;
    }

    async connect() {
        try {
            await mongoose.connect(this._dburl);
            console.log("Database connected successfully");
        } catch (error) {
            console.error("Database connection failed:", error);
            throw error; 
        }
    }
}    
