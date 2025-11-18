// Lightweight ambient declarations to satisfy TypeScript for @nestjs/throttler
// This file exists to allow builds in environments where the actual package
// is not installed. It only provides minimal types used across the project.
declare module '@nestjs/throttler' {
  // Module bootstrap helpers (forRoot / forRootAsync) are functions returning any
  export class ThrottlerModule {
    static forRoot(options?: ThrottlerModuleOptions): any;
    static forRootAsync(options?: any): any;
  }

  export interface ThrottlerModuleOptions {
    ttl?: number;
    limit?: number;
    ignoreUserAgents?: RegExp[];
    storage?: any;
    // allow additional unknown props
    [key: string]: any;
  }

  // Decorator factories used in the codebase
  // Accept a flexible argument shape because the project uses the decorator
  // both with positional args and with an options object ({ default: { ttl, limit } }).
  export function Throttle(...args: any[]): MethodDecorator & ClassDecorator;
  export function SkipThrottle(
    ...args: any[]
  ): MethodDecorator & ClassDecorator;

  // Guard stub
  export class ThrottlerGuard {
    canActivate?(...args: any[]): any;
  }

  // Re-export types if code imports them directly
  export { ThrottlerGuard as ThrottlerGuardToken };
}
