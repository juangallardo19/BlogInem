# Blog INEM Frontend

React + Vite frontend for the INEM student portal. The home view keeps the forum first, and the top navigation links to prepared pages for introductions, tourist places, food, carnival, crafts, and evaluation content.

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Project Structure

- `src/App.jsx`: main forum workflow, upload form, publications, comments, and admin modal.
- `src/components/`: reusable React components such as the top navigation.
- `src/data/`: portal section configuration used by navigation and pages.
- `src/hooks/`: small reusable React hooks.
- `src/pages/`: placeholder portal pages ready for future content.
- `src/api.js`: Google Apps Script API access.
- `src/react.css`: React-specific layout and navigation styles.
- `style.css`: legacy/shared visual styles from the previous implementation.

## Navigation

The app uses hash routes, so no extra router dependency is required:

- `#/forum`
- `#/tourist-places`
- `#/tourist-photos`
- `#/food`
- `#/carnival`
- `#/evaluation`

The dropdown menus are available on hover and keyboard focus.
