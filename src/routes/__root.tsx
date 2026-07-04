import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MuscleCars.ai — Premium Muscle Car Marketplace, Valuations & Community" },
      { name: "description", content: "The definitive digital marketplace for high-performance muscle cars. Professional-grade AI valuations, portfolio tracking, and expert negotiation services for serious collectors and dealers." },
      { name: "keywords", content: "muscle cars, classic cars, car marketplace, muscle car valuation, car collecting, muscle car for sale, hemi, camaro, mustang, GTO" },
      { property: "og:title", content: "MuscleCars.ai — Premium Muscle Car Marketplace & Community" },
      { property: "og:description", content: "Professional-grade AI valuations, portfolio tracking, and expert negotiation for serious muscle car collectors and dealers." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://1e492a047379233056524352bb6fcf8b.ctonew.app" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MuscleCars.ai — Premium Muscle Car Marketplace" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  notFoundComponent: () => <div>Page not found</div>,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
