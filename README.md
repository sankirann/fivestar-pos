# Five Star Chicken - POS Billing System

Rebuilt POS billing app (billing, menu, inventory, reports) with two additions:

1. **Bluetooth thermal printer support** - connect a real 58mm/80mm BT thermal
   printer directly from the browser (Web Bluetooth, ESC/POS commands). Falls
   back to normal browser printing if no printer is connected or if the
   browser doesn't support Web Bluetooth.
2. **Monthly Sales report** - new "Monthly Sales" tab in Reports, with a
   month picker, day-by-day breakdown chart/table, and totals (sales, orders,
   GST, cash collected, avg order value, best day).

All data (bills, menu, inventory) is stored in the browser's localStorage,
same as the original app - no backend required.

## Run locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

Output goes to `dist/`.

## Deploy to Surge

```bash
npm install -g surge   # one-time
npm run build
cd dist
surge . your-app-name.surge.sh
```

`npm run build` automatically generates `dist/200.html` (a copy of
`index.html`). Surge serves `200.html` for any URL that doesn't match a real
file, so deep links like `/menu`, `/reports`, and `/inventory` load the app
correctly instead of Surge's "page not found" screen - this is what makes
client-side routing (React Router) work with a static host.

The build also uses absolute (`/...`) asset paths rather than relative
(`./...`) ones, so the JS/CSS/icons load correctly no matter which URL path
the app was first opened on.

## Install as an app (PWA)

Once deployed:

1. Open the Surge URL in **Chrome** (Android or desktop).
2. Chrome will show an "Install app" prompt in the address bar (desktop) or
   an "Add to Home screen" banner (Android). Tap it.
3. The app installs like a native app - opens in its own window/icon, works
   offline for pages already visited, no browser chrome.

If the install prompt doesn't appear automatically: Chrome menu (⋮) →
"Install Five Star Chicken..." / "Add to Home screen".

## Connecting a Bluetooth thermal printer

1. Turn on the printer and make sure it's in pairing/discoverable mode.
2. In the app, open **Billing → Proceed to Payment**.
3. Tap **"Connect Bluetooth Printer"** - Chrome will show a device picker.
   Select your printer.
4. Once connected, the "Print Bill" button becomes "Print via Bluetooth" and
   sends the receipt directly to the printer as raw ESC/POS commands.

**Notes:**
- Requires Chrome on Android or Chrome/Edge on desktop (Web Bluetooth isn't
  supported in Safari or Firefox).
- Tested against the common thermal-printer BLE service UUIDs used by most
  generic 58mm/80mm receipt printers. If your specific printer model uses a
  different service/characteristic UUID, let me know the model and I'll add
  it to `src/utils/bluetoothPrint.ts`.
- The Rupee symbol is printed as "Rs." on the thermal receipt since most
  cheap thermal printers' built-in font doesn't include the rupee glyph
  (this doesn't affect the on-screen bill, only the printed one).

## Notes on branding/assets

The app icons in `public/icons/` are simple placeholders ("FSC" on orange).
Swap in your client's actual logo (192x192 and 512x512 PNGs) before going
live - just replace those two files and rebuild.
