import { useEffect, useState } from "react";

export const useRecaptcha = () => {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  if (!ready && typeof grecaptcha !== 'undefined') {
    grecaptcha.ready(() => {
      setReady(true);
    });
  }

  const execute = (action: string) => {
    if (ready) {
      setLoading(true);
      grecaptcha.execute(
        '6LdcBDUqAAAAALEly2iQJPeaf4hftTMaFaa3HhTb',
        { action }
      ).then(token => {
        setToken(token);
        setLoading(false);
      });
    } else {
      throw new Error('Recaptcha não está pronto');
    }
  }

  useEffect(() => {
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('src', 'https://www.google.com/recaptcha/api.js?render=6LdcBDUqAAAAALEly2iQJPeaf4hftTMaFaa3HhTb');
    document.body.appendChild(scriptTag);

    return () => {
      document.body.removeChild(scriptTag);
    }
  }, []);

  return { token, execute, loading };
}