import { homePagePath } from './config.js';
import { createElement } from './dom.js';
import { createIcon } from './icons.js';

export function createBrand(href = homePagePath) {
  return createElement('a', { className: 'brand', attributes: { href } }, [
    createElement('span', { className: 'brand-mark' }, [createIcon('wave')]),
    createElement('span', { className: 'brand-name' }, [
      createElement('span', { className: 'brand-sound', text: 'Sound' }),
      createElement('span', { className: 'brand-nest', text: 'Nest' })
    ])
  ]);
}
