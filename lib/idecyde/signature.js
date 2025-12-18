export function makeSignatureSvg(signatureText) {
  const safeText = String(signatureText ?? '').replace(/[&<>]/g, char => {
    if (char === '&') return '&amp;';
    if (char === '<') return '&lt;';
    return '&gt;';
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="240" viewBox="0 0 900 240" role="img" aria-label="Signature">
  <style>
    .signature-text {
      font-family: "Brush Script MT", "Pacifico", "Segoe Script", cursive;
      font-size: 72px;
      font-weight: 400;
      fill: #111;
    }
  </style>
  <rect width="100%" height="100%" fill="none" />
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="signature-text">${safeText}</text>
</svg>`;
}
