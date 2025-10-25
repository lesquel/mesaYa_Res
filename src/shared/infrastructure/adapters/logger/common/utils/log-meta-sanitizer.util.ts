export class LogMetaSanitizerUtil {
  static sanitize(value: unknown): unknown {
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }

    if (value && typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>).reduce<
        Record<string, unknown>
      >((acc, [key, nested]) => {
        acc[key] = this.sanitize(nested);
        return acc;
      }, {});
    }

    return value;
  }
}
