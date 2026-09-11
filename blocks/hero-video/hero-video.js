/*
 * Hero Video block
 * Full-bleed dark stage with a background video (source: Telekom `.stagevideo`).
 *
 * Content model (authored as a table, author omits/adds cells gracefully):
 *   - row 1, cell 1: a link to the video (Dynamic Media HLS manifest `.m3u8`,
 *     or a plain `.mp4`/`.webm`). The DM auto-block in scripts.js rewrites a
 *     DM manifest anchor into a <picture><img src="…manifest.m3u8"> BEFORE this
 *     decorate() runs — a manifest is not a valid image, so we detect that
 *     <picture>/<img> and rebuild it as a real background <video>.
 *   - row 2, cell 1: the heading (kept screen-reader-only, matching the source
 *     stage which exposes an <h1> only to assistive tech, not as visible copy).
 */

const VIDEO_EXT_RE = /\.(m3u8|mp4|webm|m4v|mov)(\?.*)?$/i;

function cleanVideoUrl(url) {
  // Drop the width query the DM auto-block appended to the image rendition
  // (`manifest.m3u8?width=750`); it is meaningless for a video manifest.
  try {
    const u = new URL(url, window.location.href);
    u.searchParams.delete('width');
    return u.toString();
  } catch {
    return url.replace(/\?.*$/, '');
  }
}

function findVideoSrc(block) {
  // 1. An authored anchor still pointing at a video file.
  const anchor = [...block.querySelectorAll('a[href]')]
    .find((a) => VIDEO_EXT_RE.test(a.getAttribute('href')));
  if (anchor) return { src: anchor.getAttribute('href'), node: anchor };

  // 2. The DM auto-block's <picture>/<img> carrying a manifest URL.
  const img = block.querySelector('img');
  if (img && VIDEO_EXT_RE.test(img.getAttribute('src') || '')) {
    return { src: img.getAttribute('src'), node: img.closest('picture') || img };
  }
  return null;
}

function buildBackgroundVideo(src) {
  const video = document.createElement('video');
  video.className = 'hero-video-media';
  video.muted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('autoplay', '');
  video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  const source = document.createElement('source');
  source.src = cleanVideoUrl(src);
  if (/\.m3u8(\?.*)?$/i.test(src)) source.type = 'application/vnd.apple.mpegurl';
  else if (/\.webm(\?.*)?$/i.test(src)) source.type = 'video/webm';
  else source.type = 'video/mp4';
  video.append(source);
  return video;
}

export default function decorate(block) {
  const match = findVideoSrc(block);

  if (match) {
    const cell = match.node.closest(':scope > div > div') || match.node.parentElement;
    const video = buildBackgroundVideo(match.src);
    match.node.remove();
    (cell || block).prepend(video);
  } else if (!block.querySelector('video, picture')) {
    block.classList.add('no-image');
  }
}
