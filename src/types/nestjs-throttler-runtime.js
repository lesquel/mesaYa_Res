// Minimal runtime shim for @nestjs/throttler used in tests when the package
// is not installed. Exports no-op decorators and basic classes to satisfy
// runtime imports during Jest execution.

function noopDecorator() {
  return function () {
    // returns a decorator function that does nothing
    return function () {};
  };
}

class ThrottlerModule {
  static forRoot() {
    return {};
  }
  static forRootAsync() {
    return {};
  }
}

class ThrottlerGuard {
  canActivate() {
    return true;
  }
}

module.exports = {
  ThrottlerModule,
  ThrottlerGuard,
  Throttle: noopDecorator(),
  SkipThrottle: noopDecorator(),
};
