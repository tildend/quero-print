import { LoaderFunctionArgs } from "@remix-run/node";
import { recaptchaIsHuman } from "~/helpers/recaptcha.server";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const searchParams = new URLSearchParams(request.url);
  const recaptchaSecret = searchParams.get('recaptcha_secret');
  
  if (!recaptchaSecret) {
    return new Response('Missing recaptcha secret', { status: 400 }); 
  }
  
  return await recaptchaIsHuman(recaptchaSecret);
}