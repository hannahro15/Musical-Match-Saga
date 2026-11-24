// a11yPages.test.js - axe checks for the two static policy pages (#288)
//
// privacy.html and accessibility.html are shipped alongside the game, so they
// get the same automated check as index.html. Colour contrast stays off in
// jsdom, as in a11y.test.js.

import fs from 'fs';
import path from 'path';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
  },
};

function loadPage(file) {
  const html = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
  const body = html.match(/<body>([\s\S]*)<\/body>/);
  if (!body) throw new Error(`${file} has no <body>`);
  document.body.innerHTML = body[1];
}

describe.each(['privacy.html', 'accessibility.html'])('%s', (file) => {
  test('has no axe violations', async () => {
    loadPage(file);
    expect(await axe(document.body, AXE_OPTIONS)).toHaveNoViolations();
  });
});
