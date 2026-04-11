import { emitter } from '@/shared/events';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Emit navigation request event.
 * @param params - Navigation parameters.
 */
export function navigateProgrammatically(params: { pathname: string }) {
  emitter.emit('navigationRequest', params);
}

/**
 * TODO: migrate to {const router = createBrowserRouter(...) + <RouterProvider router={router} />}:
 * https://reactrouter.com/en/main/upgrading/v6-data
 */
export function ProgrammaticNavigationHelper() {
  const navigate = useNavigate();
  useEffect(() => {
    return emitter.on('navigationRequest', ({ pathname }) => {
      navigate({ pathname });
    });
  }, [navigate]);
  return null;
}
