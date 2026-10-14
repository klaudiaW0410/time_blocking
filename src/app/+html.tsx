import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Root HTML layout for Expo Router web rendering.
 * Ensures proper viewport height (100dvh), safe area insets (viewport-fit=cover),
 * and zero overflow so mobile browsers (iOS Safari / Android Chrome) never cut off navigation bars.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <ScrollViewStyleReset />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var _err = console.error;
                console.error = function() {
                  if (typeof arguments[0] === 'string' && arguments[0].indexOf('Unknown event handler property') !== -1) {
                    return;
                  }
                  return _err.apply(console, arguments);
                };
              })();
            `,
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: responsiveGlobalStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveGlobalStyles = `
html, body, #root {
  height: 100%;
  height: 100dvh;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
}
`;
