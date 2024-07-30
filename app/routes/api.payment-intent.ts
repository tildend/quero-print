import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing env");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST": {
      const { amount, currency } = await request.json();
      if (!amount || !currency) {
        return json(Error("Missing amount or currency"), { status: 400 });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
      });

      return json({
        clientSecret: paymentIntent.client_secret
      });
    }
  }
}
