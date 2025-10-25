export class LogSectionFormatterUtil {
  static format(label: string, value?: string | null): string | null {
    if (!value || typeof value !== 'string') {
      return null;
    }

    const indented = value
      .split('\n')
      .map((line) => `    ${line}`)
      .join('\n');

    return `  ${label}:\n${indented}`;
  }
}
