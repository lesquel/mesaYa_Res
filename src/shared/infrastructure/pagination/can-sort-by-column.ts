/**
 * Can sort by column helper function.
 *
 * Checks if a column can be used for sorting in a query builder.
 */

import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export function canSortByColumn<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  column: string,
): boolean {
  const [alias] = column.split('.');

  if (!alias || alias === qb.alias) {
    return true;
  }

  try {
    const joinedAlias = qb.expressionMap.findAliasByName(alias);
    return Boolean(joinedAlias?.metadata);
  } catch {
    return false;
  }
}
