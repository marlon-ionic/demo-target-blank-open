# iOS Popup Blocker Workaround Demo

A demonstration of how to intercept and handle blocked downloads on iOS when working with external portals that you don't control.

## Problem

Many external portals use `target="_blank"` to trigger downloads. iOS Safari blocks these popups by default, preventing users from accessing their documents.

### Why It Happens

- External portals use JavaScript to create blob URLs of files
- These blobs are opened with `target="_blank"` to trigger downloads
- iOS Safari (including WKWebView and SafariViewController) blocks popups for security reasons
- The download never completes, and users see a blank screen

### Limitations

The download code runs on the external portal's servers, not in your app. You can't modify how they handle downloads, making this a challenging problem to solve.

## Solution

This demo shows how to intercept blob URLs at the JavaScript level and redirect them to the current webview, allowing iOS to display PDFs natively—**without needing to modify the external URL's behavior**.

### How It Works

1. **Inject JavaScript before page loads** - Use `preShowScriptInjectionTime: 'documentStart'`
2. **Override window.open()** - Detect blob URLs (starting with `blob:`)
3. **Redirect to current webview** - Use `window.location.href` to navigate to the blob URL
4. **Native PDF display** - iOS automatically opens PDFs in its built-in viewer

### Key Technologies

- **Capgo InAppBrowser** - Open web content in a native browser container (iOS)
- **Capacitor Browser** - Standard browser plugin for Android
- **JavaScript Injection** - Override `window.open()` before page scripts run (iOS only)
- **Blob URL Detection** - Identify downloads that would be blocked

## Implementation

See [PopupBlockerWorkaroundService](src/app/service/popup-blocker-workaround.service.ts) for the complete implementation with comments.

### Basic Usage

```typescript
constructor(private popupBlockerWorkaround: PopupBlockerWorkaroundService) {}

openPortal() {
  const portalUrl = 'https://external-portal.example.com/documents';
  this.popupBlockerWorkaround.openPortal(portalUrl);
}
```

## Platform Support

- **iOS**: ✅ Works with Capgo InAppBrowser + blob URL interception workaround
- **Android**: ✅ Works with Capacitor Browser plugin (no workaround needed)
- **Web**: Blobs open in browser tab (normal behavior)

## Implementation Details

**iOS**: Uses Capgo InAppBrowser plugin with JavaScript interception
- Injects a script that overrides `window.open()` to detect blob URLs
- Navigates blob URLs directly in the webview, bypassing the popup blocker

**Android**: Uses Capacitor Browser plugin
- Opens the portal in the system browser
- Handles popups and blob URLs correctly without additional workarounds

## Notes

This is a workaround for external portals you don't control. It should not be the preferred solution. The external content should be updated to work without requiring users to disable Safari's popup blocker. If the portal maintainers cannot or will not fix it, a more modern portal or integration should be used.

If you own the portal, consider:
- Using direct PDF links instead of blob URLs
- Implementing server-side download mechanisms
- Using fetch with proper CORS headers

### Security Considerations

⚠️ **Future iOS Versions**: Apple could prevent this technique in future iOS releases by:
- Restricting JavaScript injection in WKWebView
- Preventing overrides of `window.open()`
- Blocking blob URL navigation
- Enforcing stricter Content Security Policies

This workaround relies on current Safari/WebKit behavior. Monitor Apple's security updates and test thoroughly on new iOS versions before release.

## References

- [Capgo InAppBrowser Documentation](https://capgo.app/docs/plugins/inappbrowser/)
- [Capacitor Browser Plugin](https://capacitorjs.com/docs/apis/browser)
- [Understanding window.open() Behavior on iOS Safari](https://dontpaniclabs.com/blog/post/2025/07/29/understanding-window-open-behavior-on-ios-safari)
- [Window.open() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
- [Blob URLs in JavaScript](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
