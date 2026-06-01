// Category normalization, search, and grouping

export const normalizeCategoryKey = (name) => (name || '').trim().toLowerCase();

/** Unique display names; merges "abc" and "Abc" using the most-used spelling. */
export function getUniqueCategories(items) {
  const map = new Map();

  for (const item of items || []) {
    const raw = (item.category || '').trim();
    if (!raw) continue;

    const key = normalizeCategoryKey(raw);
    let entry = map.get(key);

    if (!entry) {
      entry = { spellings: {} };
      map.set(key, entry);
    }
    entry.spellings[raw] = (entry.spellings[raw] || 0) + 1;
  }

  return [...map.values()]
    .map((entry) => {
      let bestName = '';
      let bestCount = 0;
      for (const [name, count] of Object.entries(entry.spellings)) {
        if (count > bestCount || (count === bestCount && name.localeCompare(bestName, undefined, { sensitivity: 'base' }) < 0)) {
          bestName = name;
          bestCount = count;
        }
      }
      return bestName;
    })
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

export function findExactCategory(query, categories) {
  const key = normalizeCategoryKey(query);
  if (!key) return null;
  return categories.find((c) => normalizeCategoryKey(c) === key) || null;
}

function scoreCategoryMatch(query, category) {
  const q = normalizeCategoryKey(query);
  const c = normalizeCategoryKey(category);
  if (!q || !c) return 0;
  if (c === q) return 1000;
  if (c.startsWith(q)) return 500 + (q.length / c.length) * 100;
  if (c.includes(q)) return 300 + (q.length / c.length) * 50;

  const words = c.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(q)) return 250 + (q.length / word.length) * 30;
  }

  let qi = 0;
  for (const char of c) {
    if (char === q[qi]) qi += 1;
    if (qi === q.length) return 100 + qi * 10;
  }

  return 0;
}

/** Top N fuzzy/partial suggestions, ordered by relevance. */
export function getCategorySuggestions(query, categories, limit = 5) {
  const q = (query || '').trim();
  if (!q) return [];

  const exact = findExactCategory(q, categories);
  if (exact) return [];

  return categories
    .map((name) => ({ name, score: scoreCategoryMatch(q, name) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
    .slice(0, limit)
    .map((x) => x.name);
}

export function resolveCategoryForSave(input, categories) {
  const trimmed = (input || '').trim();
  if (!trimmed) return trimmed;
  return findExactCategory(trimmed, categories) || trimmed;
}

export function categoriesMatch(a, b) {
  return normalizeCategoryKey(a) === normalizeCategoryKey(b);
}

export function filterItemsByCategory(items, categoryFilter) {
  if (!categoryFilter) return items || [];
  return (items || []).filter((item) => categoriesMatch(item.category, categoryFilter));
}

/** Sales that include at least one product in the selected category. */
export function filterSalesByCategory(sales, items, categoryFilter) {
  if (!categoryFilter) return sales || [];
  const itemIds = new Set(filterItemsByCategory(items, categoryFilter).map((i) => i.id));
  return (sales || []).filter((sale) =>
    (sale.items || []).some((line) => itemIds.has(line.itemId))
  );
}

/** Group items under one header per category (case-insensitive). */
export function groupItemsByCategory(items) {
  const canonicalByKey = new Map(
    getUniqueCategories(items).map((name) => [normalizeCategoryKey(name), name])
  );
  const groups = new Map();

  for (const item of items || []) {
    const raw = (item.category || '').trim();
    const key = normalizeCategoryKey(raw) || '__uncategorized__';
    const label = canonicalByKey.get(key) || raw || 'Uncategorized';

    if (!groups.has(key)) {
      groups.set(key, { label, items: [] });
    }
    groups.get(key).items.push(item);
  }

  return [...groups.values()].sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
  );
}
