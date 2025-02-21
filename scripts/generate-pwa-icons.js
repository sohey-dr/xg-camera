const fs = require('fs');
const { createCanvas } = require('canvas');

// Create directory if it doesn't exist
if (!fs.existsSync('./public/icons')) {
  fs.mkdirSync('./public/icons', { recursive: true });
}

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  // Camera lens circle
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Inner circle
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/4, 0, Math.PI * 2);
  ctx.fillStyle = '#000000';
  ctx.fill();

  // Save the icon
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`./public/icons/icon-${size}x${size}.png`, buffer);
}

// Generate icons in required sizes
generateIcon(192);
generateIcon(512);

console.log('PWA icons generated successfully!');
