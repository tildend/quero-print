export const recaptchaIsHuman = async (token: string) => {
  if (!process.env.RECAPTCHA_SECRET) {
    throw new Error('Missing RECAPTCHA_SECRET');
  }
  
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET,
      response: token,
    }),
  });

  return await response.json();
};