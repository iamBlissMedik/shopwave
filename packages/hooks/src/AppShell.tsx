import 'server-only';

import type { ReactNode } from 'react';
import { Nunito_Sans } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { dehydrate } from '@tanstack/react-query';
import { AppProviders } from './AppProviders';
import { qk } from './queryKeys';
import { getServerSession, makeServerQueryClient } from './server';
import { themeNoFlashScript } from './themeNoFlashScript';

// Geist = display/headings (self-hosted via the `geist` package, exposes
// --font-geist-sans), Nunito Sans = body. Both surface as CSS variables the
// shared Tailwind preset reads (--font-display / --font-sans).
// `adjustFontFallback: false` — Next has no fallback metrics for Nunito Sans,
// so there is nothing to adjust (and it would log a build error otherwise).
const sans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  adjustFontFallback: false,
});

/**
 * The `<html>` document shared by the user, merchant and admin root layouts
 * (import via `@shopwave/hooks/shell`): fonts, the no-flash theme script, the
 * provider stack, and the session resolved on the server and seeded into the
 * client cache, so the first HTML already renders the right navbar.
 *
 * The session is only seeded when the API gave a definite answer. If it was
 * unavailable, the browser asks for itself instead of caching "signed out".
 */
export async function AppShell({ navbar, children }: { navbar: ReactNode; children: ReactNode }) {
  const queryClient = makeServerQueryClient();
  const session = await getServerSession();
  if (session.status !== 'unavailable') {
    queryClient.setQueryData(qk.me(), session.status === 'signed-in' ? session.user : null);
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${GeistSans.variable}`}
    >
      <head>
        {/* Set the theme class before paint to avoid a flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
      </head>
      <body>
        <AppProviders state={dehydrate(queryClient)}>
          {navbar}
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
