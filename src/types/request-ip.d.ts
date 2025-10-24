declare module "request-ip" {
  import { RequestHandler } from "express";
  export function getClientIp(req: any): string | undefined;
  export function mw(): RequestHandler;
  const requestIp: { getClientIp: typeof getClientIp; mw: typeof mw };
  export default requestIp;
}
