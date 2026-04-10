import { walletPort } from '@/shared/channel';
import { emitter } from '@/shared/events';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isObj } from 'src/shared/is-obj';

export function SessionResetHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnameRef = useRef(location.pathname);
  pathnameRef.current = location.pathname;
  useEffect(() => {
    function messageHandler(message: unknown) {
      if (isObj(message) && message.payload === 'session-logout') {
        emitter.emit('sessionLogout');
        if (pathnameRef.current !== '/login') {
          navigate('/login');
        }
      }
    }
    const { port } = walletPort;
    if (port) {
      port.onMessage.addListener(messageHandler);
      return () => {
        port.onMessage.removeListener(messageHandler);
      };
    }
  }, [navigate]);
  return null;
}
