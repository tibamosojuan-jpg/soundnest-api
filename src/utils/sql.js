export function toWhereClause(conditions) {
  return conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
}
