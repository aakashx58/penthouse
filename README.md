# Harborlux — Claim Your Summit

Harborlux is an immersive, single-page real-estate showcase for a private collection of harbour-view penthouses. The experience opens with a cinematic door reveal, layered city imagery, atmospheric video, and a choreographed headline before revealing the navigation and enquiry flow.

> The enquiry form is a front-end demonstration. Submissions are validated in the browser but are not currently persisted or sent to a server.

## Highlights

- **Cinematic intro:** A 7.4-second Web Animations timeline coordinates the doors, aerial reveal, headline, parallax layers, and navigation.
- **Layered hero scene:** Responsive back, mid, and foreground media create depth across desktop and mobile layouts.
- **Responsive typography:** The `Summit` headline is measured and scaled against a centered 16:9 stage.
- **Atmospheric media:** Tilt-shift and seamless rain videos are synchronized with the scene animation.
- **Immersive navigation:** Home, The Firm, Skyline Homes, and Talk To Us open accessible modal overlays.
- **Enquiry flow:** The private-viewing form includes client-side validation, residence selection, and a confirmation state.
- **Accessibility:** Semantic controls, visible focus states, keyboard dismissal, and `prefers-reduced-motion` support are included.
- **International UI:** The navigation includes English, French, and Traditional Chinese options.

## Tech Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- Lucide React
- Native Web Animations API

## Requirements

- Node.js `20.19+` or `22.12+`
- npm
- Chrome or Edge when using the included Visual Studio Code launch configurations

## Quick Start

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The development server binds to `0.0.0.0`, so it can also be reached from another device on your local network using the computer's IP address and port `3000`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite on port `3000` with hot module replacement. |
| `npm run build` | Create an optimized production build in `dist/`. |
| `npm run preview` | Serve the production build locally for a final check. |
| `npm run lint` | Run the TypeScript compiler in no-emit mode. |
| `npm run clean` | Remove generated build files. This script expects a POSIX-compatible shell. |

## Visual Studio Code Debugging

The repository includes ready-to-use configurations in [`.vscode/launch.json`](.vscode/launch.json) and a background Vite task in [`.vscode/tasks.json`](.vscode/tasks.json).

1. Open the project folder in Visual Studio Code.
2. Open the **Run and Debug** panel.
3. Select **Debug Vite app (Chrome)** or **Debug Vite app (Edge)**.
4. Press `F5`.

The Vite development server starts automatically before the browser launches. You can set breakpoints in TypeScript and TSX files under `src/`, and VS Code will map them to the original source.

> The launch configurations require the built-in **JavaScript Debugger** extension (`ms-vscode.js-debug`) or another debugger extension that supports the `chrome` and `msedge` debug types.

## Environment Variables

The current client does not read environment variables. [`.env.example`](.env.example) reserves `GEMINI_API_KEY` and `APP_URL` for future server-side Gemini and deployment integrations.

When those integrations are added, create a local `.env` file based on the example and never commit it:

```dotenv
GEMINI_API_KEY="your-api-key"
APP_URL="http://localhost:3000"
```

`.env` files are already excluded by [`.gitignore`](.gitignore).

## Production Build

Create and preview the optimized build:

```bash
npm run build
npm run preview
```

Deploy the generated `dist/` directory to any static hosting provider. The app does not currently require a backend to render.

## Project Structure

```text
penthouse/
├── .vscode/
│   ├── launch.json        # Chrome and Edge debugging configurations
│   └── tasks.json         # Background Vite development task
├── src/
│   ├── components/
│   │   ├── HeroOverlay.tsx  # Section content and enquiry dialog
│   │   └── Navbar.tsx       # Primary navigation and language selector
│   ├── App.tsx              # Hero animation and scene orchestration
│   ├── index.css            # Tailwind import and custom responsive styles
│   ├── main.tsx             # React entry point
│   └── media.ts             # Remote media URLs and responsive image sizing
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Media and Network Access

The hero images and videos are hosted externally and image assets are resized through the Higgs image proxy. A network connection is therefore required for the full visual experience. Media source URLs are defined in [`src/media.ts`](src/media.ts).
