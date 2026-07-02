import { RequestHandler } from "express";

export interface IAIChatController {
    askChatbot: RequestHandler
}