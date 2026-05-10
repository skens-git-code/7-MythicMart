import { useEffect, useState } from 'react';
import { normalizeRoute, ROUTES } from '../utils/routes';

export const useRoute = () => {
  const [route, setRoute] = useState(() => normalizeRoute());

  useEffect(() => {
    const syncRoute = () => {
      setRoute(normalizeRoute());
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('hashchange', syncRoute);
    if (!window.location.hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${ROUTES.HOME}`);
    }

    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  return route;
};
