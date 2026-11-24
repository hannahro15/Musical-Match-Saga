# Contributing

Thanks for wanting to help with Musical Match Saga! 🎵

> [!IMPORTANT]
> Please wait until an issue is assigned to you before you start working on it or open a pull request. Comment on the issue to say you'd like to take it, and I'll assign it to you. This stops two people working on the same thing.

## Finding something to work on

- New to the project? Look for issues labelled [`good first issue`](https://github.com/hannahro15/Musical-Match-Saga/issues?q=is%3Aissue%20is%3Aopen%20label%3A%22good%20first%20issue%22). They're small, self-contained tasks that are a good place to start.
- Want something bigger? Issues labelled [`help wanted`](https://github.com/hannahro15/Musical-Match-Saga/issues?q=is%3Aissue%20is%3Aopen%20label%3A%22help%20wanted%22) are ones I'd especially welcome help with. Some of them, like testing with a screen reader or on different phones, don't need any coding.
- Each issue has a MoSCoW label (`Must Have`, `Should Have`, `Could Have`) showing how important it is.
- Check the [project board](https://github.com/users/hannahro15/projects/16) to see what's already in progress.
- Comment on the issue to say you'd like to work on it, and wait for me to assign it to you before you start, so two people don't work on the same thing. If an assigned issue has no updates for 2 weeks, I may unassign it so someone else can pick it up. Just comment again if you'd like it back.
- Found a bug or have an idea that isn't in the [issues](https://github.com/hannahro15/Musical-Match-Saga/issues) yet? You're welcome to [open a new issue](https://github.com/hannahro15/Musical-Match-Saga/issues/new). Please check the existing issues first so it isn't a duplicate, and wait for a reply before you write any code, so we can agree on the approach.

## Setting up

The game is plain HTML, CSS and JavaScript, so there's no build step. You'll need [Node.js](https://nodejs.org/) 24.x or 26.x to run the tests and the linter.

The required GitHub check is **Tests pass**. It succeeds only when tests pass on every Node.js version in the `test.yml` matrix, so the Node.js versions can change without changing the required check.

1. Fork this repository, then clone your fork:
   ```bash
   git clone https://github.com/<your-username>/Musical-Match-Saga.git
   cd Musical-Match-Saga
   ```
2. Select the Node.js version the project expects, then install the exact dependency tree:
   ```bash
   nvm use        # or: fnm use
   npm ci
   ```
   Please use npm rather than yarn or pnpm, so `package-lock.json` stays the only lockfile.
3. Start a local web server:
   ```bash
   npx serve .
   ```
   Then open the address it prints in your browser (usually `http://localhost:3000`, but `serve` picks another port if that one is busy). Opening `index.html` straight from your file system won't work, because browsers block JavaScript modules on `file://` pages.

## Making a change

1. Make sure your fork has the latest changes. On your fork's GitHub page, click **Sync fork** → **Update branch**, then pull them down:
   ```bash
   git switch main
   git pull
   ```
2. Create a branch from `main`:
   ```bash
   git switch -c short-description-of-change
   ```
3. Keep each pull request to one issue that's been assigned to you, and keep it small.
4. If you add or change a level in `src/levels.js`, play it through to check it can be won with the moves and time it gives.
5. Check your change works on a phone-sized screen and using only a keyboard.
6. Add or update tests in `__tests__/` for any change to how the game behaves.
7. Write short commit messages in the present tense, for example `Add a favicon`.
8. Before you open a pull request, make sure both of these pass:
   ```bash
   npm test
   npm run lint
   ```
9. Open a pull request and write `Closes #<issue number>` in the description. If your change affects how the game looks, add a screenshot.

The game is already deployed at [hannahro15.github.io/Musical-Match-Saga](https://hannahro15.github.io/Musical-Match-Saga/), so you don't need to deploy anything. Your changes go live automatically once I've merged them.

## Helping without coding

Some issues, like testing with a screen reader or on different phones, need testing rather than code. For those, you don't need a pull request. Post what you found as a comment on the issue:

- What you used: device, operating system, browser and any assistive technology, with versions
- What you tried, and what happened
- Anything that didn't work as you expected, with a screenshot or recording if you can

If you find a new problem along the way, you're welcome to open a new issue for it.

## Images, audio and fonts

Please don't add any images, audio clips or fonts to the project without asking first. Open an issue, or comment on the one you're working on, saying what you'd like to add and where it's from, and wait for my approval before including it in a pull request. Pull requests that add these files without approval won't be merged.

Once I've agreed, only add files you have the right to share, and say where they came from and what licence they're under in your pull request. Please also add them to the Credits section of the README. Free-to-download sound effects and icons often still don't allow redistribution, so please check.

Screenshots in your pull request description are fine, because they don't get added to the project.

## Response times

Response times vary depending on my schedule, but I'll do my best to reply to issues and comments, and to review pull requests, as quickly as I can. If you haven't heard back after a week, feel free to leave a friendly reminder on the issue or pull request. Thanks for your patience!

## Getting help

Stuck? Ask in the issue and I'll help.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE). The only exception is approved images, audio and fonts, which keep their own licence, stated in your pull request and listed in the README's Credits.

## Code of conduct

By taking part, you agree to follow the [code of conduct](CODE_OF_CONDUCT.md).
