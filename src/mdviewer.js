import MarkdownIt from 'markdown-it';
import './mdviewer.scss';

const app = document.querySelector('#app');
const markdown = createMarkdownRenderer();

bootstrap().catch((error) => {
  renderError(error instanceof Error ? error.message : 'Markdown 渲染失败。');
});

function createMarkdownRenderer() {
  return new MarkdownIt({
    html: true,
    linkify: true,
    breaks: true,
  });
}

async function bootstrap() {
  const markdownPath = getMarkdownPath();
  const markdownSource = await fetchMarkdown(markdownPath);
  const renderedHtml = markdown.render(markdownSource);
  const rawSourceUrl = createRawSourceUrl(markdownSource);
  const container = renderLayout(markdownPath, renderedHtml, rawSourceUrl);

  rewriteDocumentLinks(container, markdownPath);
  syncDocumentTitle(container, markdownPath);
}

function getMarkdownPath() {
  const searchParams = new URLSearchParams(window.location.search);
  const file = searchParams.get('file')?.trim();

  if (!file) {
    throw new Error('缺少 file 参数，例如：mdviewer.html?file=assets/markdown/project-guide.md');
  }

  const normalizedPath = file.replace(/^\.?\//, '');

  if (!normalizedPath.startsWith('assets/markdown/')) {
    throw new Error('当前查看器仅允许读取 assets/markdown/ 目录下的 Markdown 文件。');
  }

  if (!normalizedPath.endsWith('.md')) {
    throw new Error('当前查看器仅支持渲染 .md 文件。');
  }

  return normalizedPath;
}

async function fetchMarkdown(path) {
  const response = await fetch(path, {
    headers: {
      Accept: 'text/markdown, text/plain;q=0.9, */*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`文档加载失败：${response.status} ${response.statusText}`);
  }

  return response.text();
}

function renderLayout(markdownPath, renderedHtml, rawSourceUrl) {
  const shell = document.createElement('div');
  shell.className = 'md-shell';

  const fileName = markdownPath.split('/').pop() || markdownPath;
  const pageTitle = document.createElement('div');
  pageTitle.className = 'md-shell__topbar';
  pageTitle.innerHTML = `
    <div class="md-shell__nav">
      <button class="md-shell__nav-btn" type="button" data-action="back" aria-label="后退" title="后退">
        ${createIcon('back')}
      </button>
      <button class="md-shell__nav-btn" type="button" data-action="forward" aria-label="前进" title="前进">
        ${createIcon('forward')}
      </button>
      <a class="md-shell__nav-btn md-shell__nav-btn--link md-shell__nav-btn--home" href="./index.html" aria-label="主页" title="主页">
        ${createIcon('home')}
      </a>
    </div>
    <div class="md-shell__meta">
      <span class="md-shell__label">Markdown Viewer</span>
      <code class="md-shell__path">${escapeHtml(markdownPath)}</code>
    </div>
    <a class="md-shell__source" href="${encodeAttribute(rawSourceUrl)}" target="_blank" rel="noopener noreferrer">查看原始文件</a>
  `;

  bindTopbarActions(pageTitle);

  const article = document.createElement('article');
  article.className = 'md-doc';
  article.dataset.file = fileName;
  article.innerHTML = renderedHtml;

  shell.append(pageTitle, article);
  app.replaceChildren(shell);

  return article;
}

function bindTopbarActions(topbar) {
  const backButton = topbar.querySelector('[data-action="back"]');
  const forwardButton = topbar.querySelector('[data-action="forward"]');

  if (backButton) {
    backButton.disabled = window.history.length <= 1;
    backButton.addEventListener('click', () => {
      if (!backButton.disabled) {
        window.history.back();
      }
    });
  }

  if (forwardButton) {
    forwardButton.addEventListener('click', () => {
      window.history.forward();
    });
  }
}

function createIcon(type) {
  const icons = {
    back: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M14.75 5.75 8.5 12l6.25 6.25" />
      </svg>
    `,
    forward: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M9.25 5.75 15.5 12l-6.25 6.25" />
      </svg>
    `,
    home: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4.75 10.5 12 4.75l7.25 5.75v8a.75.75 0 0 1-.75.75h-4.25v-5h-4.5v5H5.5a.75.75 0 0 1-.75-.75z" />
      </svg>
    `,
  };

  return `<span class="md-shell__nav-icon">${icons[type] || ''}</span>`;
}

function rewriteDocumentLinks(container, markdownPath) {
  const baseUrl = new URL(markdownPath, window.location.href);

  container.querySelectorAll('[src], [href]').forEach((node) => {
    if (node.hasAttribute('src')) {
      const currentSrc = node.getAttribute('src');
      const nextSrc = rewriteAssetUrl(currentSrc, baseUrl);

      if (nextSrc) {
        node.setAttribute('src', nextSrc);
      }
    }

    if (node.hasAttribute('href')) {
      const currentHref = node.getAttribute('href');
      const nextHref = rewriteHref(currentHref, baseUrl);

      if (nextHref) {
        node.setAttribute('href', nextHref.href);

        if (nextHref.openExternally) {
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener noreferrer');
        }
      }
    }
  });
}

function rewriteAssetUrl(value, baseUrl) {
  if (!value || isSpecialUrl(value)) {
    return value;
  }

  return new URL(value, baseUrl).toString();
}

function rewriteHref(value, baseUrl) {
  if (!value || isSpecialUrl(value)) {
    return { href: value, openExternally: false };
  }

  const resolvedUrl = new URL(value, baseUrl);
  const isMarkdown = resolvedUrl.pathname.endsWith('.md');
  const isSameOrigin = resolvedUrl.origin === window.location.origin;

  if (isMarkdown && isSameOrigin) {
    const markdownFile = decodeURIComponent(resolvedUrl.pathname.replace(/^\//, ''));
    return {
      href: `./mdviewer.html?file=${encodeURIComponent(markdownFile)}`,
      openExternally: false,
    };
  }

  return {
    href: resolvedUrl.toString(),
    openExternally: !isSameOrigin,
  };
}

function isSpecialUrl(value) {
  return /^(#|data:|mailto:|tel:|javascript:)/i.test(value);
}

function syncDocumentTitle(container, markdownPath) {
  const heading = container.querySelector('h1, h2, h3');
  const text = heading?.textContent?.trim();
  const fileName = markdownPath.split('/').pop()?.replace(/\.md$/i, '') || 'Markdown Viewer';

  document.title = text ? `${text} | Markdown Viewer` : `${fileName} | Markdown Viewer`;
}

function createRawSourceUrl(markdownSource) {
  const rawBlob = new Blob([markdownSource], {
    type: 'text/plain;charset=utf-8',
  });

  return URL.createObjectURL(rawBlob);
}

function renderError(message) {
  const shell = document.createElement('div');
  shell.className = 'md-shell md-shell--error';
  shell.innerHTML = `
    <section class="md-error">
      <h1>Markdown Viewer</h1>
      <p>${escapeHtml(message)}</p>
      <p><a href="./index.html">返回首页</a></p>
    </section>
  `;
  app.replaceChildren(shell);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function encodeAttribute(value) {
  return escapeHtml(value);
}
