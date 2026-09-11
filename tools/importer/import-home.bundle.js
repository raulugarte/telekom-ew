/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-video.js
  function parse(element, { document: document2 }) {
    var _a;
    const heading = element.querySelector('h1, h2, .video-player h1, [class*="title"]');
    const poster = element.querySelector(".video-player__poster-picture, picture");
    const videoEl = element.querySelector("video[src], video source[src]");
    const videoSrc = videoEl ? videoEl.getAttribute("src") || ((_a = videoEl.querySelector("source[src]")) == null ? void 0 : _a.getAttribute("src")) : null;
    let videoLink = null;
    if (videoSrc) {
      videoLink = document2.createElement("a");
      videoLink.href = videoSrc;
      videoLink.textContent = videoSrc;
    }
    const bgCell = [];
    if (videoLink) bgCell.push(videoLink);
    if (poster) bgCell.push(poster);
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (bgCell.length === 0 && contentCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([bgCell.length ? bgCell : ""]);
    cells.push([contentCell.length ? contentCell : ""]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-audience.js
  function parse2(element, { document: document2 }) {
    const panels = element.querySelectorAll(".tabs__panel.cmp-tabs__tabpanel, .cmp-tabs__tabpanel");
    const dropdownLabels = Array.from(
      element.querySelectorAll(".dropdown__option .dropdown__option-text")
    ).map((n) => n.textContent.replace(/\s+/g, " ").trim());
    const tabButtons = Array.from(
      element.querySelectorAll(".tabs__list .tabs__tab, .cmp-tabs__tablist .cmp-tabs__tab")
    );
    const cells = [];
    panels.forEach((panel, i) => {
      let labelText = dropdownLabels[i];
      if (!labelText && tabButtons[i]) {
        labelText = tabButtons[i].textContent.replace(/\s+/g, " ").trim();
      }
      const labelCell = [];
      if (labelText) {
        const p = document2.createElement("p");
        p.textContent = labelText;
        labelCell.push(p);
      }
      const contentRoot = panel.querySelector(".cmp-container") || panel;
      const panelClone = contentRoot.cloneNode(true);
      panelClone.querySelectorAll('img[src^="data:image/svg"]').forEach((img) => img.remove());
      panelClone.querySelectorAll(".sr-only").forEach((n) => n.remove());
      if (!labelCell.length && !panelClone.textContent.trim()) return;
      cells.push([labelCell.length ? labelCell : "", panelClone]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-audience", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news.js
  function parse3(element, { document: document2 }) {
    let items = element.querySelectorAll("li.teaser-group__item");
    if (!items.length) items = element.querySelectorAll("article.teaser");
    const cells = [];
    items.forEach((item) => {
      const article = item.matches("article") ? item : item.querySelector("article");
      const scope = article || item;
      const picture = scope.querySelector(".teaser__media picture, picture");
      const mediaImg = scope.querySelector(".teaser__media-image, .teaser__media img");
      const imageCell = picture || mediaImg || "";
      const heading = scope.querySelector(".teaser__title, h2, h3, h4");
      const text = scope.querySelector(".teaser__text, p");
      const headingLink = heading && heading.querySelector("a[href]");
      const ctaLink = scope.querySelector(".teaser__cta a[href], a.teaser__link[href]");
      const labelEl = scope.querySelector(".teaser__label, .teaser__labels a");
      const labelText = labelEl ? labelEl.textContent.replace(/\s+/g, " ").trim() : "";
      const bodyCell = [];
      if (labelText) {
        const labelP = document2.createElement("p");
        labelP.textContent = labelText;
        bodyCell.push(labelP);
      }
      if (heading) bodyCell.push(heading);
      if (text) bodyCell.push(text);
      const href = ctaLink && ctaLink.getAttribute("href") || headingLink && headingLink.getAttribute("href");
      if (href) {
        const cta = document2.createElement("a");
        cta.href = href;
        cta.textContent = "Learn more";
        const p = document2.createElement("p");
        p.append(cta);
        bodyCell.push(p);
      }
      if (bodyCell.length === 0 && !picture && !mediaImg) return;
      cells.push([imageCell, bodyCell.length ? bodyCell : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-facts.js
  function parse4(element, { document: document2 }) {
    const items = element.querySelectorAll(".accordion__item");
    const cells = [];
    items.forEach((item) => {
      const contentCell = [];
      const figureText = item.querySelector(".accordion__stock-price") || item.querySelector(".accordion__title");
      if (figureText && figureText.textContent.trim()) {
        const h = document2.createElement("h3");
        h.textContent = figureText.textContent.trim();
        contentCell.push(h);
      }
      const label = item.querySelector(".accordion__header-subtitle, .accordion__stock-company");
      if (label && label.textContent.trim()) {
        const p = document2.createElement("p");
        p.innerHTML = `<strong>${label.textContent.trim()}</strong>`;
        contentCell.push(p);
      }
      const timestamp = item.querySelector(".accordion__stock-timestamp");
      const change = item.querySelector(".accordion__stock-change");
      [timestamp, change].forEach((node) => {
        if (node && node.textContent.trim()) {
          const p = document2.createElement("p");
          p.textContent = node.textContent.trim();
          contentCell.push(p);
        }
      });
      const bodyParas = item.querySelectorAll(".accordion__panel .teaser__text p, .accordion__body p");
      bodyParas.forEach((p) => {
        if (p.textContent.trim()) contentCell.push(p);
      });
      if (contentCell.length === 0) return;
      cells.push([contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-facts", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-topics.js
  function parse5(element, { document: document2 }) {
    let items = element.querySelectorAll("li.teaser-group__item");
    if (!items.length) items = element.querySelectorAll("article.teaser");
    const cells = [];
    items.forEach((item) => {
      const article = item.matches("article") ? item : item.querySelector("article");
      const scope = article || item;
      const picture = scope.querySelector(".teaser__media picture, picture");
      const mediaImg = scope.querySelector(".teaser__media-image, .teaser__media img");
      const imageCell = picture || mediaImg || "";
      const heading = scope.querySelector(".teaser__title, h2, h3, h4");
      const text = scope.querySelector(".teaser__text, p");
      const bodyCell = [];
      if (heading) bodyCell.push(heading);
      if (text) bodyCell.push(text);
      if (bodyCell.length === 0 && !picture && !mediaImg) return;
      cells.push([imageCell, bodyCell.length ? bodyCell : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-topics", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-events.js
  function parse6(element, { document: document2 }) {
    const cells = [];
    const featured = element.querySelector(".events-teaser__featured-image picture, .events-teaser__featured-image img");
    if (featured) {
      cells.push([featured, ""]);
    }
    const items = element.querySelectorAll(".events-teaser__event-item");
    items.forEach((item) => {
      const date = item.querySelector(".teaser__pre-header");
      const dateCell = [];
      if (date && date.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = date.textContent.trim();
        dateCell.push(p);
      }
      const bodyCell = [];
      const heading = item.querySelector(".teaser__content .teaser__title, .teaser__title");
      if (heading) bodyCell.push(heading);
      const text = item.querySelector(".teaser__text, .teaser__content p");
      if (text) bodyCell.push(text);
      const ctaLink = item.querySelector(".teaser__cta a[href]");
      if (ctaLink) {
        const p = document2.createElement("p");
        p.append(ctaLink);
        bodyCell.push(p);
      }
      const addCal = [...item.querySelectorAll("button, a")].find((el) => /add to calendar/i.test(el.textContent));
      if (addCal) {
        const p = document2.createElement("p");
        p.textContent = "Add to calendar";
        p.setAttribute("data-cta", "add-to-calendar");
        bodyCell.push(p);
      }
      if (dateCell.length === 0 && bodyCell.length === 0) return;
      cells.push([dateCell.length ? dateCell : "", bodyCell.length ? bodyCell : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-events", cells });
    const sectionHeading = element.querySelector(".events-teaser__header h2, .events-teaser__title, h2");
    const frag = document2.createDocumentFragment();
    if (sectionHeading && sectionHeading.textContent.trim()) {
      const h2 = document2.createElement("h2");
      h2.textContent = sectionHeading.textContent.trim();
      frag.append(h2);
    }
    frag.append(block);
    element.replaceWith(frag);
  }

  // tools/importer/transformers/telekom-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#__tealiumGDPRecModal",
        "#sprite-plyr",
        ".teaser-group__footer",
        ".teaser-group__load-more-wrapper"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--header",
        ".cmp-experiencefragment--footer",
        ".header-outer",
        ".footer-outer",
        "header",
        "footer",
        "nav"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-cmp-data-layer");
        el.removeAttribute("data-cmp-data-layer-enabled");
        el.removeAttribute("data-cmp-data-layer-name");
      });
    }
  }

  // tools/importer/transformers/telekom-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/transformers/telekom-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function findLinkedDmCarrier(img) {
    if (!img || !img.parentElement) return null;
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
      let foundNode = false;
      for (const child of parent.children) {
        if (child === node) {
          foundNode = true;
        } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
          return null;
        }
      }
      if (!foundNode) return null;
      node = parent;
      parent = parent.parentElement;
    }
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform3(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
    name: "home",
    description: "Deutsche Telekom corporate homepage",
    urls: [
      "https://www.telekom.com/en"
    ],
    blocks: [
      {
        name: "hero-video",
        instances: [".stagevideo"]
      },
      {
        name: "tabs-audience",
        instances: [".personalisationselector .tabs.cmp-tabs"]
      },
      {
        name: "cards-news",
        instances: [".feed-outer .teaser-group__grid", ".feed-outer section.feed.teaser-group"]
      },
      {
        name: "cards-facts",
        instances: [".facts-outer .facts"]
      },
      {
        name: "carousel-topics",
        instances: [".teasergroupslider.theme-orchid section.teaser-group"]
      },
      {
        name: "cards-events",
        instances: [".events-teaser"]
      }
    ],
    sections: [
      {
        id: "s1",
        name: "Hero video stage",
        selector: [".stagevideo"],
        style: "dark",
        blocks: ["hero-video"],
        defaultContent: []
      },
      {
        id: "s2",
        name: "Personalisation selector (audience tabs)",
        selector: [".personalisationselector"],
        style: "dark",
        blocks: ["tabs-audience"],
        defaultContent: []
      },
      {
        id: "s3",
        name: "Latest news feed",
        selector: [".feed-outer"],
        style: "magenta",
        blocks: ["cards-news"],
        defaultContent: ["h2", "h3"]
      },
      {
        id: "s4",
        name: "Facts about Telekom",
        selector: [".facts-outer"],
        style: "dark",
        blocks: ["cards-facts"],
        defaultContent: ["h2"]
      },
      {
        id: "s5",
        name: "Topics to explore (teaser slider)",
        selector: [".teasergroupslider.theme-orchid"],
        style: "orchid",
        blocks: ["carousel-topics"],
        defaultContent: ["h2"]
      },
      {
        id: "s6",
        name: "Upcoming events",
        selector: [".events-teaser"],
        style: "dark",
        blocks: ["cards-events"],
        defaultContent: ["h2"]
      },
      {
        id: "s7",
        name: "Brand claim",
        selector: [".claim-outer"],
        style: "magenta",
        blocks: [],
        defaultContent: [".claim"]
      }
    ]
  };
  var parsers = {
    "hero-video": parse,
    "tabs-audience": parse2,
    "cards-news": parse3,
    "cards-facts": parse4,
    "carousel-topics": parse5,
    "cards-events": parse6
  };
  var transformers = [
    transform,
    transform3,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
