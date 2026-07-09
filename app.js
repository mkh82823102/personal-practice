
const themeToggle = document.querySelector('.theme-toggle');
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeToggle?.setAttribute('aria-label', theme === 'dark' ? 'Change to light theme' : 'Change to dark theme');
}

setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

themeToggle?.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

const toggleIcon = document.querySelector('.nav__toggle-icon');
const menu = document.querySelector('.menu');
const cover = document.querySelector('.cover');
const header = document.querySelector('.header');
const menuLinks = document.querySelectorAll('.menu__link[href^="#"]');

toggleIcon?.addEventListener('click', () => {
  toggleIcon.classList.toggle('active');
  menu?.classList.toggle('active');
  cover?.classList.toggle('cover--show');
});

function closeMobileMenu() {
  toggleIcon?.classList.remove('active');
  menu?.classList.remove('active');
  cover?.classList.remove('cover--show');
}

function setActiveMenuLink(activeLink) {
  menuLinks.forEach((link) => link.classList.remove('menu__link--active'));
  activeLink?.classList.add('menu__link--active');
}

menuLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    const targetSection = document.querySelector(targetId);

    if (!targetSection) return;

    event.preventDefault();

    const headerHeight = header ? header.offsetHeight : 0;
    const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    setActiveMenuLink(link);
    closeMobileMenu();
  });
});

window.addEventListener('scroll', () => {
  const headerHeight = header ? header.offsetHeight : 0;
  const scrollPosition = window.pageYOffset + headerHeight + 80;

  menuLinks.forEach((link) => {
    const targetSection = document.querySelector(link.getAttribute('href'));

    if (!targetSection) return;

    const sectionTop = targetSection.offsetTop;
    const sectionBottom = sectionTop + targetSection.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      setActiveMenuLink(link);
    }
  });
});

cover?.addEventListener('click', closeMobileMenu);

class ResumeTabs {
  constructor(menuSelector, panelSelector, indicatorSelector) {
    this.menu = document.querySelector(menuSelector);

    if (!this.menu) return;

    this.menuItems = this.menu.querySelectorAll('.resume__nav-item');
    this.panels = document.querySelectorAll(panelSelector);
    this.indicator = document.querySelector(indicatorSelector);

    this.init();
  }

  init() {
    const activeItem = this.menu.querySelector('.resume__nav-item--active') || this.menuItems[0];
    this.moveIndicator(activeItem, false);

    this.menuItems.forEach((item) => {
      item.addEventListener('click', (event) => this.handleClick(item, event));
    });

    window.addEventListener('resize', () => {
      const current = this.menu.querySelector('.resume__nav-item--active');
      if (current) this.moveIndicator(current, false);
    });
  }

  handleClick(item, event) {
    this.setActiveMenuItem(item);
    this.moveIndicator(item, true);
    this.createRipple(item, event);
    this.popIcon(item);
    this.showPanel(item.getAttribute('data-tab'));
  }

  setActiveMenuItem(activeItem) {
    this.menuItems.forEach((item) => item.classList.remove('resume__nav-item--active'));
    activeItem.classList.add('resume__nav-item--active');
  }

  moveIndicator(item, animate) {
    if (!this.indicator || !item) return;

    this.indicator.style.transition = animate
      ? 'transform 0.45s cubic-bezier(0.65, 0, 0.35, 1), height 0.3s ease'
      : 'none';
    this.indicator.style.height = `${item.offsetHeight}px`;
    this.indicator.style.transform = `translateY(${item.offsetTop}px)`;
  }

  createRipple(item, event) {
    const oldRipple = item.querySelector('.resume__nav-ripple');
    if (oldRipple) oldRipple.remove();

    const rect = item.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');

    ripple.className = 'resume__nav-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${(event ? event.clientX - rect.left : rect.width / 2) - size / 2}px`;
    ripple.style.top = `${(event ? event.clientY - rect.top : rect.height / 2) - size / 2}px`;

    item.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  popIcon(item) {
    item.classList.remove('resume__nav-item--icon-pop');
    void item.offsetWidth;
    item.classList.add('resume__nav-item--icon-pop');
  }

  showPanel(targetId) {
    this.panels.forEach((panel) => {
      panel.classList.toggle('resume__panel--active', panel.id === targetId);
    });
  }
}

new ResumeTabs('#resumeMenu', '.resume__panel', '#menuIndicator');

class PortfolioFilter {
  constructor(listSelector, gridSelector) {
    this.links = document.querySelectorAll(`${listSelector} .portfolio__link`);
    this.cards = document.querySelectorAll(`${gridSelector} .portfolio__card`);

    this.init();
  }

  init() {
    this.links.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        this.handleClick(link);
      });
    });
  }

  handleClick(link) {
    this.setActiveLink(link);
    this.filterCards(link.getAttribute('data-filter'));
  }

  setActiveLink(activeLink) {
    this.links.forEach((link) => link.classList.remove('portfolio__link--active'));
    activeLink.classList.add('portfolio__link--active');
  }

  filterCards(filter) {
    this.cards.forEach((card) => {
      const categories = card.getAttribute('data-category').split(' ');
      const shouldShow = filter === 'all' || categories.includes(filter);

      card.classList.remove('portfolio__card--enter');

      if (shouldShow) {
        card.classList.remove('portfolio__card--hidden');
        void card.offsetWidth;
        card.classList.add('portfolio__card--enter');
      } else {
        card.classList.add('portfolio__card--hidden');
      }
    });
  }
}

new PortfolioFilter('.portfolio__list', '#portfolioGrid');
