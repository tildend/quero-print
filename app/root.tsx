import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { ColorSchemeScript, createTheme, MantineColorsTuple, MantineProvider } from "@mantine/core";

import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import 'swiper/css';

import "./tailwind.css";
import { LinksFunction } from "@remix-run/node";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

const print: MantineColorsTuple = [
  '#eef3ff', // zircon
  '#dce4f5', // link-water
  '#b9c7e2', // periwinkle-gray
  '#94a8d0', // polo-blue
  '#748dc1', // ship-cove
  '#5f7cb8', // steel-blue
  '#5474b4', // san-marino
  '#44639f', // queen-blue
  '#39588f', // chinese-blue
  '#2d4b81' // metallic-blue
];

const theme = createTheme({
  colors: {
    print
  },
  primaryColor: 'print',
  fontFamily: 'Outfit, sans-serif'
});

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body
        className="
          bg-gradient-to-br
          from-[var(--mantine-color-print-0)]
          to-[var(--mantine-color-print-6)]
        "
      >
        <MantineProvider theme={theme}>
          <Notifications autoClose={4000} />
          <ModalsProvider>
            {children}
          </ModalsProvider>
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
  { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
  { rel: "manifest", href: "/site.webmanifest" },
];