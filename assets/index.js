//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region src/main.js
var app = document.querySelector("#app");
var resume = readResumeData();
function readResumeData() {
	const dataElement = document.querySelector("#resume-data");
	if (!dataElement) throw new Error("Missing resume data: add a script#resume-data JSON block to index.html.");
	return JSON.parse(dataElement.textContent);
}
function createElement(tagName, options = {}) {
	const element = document.createElement(tagName);
	if (options.className) element.className = options.className;
	if (options.text) appendFormattedText(element, options.text);
	if (options.href) {
		element.href = options.href;
		element.rel = "noopener noreferrer";
	}
	if (options.src) element.src = options.src;
	if (options.alt) element.alt = options.alt;
	return element;
}
function findClosingStrongMarker(text, startIndex) {
	for (let index = startIndex; index < text.length; index += 1) {
		if (text[index] === "\\") {
			index += 1;
			continue;
		}
		if (text[index] === "*") return index;
	}
	return -1;
}
function parseFormattedText(value) {
	const text = String(value ?? "");
	const parts = [];
	let buffer = "";
	let isStrong = false;
	function flush() {
		if (buffer) {
			parts.push({
				text: buffer,
				isStrong
			});
			buffer = "";
		}
	}
	for (let index = 0; index < text.length; index += 1) {
		const char = text[index];
		const nextChar = text[index + 1];
		if (char === "\\" && nextChar === "*") {
			buffer += "*";
			index += 1;
			continue;
		}
		if (char === "*") {
			if (isStrong) {
				flush();
				isStrong = false;
				continue;
			}
			if (findClosingStrongMarker(text, index + 1) > index + 1) {
				flush();
				isStrong = true;
				continue;
			}
		}
		buffer += char;
	}
	flush();
	return parts;
}
function appendFormattedText(parent, value) {
	parseFormattedText(value).forEach((part) => {
		if (!part.isStrong) {
			parent.append(part.text);
			return;
		}
		const strong = createElement("strong", { className: "text-strong" });
		strong.textContent = part.text;
		parent.appendChild(strong);
	});
	return parent;
}
function appendChildren(parent, children) {
	children.filter(Boolean).forEach((child) => parent.appendChild(child));
	return parent;
}
function createInlineImage(src, alt = "", className = "inline-text-img") {
	return createElement("img", {
		className,
		src,
		alt
	});
}
function applyFontScale(element, scaleValue, { baseFontSize = 1 } = {}) {
	const scale = Number(scaleValue);
	if (!Number.isFinite(scale) || scale <= 0) return element;
	element.style.fontSize = `${baseFontSize * scale}em`;
	return element;
}
function appendInlineContent(parent, { text, img, href, imgAlt = "" }) {
	if (img) parent.appendChild(createInlineImage(img, imgAlt));
	if (href) parent.appendChild(createElement("a", {
		text,
		href
	}));
	else appendFormattedText(parent, text);
	return parent;
}
function renderLink({ label, value, href, icon, img }) {
	return appendInlineContent(createElement("span", { className: "footer-link" }), {
		text: label || value,
		href,
		img: img || icon
	});
}
function renderSectionHeader(title) {
	return appendChildren(createElement("header", { className: "section-hd" }), [
		createElement("span", { className: "section-title-l" }),
		createElement("h2", {
			className: "section-title",
			text: title
		}),
		createElement("span", { className: "section-title-r" })
	]);
}
function renderItems(items = []) {
	const list = createElement("ul", { className: "section-content" });
	items.forEach((item) => {
		list.appendChild(createElement("li", { text: item }));
	});
	return list;
}
function renderDto(dto = []) {
	const wrapper = createElement("div", { className: "description-list" });
	const text = Array.isArray(dto) ? dto.join(" ") : dto;
	String(text).split(/\n+/).map((paragraph) => paragraph.trim()).filter(Boolean).forEach((paragraph) => {
		wrapper.appendChild(createElement("p", { text: paragraph }));
	});
	return wrapper;
}
function renderDtoList(items = []) {
	const list = createElement("ul", { className: "entry-description-list" });
	items.forEach((item) => {
		list.appendChild(createElement("li", { text: item }));
	});
	return list;
}
function renderList(list) {
	const article = createElement("article", { className: "entry" });
	if (list.name) {
		const title = createElement("h3", { className: "entry-title inline-text" });
		applyFontScale(title, list.frontScale);
		appendInlineContent(title, {
			text: list.name,
			href: list.href,
			img: list.img
		});
		article.appendChild(title);
	}
	if (list.dto?.length) article.appendChild(renderDto(list.dto));
	if (list.dtoList?.length) article.appendChild(renderDtoList(list.dtoList));
	return article;
}
function renderItem(item) {
	const article = createElement("article", { className: "item" });
	const header = createElement("header", { className: "item-hd" });
	if (item.title) header.appendChild(createElement("h3", {
		className: "item-name",
		text: item.title
	}));
	if (item.tag) header.appendChild(createElement("span", {
		className: "btn item-more",
		text: item.tag
	}));
	article.appendChild(header);
	if (item.items?.length) article.appendChild(renderItems(item.items));
	item.lists?.forEach((list) => {
		article.appendChild(renderList(list));
	});
	return article;
}
function renderMedia(media = []) {
	const wrapper = createElement("div", { className: "file-col" });
	media.forEach((mediaItem) => {
		const figure = createElement("figure");
		const image = createElement("img", {
			className: "file-col-image",
			src: mediaItem.image,
			alt: mediaItem.alt || mediaItem.caption
		});
		if (mediaItem.href) {
			const link = createElement("a", { href: mediaItem.href });
			link.appendChild(image);
			figure.appendChild(link);
		} else figure.appendChild(image);
		figure.appendChild(createElement("figcaption", { text: mediaItem.caption }));
		wrapper.appendChild(figure);
	});
	return wrapper;
}
function renderProfilePhoto(photo) {
	if (!photo?.enabled || !photo.src) return null;
	const frame = createElement("figure", { className: "profile-photo" });
	frame.appendChild(createElement("img", {
		src: photo.src,
		alt: photo.alt || "证件照"
	}));
	return frame;
}
function renderSection(section, className) {
	const sectionElement = createElement("section", { className });
	const body = createElement("div", { className: "section-bd" });
	section.items?.forEach((item) => {
		body.appendChild(renderItem(item));
	});
	if (section.media?.length) body.appendChild(renderMedia(section.media));
	appendChildren(sectionElement, [renderSectionHeader(section.title), body]);
	return sectionElement;
}
function renderHeader() {
	const header = createElement("header", { className: "content-hd" });
	const title = createElement("section", { className: "title" });
	const name = createElement("div", { className: "name" });
	const info = createElement("section", { className: "info" });
	const basics = createElement("ul");
	const profilePhoto = renderProfilePhoto(resume.profilePhoto);
	name.appendChild(createElement("h1", { text: resume.name }));
	title.appendChild(name);
	resume.basics.forEach((item) => {
		const row = createElement("li");
		appendFormattedText(row, `${item.label}：`);
		appendInlineContent(row, {
			text: item.value,
			href: item.href,
			img: item.img
		});
		basics.appendChild(row);
	});
	info.appendChild(basics);
	appendChildren(header, [
		title,
		info,
		profilePhoto
	]);
	if (profilePhoto) header.classList.add("has-profile-photo");
	return header;
}
function renderFooter() {
	const footer = createElement("footer", { className: "github-footer" });
	const wrapper = createElement("div");
	resume.footer.forEach((link, index) => {
		wrapper.appendChild(renderLink(link));
		if (index === 1) wrapper.appendChild(createElement("br"));
	});
	footer.appendChild(wrapper);
	return footer;
}
function renderResume() {
	document.title = resume.title;
	app.textContent = "";
	const main = createElement("main", { className: "content" });
	const body = createElement("div", { className: "content-bd" });
	const left = createElement("div", { className: "content-left" });
	const right = createElement("div", { className: "content-right" });
	(resume.mainSections || []).forEach((section) => {
		left.appendChild(renderSection(section, "practice"));
	});
	(resume.sideSections || []).forEach((section) => {
		right.appendChild(renderSection(section, "file"));
	});
	appendChildren(body, [left, right]);
	appendChildren(main, [renderHeader(), body]);
	appendChildren(app, [main, renderFooter()]);
}
renderResume();
//#endregion
