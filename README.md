# Recipe Box

A single-page recipe site.

- `index.html` - the app (search, food/drinks filter, cook mode, shopping list)
- `recipes.json` - the data. **This is the only file that changes when recipes are added.**

Live site: https://inline421.github.io/recipe-box/

## How recipes get added

Claude commits `recipes.json` directly through the Zapier GitHub connection - no browser, no local machine required. Send Claude a recipe link in chat and it lands on the live site.

Each recipe is an object with: `id`, `kind` ("food" or "drink"), `title`, `totalTime`, `servings`, `tags`, `source`, `url`, `ingredients`, `steps`, `notes`, `rating`, `createdAt`.

`components` (optional) holds a make-ahead base that must be prepared first; it renders in a highlighted panel above the main ingredients.

Sort order is by `createdAt`, newest first.

## Notes

- Page is marked `noindex` so search engines skip it, but the URL is public
- Viewers' checked ingredients and shopping lists stay on their own device
- GitHub Pages can serve a cached copy for a few minutes after a commit
