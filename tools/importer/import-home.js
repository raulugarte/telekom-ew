/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroVideoParser from './parsers/hero-video.js';
import tabsAudienceParser from './parsers/tabs-audience.js';
import cardsNewsParser from './parsers/cards-news.js';
import cardsFactsParser from './parsers/cards-facts.js';
import carouselTopicsParser from './parsers/carousel-topics.js';
import cardsEventsParser from './parsers/cards-events.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/telekom-cleanup.js';
import sectionsTransformer from './transformers/telekom-sections.js';
import dmImagesTransformer from './transformers/telekom-dm-images.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Deutsche Telekom corporate homepage',
  urls: [
    'https://www.telekom.com/en'
  ],
  blocks: [
    {
      name: 'hero-video',
      instances: ['.stagevideo']
    },
    {
      name: 'tabs-audience',
      instances: ['.personalisationselector .tabs.cmp-tabs']
    },
    {
      name: 'cards-news',
      instances: ['.feed-outer .teaser-group__grid', '.feed-outer section.feed.teaser-group']
    },
    {
      name: 'cards-facts',
      instances: ['.facts-outer .facts']
    },
    {
      name: 'carousel-topics',
      instances: ['.teasergroupslider.theme-orchid section.teaser-group']
    },
    {
      name: 'cards-events',
      instances: ['.events-teaser']
    }
  ],
  sections: [
    {
      id: 's1',
      name: 'Hero video stage',
      selector: ['.stagevideo'],
      style: 'dark',
      blocks: ['hero-video'],
      defaultContent: []
    },
    {
      id: 's2',
      name: 'Personalisation selector (audience tabs)',
      selector: ['.personalisationselector'],
      style: 'dark',
      blocks: ['tabs-audience'],
      defaultContent: []
    },
    {
      id: 's3',
      name: 'Latest news feed',
      selector: ['.feed-outer'],
      style: 'magenta',
      blocks: ['cards-news'],
      defaultContent: ['h2', 'h3']
    },
    {
      id: 's4',
      name: 'Facts about Telekom',
      selector: ['.facts-outer'],
      style: 'dark',
      blocks: ['cards-facts'],
      defaultContent: ['h2']
    },
    {
      id: 's5',
      name: 'Topics to explore (teaser slider)',
      selector: ['.teasergroupslider.theme-orchid'],
      style: 'orchid',
      blocks: ['carousel-topics'],
      defaultContent: ['h2']
    },
    {
      id: 's6',
      name: 'Upcoming events',
      selector: ['.events-teaser'],
      style: 'dark',
      blocks: ['cards-events'],
      defaultContent: ['h2']
    },
    {
      id: 's7',
      name: 'Brand claim',
      selector: ['.claim-outer'],
      style: 'magenta',
      blocks: [],
      defaultContent: ['.claim']
    }
  ]
};

// PARSER REGISTRY
const parsers = {
  'hero-video': heroVideoParser,
  'tabs-audience': tabsAudienceParser,
  'cards-news': cardsNewsParser,
  'cards-facts': cardsFactsParser,
  'carousel-topics': carouselTopicsParser,
  'cards-events': cardsEventsParser,
};

// TRANSFORMER REGISTRY - cleanup first, DM images, then section breaks/metadata last
const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata + DM images)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map root URL to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
