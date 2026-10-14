export async function insertMissingTags(names, executor) {
  await executor.query('INSERT IGNORE INTO tags (name) VALUES ?', [names.map((name) => [name])]);
}

export async function findTagIdsByNames(names, executor) {
  const [rows] = await executor.query('SELECT id FROM tags WHERE name IN (?)', [names]);
  return rows.map(({ id }) => id);
}

export async function insertReviewTags(reviewId, tagIds, executor) {
  await executor.query(
    'INSERT INTO review_tags (review_id, tag_id) VALUES ?',
    [tagIds.map((tagId) => [reviewId, tagId])]
  );
}
