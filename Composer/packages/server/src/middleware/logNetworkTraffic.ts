// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { NextFunction, Request, Response } from 'express';

import { WebSocketServer } from '../directline/utils/webSocketServer';

let hasHookedIntoSend = false;
export function logNetworkTraffic(req: Request, res: Response, next?: NextFunction) {
  if (!hasHookedIntoSend) {
    // hook into .send() so that it stores the data it sends on the response object
    const originalSend = res.send.bind(res);
    res.send = (data) => {
      (res as any).sentData = data;
      return originalSend(data);
    };
    hasHookedIntoSend = true;
  }

  // when the request finishes, log the payload and status code to the client
  res.once('finish', () => {
    const data = {
      request: { method: req.method, payload: req.body, route: req.originalUrl },
      response: {
        payload: JSON.parse((res as any).sentData || '{}'),
        statusCode: res.statusCode,
      },
      timestamp: new Date().toISOString(),
      trafficType: 'network' as 'network',
    };
    WebSocketServer.sendNetworkTrafficToSubscribers(data);
  });
  next?.();
}
