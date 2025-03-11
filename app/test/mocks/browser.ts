import type { RequestHandler } from 'msw';
import { setupWorker } from 'msw/browser';

const handlers: RequestHandler[] = [];

export const worker = setupWorker(...handlers);
