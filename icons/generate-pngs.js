#!/usr/bin/env node

const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function drawWorkoutIcon(ctx, size) {
    const s = size / 512; // Scale factor

    // Background with gradient
    const bgGradient = ctx.createLinearGradient(0, 0, size, size);
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(1, '#16213e');
    ctx.fillStyle = bgGradient;
    roundRect(ctx, 0, 0, size, size, 110 * s);
    ctx.fill();

    // Dumbbell gradient
    const dumbbellGradient = ctx.createLinearGradient(0, 0, size, size);
    dumbbellGradient.addColorStop(0, '#e94560');
    dumbbellGradient.addColorStop(1, '#ff6b35');

    // Center coordinates
    const cx = size / 2;
    const cy = size / 2;

    // Left weight plate (outer)
    ctx.fillStyle = dumbbellGradient;
    roundRect(ctx, cx - 180*s, cy - 70*s, 50*s, 140*s, 8*s);
    ctx.fill();

    // Left weight plate (inner)
    ctx.globalAlpha = 0.9;
    roundRect(ctx, cx - 140*s, cy - 60*s, 25*s, 120*s, 5*s);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Center bar
    roundRect(ctx, cx - 115*s, cy - 18*s, 230*s, 36*s, 18*s);
    ctx.fill();

    // Right weight plate (inner)
    ctx.globalAlpha = 0.9;
    roundRect(ctx, cx + 115*s, cy - 60*s, 25*s, 120*s, 5*s);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Right weight plate (outer)
    roundRect(ctx, cx + 130*s, cy - 70*s, 50*s, 140*s, 8*s);
    ctx.fill();

    // Highlights for depth
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    roundRect(ctx, cx - 175*s, cy - 65*s, 8*s, 130*s, 4*s);
    ctx.fill();
    roundRect(ctx, cx + 135*s, cy - 65*s, 8*s, 130*s, 4*s);
    ctx.fill();

    // Center highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 100*s, 16*s, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Text "2026"
    if (size >= 128) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `bold ${42*s}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('2026', cx, 420*s);
    }
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

async function generateIcons() {
    console.log('Generating workout icons...\n');

    for (const size of sizes) {
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        drawWorkoutIcon(ctx, size);

        const buffer = canvas.toBuffer('image/png');
        const filename = `icon-${size}x${size}.png`;

        fs.writeFileSync(filename, buffer);
        console.log(`✓ Generated ${filename}`);
    }

    console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
