import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker — use CDN worker for Vite compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export type PdfDocumentProxy = pdfjsLib.PDFDocumentProxy;

/**
 * Load a PDF document from a URL.
 */
export async function loadPdfDocument(url: string): Promise<PdfDocumentProxy> {
  const loadingTask = pdfjsLib.getDocument({
    url,
    cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
    cMapPacked: true,
  });
  return loadingTask.promise;
}

/**
 * Render a single PDF page to a data URL image.
 * @param pdf - The loaded PDF document
 * @param pageNumber - 1-indexed page number
 * @param scale - Render scale (1.5 = 150% DPI)
 * @returns base64 data URL string of the rendered page
 */
export async function renderPageToImage(
  pdf: PdfDocumentProxy,
  pageNumber: number,
  scale: number = 1.5
): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  // Create an off-screen canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) {
    throw new Error(`Could not get 2D context for page ${pageNumber}`);
  }

  // Account for device pixel ratio for crisp rendering
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(viewport.width * dpr);
  canvas.height = Math.floor(viewport.height * dpr);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  ctx.scale(dpr, dpr);

  // White background for PDF pages
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  // Convert to JPEG for smaller size, good quality
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

  // Clean up
  page.cleanup();

  return dataUrl;
}

/**
 * Get the aspect ratio (width/height) of the first page.
 */
export async function getPageAspectRatio(pdf: PdfDocumentProxy): Promise<number> {
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  page.cleanup();
  return viewport.width / viewport.height;
}

/**
 * Render all pages progressively with a progress callback.
 * Returns an array of data URL strings indexed by page number (0 = blank placeholder).
 */
export async function renderAllPages(
  pdf: PdfDocumentProxy,
  scale: number = 1.5,
  onProgress?: (rendered: number, total: number) => void
): Promise<string[]> {
  const total = pdf.numPages;
  const images: string[] = [];

  // Concurrency control — render 3 pages at a time to avoid memory spikes
  const CONCURRENCY = 3;

  for (let batch = 0; batch < total; batch += CONCURRENCY) {
    const batchNums = [];
    for (let i = batch + 1; i <= Math.min(batch + CONCURRENCY, total); i++) {
      batchNums.push(i);
    }

    const batchResults = await Promise.all(
      batchNums.map((n) => renderPageToImage(pdf, n, scale))
    );

    for (const img of batchResults) {
      images.push(img);
    }

    if (onProgress) {
      onProgress(Math.min(batch + CONCURRENCY, total), total);
    }
  }

  return images; // index 0 = page 1
}

// ──────────────────────────────────────────────────────────────────────────────
// A3 → A4 Splitting Functions
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Render one half (left or right) of an A3 landscape PDF page as an A4 portrait image.
 *
 * The PDF page is rendered at the given scale on a full-size canvas, then the
 * left or right half is extracted to a separate canvas and returned as a JPEG.
 *
 * @param pdf - The loaded PDF document
 * @param pageNumber - 1-indexed page number (A3 spread)
 * @param half - 'left' or 'right'
 * @param scale - Render scale
 * @returns base64 data URL string of the extracted A4 half
 */
export async function renderA3HalfToImage(
  pdf: PdfDocumentProxy,
  pageNumber: number,
  half: 'left' | 'right',
  scale: number = 1.5
): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Full A3 render canvas
  const fullCanvas = document.createElement('canvas');
  const fullCtx = fullCanvas.getContext('2d', { alpha: false });
  if (!fullCtx) {
    throw new Error(`Could not get 2D context for page ${pageNumber}`);
  }

  fullCanvas.width = Math.floor(viewport.width * dpr);
  fullCanvas.height = Math.floor(viewport.height * dpr);
  fullCtx.scale(dpr, dpr);

  // White background
  fullCtx.fillStyle = '#ffffff';
  fullCtx.fillRect(0, 0, viewport.width, viewport.height);

  await page.render({
    canvasContext: fullCtx,
    viewport,
  }).promise;

  // Now extract the left or right half
  const halfWidthPx = Math.floor(fullCanvas.width / 2);
  const fullHeightPx = fullCanvas.height;

  const srcX = half === 'left' ? 0 : halfWidthPx;

  // Destination A4 canvas
  const a4Canvas = document.createElement('canvas');
  const a4Ctx = a4Canvas.getContext('2d', { alpha: false });
  if (!a4Ctx) {
    throw new Error(`Could not get 2D context for A4 half of page ${pageNumber}`);
  }

  a4Canvas.width = halfWidthPx;
  a4Canvas.height = fullHeightPx;

  // White background
  a4Ctx.fillStyle = '#ffffff';
  a4Ctx.fillRect(0, 0, halfWidthPx, fullHeightPx);

  // Copy the half from the full render
  a4Ctx.drawImage(
    fullCanvas,
    srcX, 0, halfWidthPx, fullHeightPx,  // source rect
    0, 0, halfWidthPx, fullHeightPx       // destination rect
  );

  const dataUrl = a4Canvas.toDataURL('image/jpeg', 0.92);

  // Clean up
  page.cleanup();

  return dataUrl;
}

/**
 * Render all A3 spreads as individual A4 pages.
 * Each A3 page → LEFT half, then RIGHT half.
 *
 * @returns Array of A4 data URL images in reading order (left then right for each spread)
 */
export async function renderAllA3SpreadsAsA4(
  pdf: PdfDocumentProxy,
  scale: number = 1.5,
  onProgress?: (rendered: number, totalA4Pages: number) => void
): Promise<string[]> {
  const totalSpreads = pdf.numPages;
  const totalA4Pages = totalSpreads * 2;
  const images: string[] = [];

  for (let spreadIdx = 1; spreadIdx <= totalSpreads; spreadIdx++) {
    // Left half first
    const leftImg = await renderA3HalfToImage(pdf, spreadIdx, 'left', scale);
    images.push(leftImg);

    if (onProgress) {
      onProgress(images.length, totalA4Pages);
    }

    // Right half second
    const rightImg = await renderA3HalfToImage(pdf, spreadIdx, 'right', scale);
    images.push(rightImg);

    if (onProgress) {
      onProgress(images.length, totalA4Pages);
    }
  }

  return images;
}

/**
 * Get the A4 aspect ratio from an A3 landscape page (half-width / full-height).
 */
export async function getA4AspectRatioFromA3(pdf: PdfDocumentProxy): Promise<number> {
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  page.cleanup();
  // A3 landscape: width is double A4 width, height is A4 height
  const a4Width = viewport.width / 2;
  const a4Height = viewport.height;
  return a4Width / a4Height;
}
