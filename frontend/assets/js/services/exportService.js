/**
 * Export & Report Generation Service
 * SkinScan AI - Dermoscopic Skin Lesion Analysis
 */

export class ExportService {
  /**
   * Generates a printable clinical report window
   * @param {Object} analysis 
   */
  static printReport(analysis) {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Please allow popups to print the diagnostic report.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SkinScan AI - Diagnostic Report #${analysis.lesionId || 'SCAN'}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 40px; margin: 0; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
          .title { font-size: 24px; font-weight: 700; color: #1e40af; margin: 0; }
          .subtitle { color: #64748b; font-size: 14px; margin: 4px 0 0 0; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-weight: 600; font-size: 13px; }
          .badge-benign { background: #ecfdf5; color: #059669; }
          .badge-malignant { background: #fef2f2; color: #dc2626; }
          .images-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 24px 0; }
          .img-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; text-align: center; }
          .img-card img { max-width: 100%; height: 260px; object-fit: cover; border-radius: 8px; }
          .prob-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          .prob-table th, .prob-table td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .prob-table th { background: #f8fafc; font-weight: 600; }
          .disclaimer { margin-top: 40px; padding: 16px; background: #eff6ff; border-left: 4px solid #3b82f6; font-size: 12px; color: #1e40af; border-radius: 4px; }
          @media print {
            body { padding: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">🔬 SkinScan AI Diagnostic Summary</h1>
            <p class="subtitle">Fine-tuned ResNet-50 Dermoscopic Image Classification</p>
          </div>
          <div style="text-align: right;">
            <div><strong>Scan ID:</strong> ${analysis.lesionId || 'N/A'}</div>
            <div style="color: #64748b; font-size: 13px;">Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <span class="badge ${analysis.type === 'Benign' ? 'badge-benign' : 'badge-malignant'}">
            ${analysis.type === 'Benign' ? '✓ Benign' : '⚠️ Malignant / Requires Biopsy'}
          </span>
          <h2 style="margin: 8px 0 4px 0; font-size: 28px;">${analysis.name}</h2>
          <div style="font-size: 16px; color: #3b82f6; font-weight: 600;">Model Softmax Confidence: ${analysis.confidence}%</div>
        </div>

        <div class="images-grid">
          <div class="img-card">
            <h4>Original Dermoscopic Image</h4>
            <img src="${analysis.originalImage}" alt="Original" />
          </div>
          <div class="img-card">
            <h4>Grad-CAM Attention Heatmap</h4>
            <img src="${analysis.gradcamImage}" alt="Grad-CAM" />
          </div>
        </div>

        <h3>Full Class Probabilities</h3>
        <table class="prob-table">
          <thead>
            <tr>
              <th>Lesion Diagnosis</th>
              <th>Category</th>
              <th>Probability (%)</th>
            </tr>
          </thead>
          <tbody>
            ${(analysis.allProbabilities || []).map(p => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.code ? p.code.toUpperCase() : ''}</td>
                <td>${p.percent}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 24px; font-size: 14px; color: #475569;">
          <strong>Visual Interpretation:</strong> ${analysis.explanation || 'Grad-CAM heatmaps highlight pixels contributing to classification.'}
        </div>

        <div class="disclaimer">
          <strong>Medical Disclaimer:</strong> SkinScan AI is an investigational deep learning research tool. It does not provide clinical diagnosis. Always consult a board-certified dermatologist for biopsy and formal medical management.
        </div>

        <div style="margin-top: 24px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">
            Print / Save as PDF
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  /**
   * Exports analysis as JSON file
   */
  static downloadJson(analysis) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SkinScan_${analysis.lesionId || 'report'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
