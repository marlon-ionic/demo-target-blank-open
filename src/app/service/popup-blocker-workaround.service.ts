import { Injectable } from '@angular/core';
import { InAppBrowser, OpenWebViewOptions, ToolBarType } from '@capgo/inappbrowser';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

/**
 * Service for handling the iOS Safari popup blocker workaround.
 *
 * This service solves the iOS popup blocker issue where external portals use `target="_blank"`
 * to trigger PDF downloads. iOS blocks these popups by default, preventing users from
 * accessing their documents.
 *
 * **Platform-specific approach:**
 * - **iOS**: Uses Capgo InAppBrowser plugin with JavaScript blob URL interception. The service
 *   injects a script that intercepts `window.open()` calls and redirects blob URLs to navigate
 *   directly in the current webview, bypassing Safari's popup blocker.
 * - **Android**: Uses Capacitor Browser plugin, which handles popups and downloads correctly
 *   without needing JavaScript interception.
 *
 * @example
 * ```typescript
 * constructor(private popupBlockerWorkaround: PopupBlockerWorkaroundService) {}
 *
 * openPortal() {
 *   const portalUrl = 'https://external-portal.example.com/documents';
 *   this.popupBlockerWorkaround.openPortal(portalUrl);
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class PopupBlockerWorkaroundService {

  constructor() {}

  /**
   * Opens an external portal in an in-app browser with blob URL interception.
   *
   * This method configures and opens the Capgo InAppBrowser plugin that:
   * 1. Injects a JavaScript interceptor at document start (before page scripts run)
   * 2. Intercepts `window.open()` calls for blob URLs
   * 3. Redirects blob URLs to `window.location.href` for native iOS PDF display
   *
   * The popup blocker issue occurs because:
   * - External portals use JavaScript to create blob URLs of files
   * - These blobs are opened with `target="_blank"` to trigger downloads
   * - iOS Safari blocks these popups for security, preventing download
   *
   * The solution:
   * - Override `window.open()` before page scripts run
   * - Detect blob URLs (urls starting with "blob:")
   * - Navigate to the blob URL in the current webview instead
   * - iOS then displays the PDF using its native PDF viewer
   *
   * @param {string} portalUrl - The URL to the external portal
   *                            Example: https://external-portal.example.com/documents
   *
   * @returns {Promise<void>} Resolves when the browser has been opened
   *
   * @throws {Error} Logs errors if the browser fails to open
   *
   * @example
   * ```typescript
   * const portalUrl = 'https://external-portal.example.com/documents';
   * await this.popupBlockerWorkaround.openPortal(portalUrl);
   * ```
   */
  async openPortal(portalUrl: string): Promise<void> {
    const isIOS = Capacitor.getPlatform() === 'ios';
    if (!isIOS) {
      // Android: Use Capacitor Browser plugin which handles popups and blob URLs natively
      await Browser.open({ url: portalUrl });
      return;
    }

    // iOS: Configure Capgo InAppBrowser with blob URL interception workaround
    const options: OpenWebViewOptions = {
      url: portalUrl,
      title: 'Demo PDF Page',
      toolbarType: ToolBarType.NAVIGATION,
      showReloadButton: true,
      activeNativeNavigationForWebview: true, // Required for iOS gesture bridge
      isPresentAfterPageLoad: true,
      preShowScriptInjectionTime: 'documentStart', // Inject before page JS runs

      /**
       * JavaScript code injected into the webview at document start (iOS only).
       *
       * This IIFE (Immediately Invoked Function Expression):
       * 1. Saves the original window.open function
       * 2. Replaces window.open with a custom function that:
       *    - Detects blob URLs (urls starting with "blob:")
       *    - For blobs: navigates to the blob URL directly (window.location.href)
       *    - For other URLs: calls the original window.open function
       * 3. Returns true for iOS (prevents "unsupported type" JavaScript errors)
       *
       * Result: PDFs open in the current webview instead of being blocked as popups
       */
      preShowScript: `
        (function() {
          const originalOpen = window.open;
          window.open = function(url, name, specs) {
            // Check for the Blob URL pattern (starts with "blob:")
            // This is how external portals create downloadable files
            if (url && url.indexOf('blob:') === 0) {
              // Navigate to the blob URL in the current webview
              // This allows iOS to display PDFs natively using its built-in PDF viewer
              window.location.href = url;
              return null; // Return null to prevent the original popup from opening
            }
            // For non-blob URLs, use the original window.open behavior
            return originalOpen.apply(this, arguments);
          };
          console.log('Blob URL Interceptor Injected (iOS)');
          return true; // Return a valid value to prevent iOS JavaScript errors
        })();
      `,
    };

    try {
      await InAppBrowser.openWebView(options);
    } catch (error) {
      console.error('Error opening browser:', error);
    }
  }
}

