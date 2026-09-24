# Local preview

Use the included preview server so extensionless URLs behave like production:

```powershell
npm run preview
```

Then open `http://127.0.0.1:8765/`.

On Windows, you can also double-click `start-preview.cmd`.

To use another port:

```powershell
node preview-server.js 5500
```

The server maps clean URLs such as `/business` and
`/health/cyclospora-outbreak-declining-fda-foreign-inspections` to the existing
HTML files. It redirects `.html` and trailing-slash variants to the clean URL,
matching the production URL policy.

The shared browser script also converts clean internal links to `.html` only
when the site is opened through localhost or a private-network IP. This keeps
navigation working in basic static servers such as VS Code Live Server without
changing production URLs, canonical tags, the sitemap, or the HTML source links.
