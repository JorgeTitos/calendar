# Contributing

Thanks for wanting to help! This is a small project, so the process is light.

```bash
npm install
npm run dev          # local site
npm run typecheck && npm test && npm run build   # what CI runs
```

- Keep changes focused; one idea per pull request.
- Add or update a test when you touch the logic in `src/lib/`.
- No new runtime dependencies without a good reason: the project is deliberately tiny.
- Don't commit secrets, `.env` files or personal data. `.env.example` is the template.
- Photos must be public domain or under a licence that allows reuse, with credit in the README.

Ideas that are especially welcome are listed at the end of the [README](README.md).

By contributing you agree that your work is released under the [MIT licence](LICENSE).
