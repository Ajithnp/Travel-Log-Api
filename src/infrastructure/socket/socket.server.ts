import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

import {
  SocketData,
} from './types/socket.types';
import { config } from '../../config/env';
import logger from '../../config/logger';
import { Namespace } from 'socket.io';

export class SocketServer {

  private static instance: SocketServer;
  private _io: Server;
  
  private constructor(httpServer: HttpServer) {
    this._io = new Server(httpServer, {
      cors: {
        origin: config.cors.ALLOWED_ORIGINS,
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        credentials: true,
      },
        transports: ['websocket', 'polling'],
        // pingTimeout: 60000,
        // pingInterval: 25000,
    });

    // Initialize namespaces


    // Store namespace reference for use in NotificationService
   

    logger.info('SocketServer initialized with namespaces: /notifications, /chat');
  }

  public static getInstance(httpServer?: HttpServer): SocketServer {
    if (!SocketServer.instance) {
      if (!httpServer) {
        throw new Error('HttpServer required on first SocketServer initialization');
      }
      SocketServer.instance = new SocketServer(httpServer);
    }
    return SocketServer.instance;
  }


  public get io(): Server {
    return this._io;
  }
}