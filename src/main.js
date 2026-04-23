import './main.scss';

const app = document.querySelector('#app');
const resume = readResumeData();

function readResumeData() {
  const dataElement = document.querySelector('#resume-data');

  if (!dataElement) {
    throw new Error('Missing resume data: add a script#resume-data JSON block to index.html.');
  }

  return JSON.parse(dataElement.textContent);
}

function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);

  if (options.className) {
    element.className = options.className;
  }

  if (options.text) {
    element.textContent = options.text;
  }

  if (options.href) {
    element.href = options.href;
    element.rel = 'noopener noreferrer';
  }

  if (options.src) {
    element.src = options.src;
  }

  if (options.alt) {
    element.alt = options.alt;
  }

  return element;
}

function appendChildren(parent, children) {
  children.filter(Boolean).forEach((child) => parent.appendChild(child));
  return parent;
}

function renderLink({ label, value, href, icon }) {
  const link = createElement('a', {
    className: 'footer-link',
    href,
    text: label || value,
  });

  if (icon) {
    link.prepend(createElement('img', {
      className: 'footer-link-img',
      src: icon,
      alt: '',
    }));
  }

  return link;
}

function renderSectionHeader(title) {
  return appendChildren(createElement('header', { className: 'section-hd' }), [
    createElement('span', { className: 'section-title-l' }),
    createElement('h2', { className: 'section-title', text: title }),
    createElement('span', { className: 'section-title-r' }),
  ]);
}

function renderBullets(items = []) {
  const list = createElement('ul', { className: 'section-content' });

  items.forEach((item) => {
    list.appendChild(createElement('li', { text: item }));
  });

  return list;
}

function renderDescriptions(descriptions = []) {
  const wrapper = createElement('div', { className: 'description-list' });
  const text = Array.isArray(descriptions) ? descriptions.join(' ') : descriptions;

  String(text)
    .split(/\n+/)
    .map((description) => description.trim())
    .filter(Boolean)
    .forEach((description) => {
      wrapper.appendChild(createElement('p', { text: description }));
    });

  return wrapper;
}

function renderEntry(entry) {
  const article = createElement('article', { className: 'entry' });

  if (entry.heading) {
    article.appendChild(createElement('h3', { className: 'entry-title', text: entry.heading }));
  }

  if (entry.descriptions?.length) {
    article.appendChild(renderDescriptions(entry.descriptions));
  }

  return article;
}

function renderProject(project) {
  const article = createElement('article', { className: 'entry project-entry' });
  const title = createElement('h3', { className: 'entry-title' });
  title.appendChild(createElement('a', { text: project.name, href: project.href }));

  project.links?.forEach((link) => {
    title.append(' - ');
    title.appendChild(createElement('a', { text: link.label, href: link.href }));
  });

  article.appendChild(title);
  article.appendChild(renderDescriptions(project.descriptions));

  return article;
}

function renderItem(item) {
  const article = createElement('article', { className: 'item' });
  const header = createElement('header', { className: 'item-hd' });

  if (item.title) {
    header.appendChild(createElement('h3', { className: 'item-name', text: item.title }));
  }

  if (item.tag) {
    header.appendChild(createElement('span', { className: 'btn item-more', text: item.tag }));
  }

  article.appendChild(header);

  if (item.bullets?.length) {
    article.appendChild(renderBullets(item.bullets));
  }

  item.entries?.forEach((entry) => {
    article.appendChild(renderEntry(entry));
  });

  item.projects?.forEach((project) => {
    article.appendChild(renderProject(project));
  });

  return article;
}

function renderMedia(media = []) {
  const wrapper = createElement('div', { className: 'file-col' });

  media.forEach((mediaItem) => {
    const figure = createElement('figure');
    const image = createElement('img', {
      className: 'file-col-image',
      src: mediaItem.image,
      alt: mediaItem.alt || mediaItem.caption,
    });

    if (mediaItem.href) {
      const link = createElement('a', { href: mediaItem.href });
      link.appendChild(image);
      figure.appendChild(link);
    } else {
      figure.appendChild(image);
    }

    figure.appendChild(createElement('figcaption', { text: mediaItem.caption }));
    wrapper.appendChild(figure);
  });

  return wrapper;
}

function renderProfilePhoto(photo) {
  if (!photo?.enabled || !photo.src) {
    return null;
  }

  const frame = createElement('figure', { className: 'profile-photo' });
  frame.appendChild(createElement('img', {
    src: photo.src,
    alt: photo.alt || '证件照',
  }));

  return frame;
}

function renderSection(section, className) {
  const sectionElement = createElement('section', { className });
  const body = createElement('div', { className: 'section-bd' });

  section.items?.forEach((item) => {
    body.appendChild(renderItem(item));
  });

  if (section.media?.length) {
    body.appendChild(renderMedia(section.media));
  }

  appendChildren(sectionElement, [
    renderSectionHeader(section.title),
    body,
  ]);

  return sectionElement;
}

function renderHeader() {
  const header = createElement('header', { className: 'content-hd' });
  const title = createElement('section', { className: 'title' });
  const name = createElement('div', { className: 'name' });
  const info = createElement('section', { className: 'info' });
  const basics = createElement('ul');
  const profilePhoto = renderProfilePhoto(resume.profilePhoto);

  name.appendChild(createElement('h1', { text: resume.name }));
  title.appendChild(name);

  resume.basics.forEach((item) => {
    const row = createElement('li');
    row.append(`${item.label}：`);

    if (item.href) {
      row.appendChild(createElement('a', { text: item.value, href: item.href }));
    } else {
      row.append(item.value);
    }

    basics.appendChild(row);
  });

  info.appendChild(basics);
  appendChildren(header, [title, info, profilePhoto]);

  if (profilePhoto) {
    header.classList.add('has-profile-photo');
  }

  return header;
}

function renderFooter() {
  const footer = createElement('footer', { className: 'github-footer' });
  const wrapper = createElement('div');

  resume.footer.forEach((link, index) => {
    wrapper.appendChild(renderLink(link));

    if (index === 1) {
      wrapper.appendChild(createElement('br'));
    }
  });

  footer.appendChild(wrapper);
  return footer;
}

function renderResume() {
  document.title = resume.title;
  app.textContent = '';

  const main = createElement('main', { className: 'content' });
  const body = createElement('div', { className: 'content-bd' });
  const left = createElement('div', { className: 'content-left' });
  const right = createElement('div', { className: 'content-right' });

  resume.mainSections.forEach((section) => {
    left.appendChild(renderSection(section, 'practice'));
  });

  resume.sideSections.forEach((section) => {
    right.appendChild(renderSection(section, 'file'));
  });

  appendChildren(body, [left, right]);
  appendChildren(main, [renderHeader(), body]);
  appendChildren(app, [main, renderFooter()]);
}

renderResume();
