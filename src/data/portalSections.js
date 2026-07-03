export const forumRoute = 'forum';

export const portalSections = [
  {
    id: 'introduction',
    label: 'Introduction & Tests',
    route: 'introduction',
    summary: 'Base page for introductions, class guidelines, diagnostic activities, and tests.',
    items: [{ id: 'introduction-videos', label: 'Videos', route: 'introduction-videos' }]
  },
  {
    id: 'tourist-places',
    label: 'Tourist Places in Nari\u00f1o',
    route: 'tourist-places',
    summary: 'Base page for student content about destinations, geography, and local travel.',
    items: [
      { id: 'tourist-photos', label: 'Photos', route: 'tourist-photos' },
      { id: 'tourist-miniblogs', label: 'Mini Blogs', route: 'tourist-miniblogs' },
      { id: 'tourist-roleplays', label: 'Roleplays', route: 'tourist-roleplays' },
      { id: 'tourist-videos', label: 'Videos', route: 'tourist-videos' }
    ]
  },
  {
    id: 'food',
    label: 'Food from Nari\u00f1o',
    route: 'food',
    summary: 'Base page for traditional dishes, recipes, interviews, and food vocabulary.',
    items: [
      { id: 'food-photos', label: 'Photos', route: 'food-photos' },
      { id: 'food-miniblogs', label: 'Mini Blogs', route: 'food-miniblogs' },
      { id: 'food-roleplays', label: 'Roleplays', route: 'food-roleplays' },
      { id: 'food-videos', label: 'Videos', route: 'food-videos' }
    ]
  },
  {
    id: 'carnival',
    label: 'Discovering Our Carnival',
    route: 'carnival',
    summary: 'Base page for the Blacks and Whites Carnival, traditions, characters, and stories.',
    items: [
      { id: 'carnival-photos', label: 'Photos', route: 'carnival-photos' },
      { id: 'carnival-miniblogs', label: 'Mini Blogs', route: 'carnival-miniblogs' },
      { id: 'carnival-roleplays', label: 'Roleplays', route: 'carnival-roleplays' },
      { id: 'carnival-videos', label: 'Videos', route: 'carnival-videos' }
    ]
  },
  {
    id: 'crafts',
    label: 'Crafts from My Nari\u00f1o',
    route: 'crafts',
    summary: 'Base page for local crafts, artisan processes, and student presentations.',
    items: [
      { id: 'crafts-photos', label: 'Photos', route: 'crafts-photos' },
      { id: 'crafts-miniblogs', label: 'Mini Blogs', route: 'crafts-miniblogs' },
      { id: 'crafts-roleplays', label: 'Roleplays', route: 'crafts-roleplays' },
      { id: 'crafts-videos', label: 'Videos', route: 'crafts-videos' }
    ]
  },
  {
    id: 'evaluation',
    label: 'Evaluation',
    route: 'evaluation',
    summary: 'Base page for rubrics, final evidence, teacher feedback, and evaluation resources.',
    items: [{ id: 'evaluation-videos', label: 'Videos', route: 'evaluation-videos' }]
  }
];

export function getPageByRoute(route) {
  for (const section of portalSections) {
    if (section.route === route) {
      return { ...section, parentLabel: null, type: 'section' };
    }

    const item = section.items.find((sectionItem) => sectionItem.route === route);
    if (item) {
      return {
        ...item,
        parentLabel: section.label,
        summary: `${item.label} page for ${section.label}. Content and activities can be added here later.`,
        type: 'subsection'
      };
    }
  }

  return null;
}
