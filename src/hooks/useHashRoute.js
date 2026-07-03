import { useEffect, useState } from 'react';
import { forumRoute } from '../data/portalSections.js';

function readRoute() {
  const route = window.location.hash.replace(/^#\/?/, '');
  return route || forumRoute;
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    function handleHashChange() {
      setRoute(readRoute());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return route;
}
