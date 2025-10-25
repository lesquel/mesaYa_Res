import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

/**
 * Guard personalizado de throttling que funciona correctamente detrás de proxies
 *
 * Extrae la IP real del cliente desde los headers de proxy:
 * - X-Forwarded-For
 * - X-Real-IP
 * - X-Client-IP
 *
 * Útil cuando la aplicación está detrás de:
 * - NGINX
 * - Apache
 * - Load balancers
 * - Cloudflare
 * - AWS ALB/ELB
 */
@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async getTracker(req: Request): Promise<string> {
    // Intenta obtener la IP real desde los headers de proxy
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const clientIp = req.headers['x-client-ip'];

    // X-Forwarded-For puede contener múltiples IPs separadas por comas
    // La primera IP es la del cliente original
    if (forwarded && typeof forwarded === 'string') {
      const ips = forwarded.split(',');
      return ips[0].trim();
    }

    // Fallback a otros headers comunes
    if (realIp && typeof realIp === 'string') {
      return realIp;
    }

    if (clientIp && typeof clientIp === 'string') {
      return clientIp;
    }

    // Si no hay headers de proxy, usa la IP de la conexión directa
    return req.ip || 'unknown';
  }
}
