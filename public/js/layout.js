import { createElement, getInitial } from './dom.js';
import { createIcon } from './icons.js';
import { createPlayer } from './player.js';
import { clearCurrentUser, requireCurrentUser } from './session.js';
import { homePagePath, loginPagePath } from './config.js';

const navigationItems = [
  { id: 'home', label: 'Inicio', icon: 'home', href: homePagePath },
  { id: 'songs', label: 'Canciones', icon: 'music', href: '/songs.html' },
  { id: 'artists', label: 'Artistas', icon: 'microphone', href: '/artists.html' },
  { id: 'albums', label: 'Álbumes', icon: 'disc', href: '/albums.html' },
  { id: 'reviews', label: 'Reseñas', icon: 'star', href: '/reviews-list.html' },
  { id: 'playlists', label: 'Mis playlists', icon: 'list', href: '/playlists.html' }
];

function createBrand() {
  return createElement('a', { className: 'brand', attributes: { href: homePagePath } }, [
    createElement('span', { className: 'brand-mark' }, [createIcon('wave')]),
    createElement('span', { className: 'brand-name' }, [
      createElement('span', { className: 'brand-sound', text: 'Sound' }),
      createElement('span', { className: 'brand-nest', text: 'Nest' })
    ])
  ]);
}

function createSidebar(activePage) {
  const links = navigationItems.map(({ id, label, icon, href }) => {
    const link = createElement('a', { className: id === activePage ? 'nav-item is-active' : 'nav-item', attributes: { href } }, [createIcon(icon), label]);
    return createElement('li', {}, [link]);
  });

  return createElement('aside', { className: 'sidebar' }, [
    createBrand(),
    createElement('nav', { attributes: { 'aria-label': 'Navegación principal' } }, [
      createElement('ul', { className: 'nav-list' }, links)
    ])
  ]);
}

function logout() {
  clearCurrentUser();
  window.location.replace(loginPagePath);
}

function createTopbar(user) {
  const logoutButton = createElement('button', { className: 'icon-button', attributes: { type: 'button', 'aria-label': 'Cerrar sesión', title: 'Cerrar sesión' } }, [createIcon('logout')]);
  logoutButton.addEventListener('click', logout);

  return createElement('header', { className: 'topbar' }, [
    createElement('div', { className: 'user-chip' }, [
      createElement('span', { className: 'avatar', text: getInitial(user.name) }),
      createElement('span', { text: user.name })
    ]),
    logoutButton
  ]);
}

export function renderAppShell(activePage) {
  const user = requireCurrentUser();

  if (!user) {
    return null;
  }

  const pageContent = createElement('main', { className: 'page-content' });

  document.body.replaceChildren(
    createElement('div', { className: 'app-shell' }, [
      createSidebar(activePage),
      createElement('div', { className: 'main-area' }, [createTopbar(user), pageContent]),
      createPlayer()
    ])
  );

  return { user, pageContent };
}
