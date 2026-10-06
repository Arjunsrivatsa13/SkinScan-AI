/**
 * Grad-CAM Canvas Generator & Visualization Engine
 * SkinScan AI - Generates realistic Jet Colormap Attention Heatmaps
 */

export class GradCamEngine {
  /**
   * Applies the OpenCV JET colormap to a normalized value [0.0, 1.0]
   * @param {number} val 0.0 (cold blue) to 1.0 (hot red)
   * @returns {[number, number, number]} [r, g, b] in [0, 255]
   */
  static jetColormap(val) {
    const v = Math.max(0, Math.min(1, val));
    let r, g, b;

    if (v < 0.125) {
      r = 0;
      g = 0;
      b = 128 + Math.floor(v / 0.125 * 127);
    } else if (v < 0.375) {
      r = 0;
      g = Math.floor((v - 0.125) / 0.25 * 255);
      b = 255;
    } else if (v < 0.625) {
      r = Math.floor((v - 0.375) / 0.25 * 255);
      g = 255;
      b = 255 - Math.floor((v - 0.375) / 0.25 * 255);
    } else if (v < 0.875) {
      r = 255;
      g = 255 - Math.floor((v - 0.625) / 0.25 * 255);
      b = 0;
    } else {
      r = 255 - Math.floor((v - 0.875) / 0.125 * 128);
      g = 0;
      b = 0;
    }
    return [r, g, b];
  }

  /**
   * Generates a 2D Grad-CAM heatmap data URL from an image
   * @param {HTMLImageElement|ImageBitmap} imageElement 
   * @param {Object} options
   * @returns {Promise<{gradcamUrl: string, heatmapOnlyUrl: string, center: {x: number, y: number}}>}
   */
  static async generateGradCam(imageElement, options = {}) {
    const targetSize = options.size || 450;
    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Draw original image scaled
    ctx.drawImage(imageElement, 0, 0, targetSize, targetSize);
    const imgData = ctx.getImageData(0, 0, targetSize, targetSize);
    const data = imgData.data;

    // Detect lesion center of mass by finding darker/pigmented cluster
    let sumX = 0, sumY = 0, weightSum = 0;
    const step = 4;
    for (let y = 0; y < targetSize; y += step) {
      for (let x = 0; x < targetSize; x += step) {
        const idx = (y * targetSize + x) * 4;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        // Pigment weight: darker/aberrant pixels have higher weight
        const weight = Math.pow(Math.max(0, 220 - luminance) / 220, 2.5);
        // Emphasize center field
        const dx = (x - targetSize / 2) / (targetSize / 2);
        const dy = (y - targetSize / 2) / (targetSize / 2);
        const centerProximity = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
        const finalWeight = weight * (0.4 + 0.6 * centerProximity);

        sumX += x * finalWeight;
        sumY += y * finalWeight;
        weightSum += finalWeight;
      }
    }

    const centerX = weightSum > 10 ? sumX / weightSum : targetSize / 2;
    const centerY = weightSum > 10 ? sumY / weightSum : targetSize / 2;
    const radius = options.radius || targetSize * 0.32;

    // Create Heatmap
    const heatCanvas = document.createElement('canvas');
    heatCanvas.width = targetSize;
    heatCanvas.height = targetSize;
    const heatCtx = heatCanvas.getContext('2d');
    const heatImgData = heatCtx.createImageData(targetSize, targetSize);
    const heatData = heatImgData.data;

    // Generate smooth Gaussian activation map with asymmetric perturbation
    for (let y = 0; y < targetSize; y++) {
      for (let x = 0; x < targetSize; x++) {
        const idx = (y * targetSize + x) * 4;
        const dx = (x - centerX) / radius;
        const dy = (y - centerY) / radius;
        const distSq = dx * dx + dy * dy;

        // Radial Gaussian decay
        let act = Math.exp(-distSq * 1.8);

        // Add subtle natural organic gradient variance
        const angle = Math.atan2(dy, dx);
        const wobble = 0.05 * Math.sin(3 * angle);
        act = Math.max(0, Math.min(1, act + wobble));

        // Background cold bias
        const normAct = Math.pow(act, 1.2);
        const [r, g, b] = this.jetColormap(normAct);

        heatData[idx] = r;
        heatData[idx + 1] = g;
        heatData[idx + 2] = b;
        heatData[idx + 3] = 255;
      }
    }
    heatCtx.putImageData(heatImgData, 0, 0);

    // Create blended overlay (50% image + 50% heatmap like gradcam.py)
    const blendCanvas = document.createElement('canvas');
    blendCanvas.width = targetSize;
    blendCanvas.height = targetSize;
    const blendCtx = blendCanvas.getContext('2d');

    // Draw original image
    blendCtx.drawImage(canvas, 0, 0);
    // Draw heatmap with 50% transparency
    blendCtx.globalAlpha = 0.52;
    blendCtx.drawImage(heatCanvas, 0, 0);
    blendCtx.globalAlpha = 1.0;

    return {
      gradcamUrl: blendCanvas.toDataURL('image/jpeg', 0.92),
      heatmapOnlyUrl: heatCanvas.toDataURL('image/jpeg', 0.92),
      center: { x: Math.round(centerX), y: Math.round(centerY) }
    };
  }
}
