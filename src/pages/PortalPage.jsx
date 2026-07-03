import { forumRoute, getPageByRoute } from '../data/portalSections.js';

const gallerySlots = [
  { type: 'photo', label: 'Photo', size: 'tall' },
  { type: 'video', label: 'Video', size: 'wide' },
  { type: 'blog', label: 'Mini Blog', size: 'medium' },
  { type: 'roleplay', label: 'Roleplay', size: 'short' },
  { type: 'photo', label: 'Photo', size: 'medium' },
  { type: 'video', label: 'Video', size: 'tall' },
  { type: 'blog', label: 'Mini Blog', size: 'short' },
  { type: 'roleplay', label: 'Roleplay', size: 'wide' }
];

const contentTypeByRoute = [
  ['photos', 'photo'],
  ['videos', 'video'],
  ['miniblogs', 'blog'],
  ['roleplays', 'roleplay']
];

function getVisibleSlots(page) {
  if (page.type !== 'subsection') return gallerySlots;

  const routeMatch = contentTypeByRoute.find(([routePart]) => page.route.includes(routePart));
  if (!routeMatch) return gallerySlots;

  const [, contentType] = routeMatch;
  const matchingSlots = gallerySlots.filter((slot) => slot.type === contentType);
  return [...matchingSlots, ...matchingSlots].slice(0, 4);
}

export function PortalPage({ route }) {
  const page = getPageByRoute(route);

  if (!page) {
    return (
      <section className="portal-page">
        <p className="portal-eyebrow">Portal</p>
        <h1>Page Not Found</h1>
        <p>The requested section is not available yet.</p>
        <a className="portal-action" href={`#/${forumRoute}`}>Back to Blog</a>
      </section>
    );
  }

  const visibleSlots = getVisibleSlots(page);

  return (
    <section className={`portal-page portal-page-${page.id}`}>
      <p className="portal-eyebrow">{page.parentLabel || 'Learning Section'}</p>
      <h1>{page.label}</h1>

      {page.type === 'section' && (
        <div className="portal-subsections" aria-label={`${page.label} pages`}>
          {page.items.map((item) => (
            <a className="portal-subsection-link" href={`#/${item.route}`} key={item.id}>
              {item.label}
            </a>
          ))}
        </div>
      )}

      <div className="portal-masonry" aria-label={`${page.label} content placeholders`}>
        {visibleSlots.map((slot, index) => (
          <article className={`portal-masonry-item portal-masonry-${slot.size}`} key={`${slot.type}-${index}`}>
            <span>{slot.label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
