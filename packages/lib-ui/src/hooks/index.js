// packages/lib-ui/src/hooks/index.js
// @warungku/lib-ui — shared React hooks

import { useState, useCallback } from 'react';
import Cookies from 'js-cookie';

const COOKIE_OPTS = { expires: 365, sameSite: 'strict' };

// ─── useModal ─────────────────────────────────────────────────────────────────
export const useModal = () => {
  const [isOpen, setOpen] = useState(false);
  const [data,   setData] = useState(null);

  const open  = useCallback((d = null) => { setData(d); setOpen(true); }, []);
  const close = useCallback(() => { setOpen(false); setData(null); }, []);

  return { isOpen, data, open, close };
};

// ─── useCookiePrefs ───────────────────────────────────────────────────────────
export const useCookiePrefs = () => {
  const [activePage, setPageState] = useState(() => Cookies.get('wk_page') || 'kasir');
  const [shopName,   setShopState] = useState(() => Cookies.get('wk_shop') || 'Warung Pak Ahmad');
  const [ownerName,  setOwnerState]= useState(() => Cookies.get('wk_owner')|| 'Pemilik');

  const setActivePage = useCallback((v) => { Cookies.set('wk_page',  v, COOKIE_OPTS); setPageState(v); }, []);
  const setShopName   = useCallback((v) => { Cookies.set('wk_shop',  v, COOKIE_OPTS); setShopState(v); }, []);
  const setOwnerName  = useCallback((v) => { Cookies.set('wk_owner', v, COOKIE_OPTS); setOwnerState(v);}, []);

  return { activePage, setActivePage, shopName, setShopName, ownerName, setOwnerName };
};
