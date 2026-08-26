import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Atmosphere } from "@/components/atmosphere";
import { Dock } from "@/components/dock";
import { StayHydrate } from "@/components/stay-hydrate";
import appCss from "../styles.css?url";

const APP_NAME = "Selah";

function Shell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const fullBleed = pathname === "/" || pathname === "/immerse" || pathname === "/bible" || pathname === "/journey" || pathname === "/house";
  return (
    <>
      {fullBleed ? null : <Atmosphere />}
      <Outlet />
      <Dock />
    </>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0b0c0a" },
      {
        name: "description",
        content: "Beholding creation until wonder becomes worship.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg font-sans">
        <PreviewHostBridge />
        <AuthProvider>
          <StayHydrate />
          <Shell />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
