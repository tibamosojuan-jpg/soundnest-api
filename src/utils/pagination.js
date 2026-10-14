const defaultPage = 1;
const defaultLimit = 20;

export async function fetchPage(fetchItems, { page, limit }) {
  const pageNumber = Number(page ?? defaultPage);
  const pageSize = Number(limit ?? defaultLimit);
  const items = await fetchItems({ limit: pageSize, offset: (pageNumber - 1) * pageSize });

  return { items, page: pageNumber, limit: pageSize };
}
