# PWA Icons

## Quick Setup

You need to generate icons for the PWA to be installable. Choose one of these methods:

### Option 1: Use the Icon Generator (Easiest)

1. Open `generate-icons.html` in your web browser
2. Click "Generate All Icons"
3. Download each icon that appears on the page
4. Icons will be saved directly to this folder

### Option 2: Use an Online Tool

Visit [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator):
1. Upload a 512x512 image with your logo/design
2. Download the generated icon pack
3. Extract to this folder

### Option 3: Use ImageMagick (CLI)

If you have ImageMagick installed:

```bash
cd icons

# Create base 512x512 icon with gradient
convert -size 512x512 gradient:#1a1a2e-#e94560 \
        -gravity center -pointsize 200 -fill white \
        -font Arial-Bold -annotate +0+0 "T26" \
        icon-512x512.png

# Generate all required sizes
for size in 72 96 128 144 152 192 384; do
  convert icon-512x512.png -resize ${size}x${size} icon-${size}x${size}.png
done
```

### Option 4: Design Custom Icons

Use Canva, Figma, or any design tool:
1. Create a 512x512px design
2. Add gradient background (#1a1a2e to #e94560)
3. Add text "T26" or emoji 🏋️
4. Export as PNG
5. Use an online resizer to create all sizes

## Required Sizes

Your app needs these PNG files in this folder:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Notes

- **For local testing**: The app will work without icons, but you won't be able to install it as a PWA
- **For GitHub Pages**: Icons are REQUIRED for the "Add to Home Screen" feature to work
- **Safe zone**: Keep important elements 10% away from edges (they may get cropped on some devices)
- **Format**: Must be PNG files with exact filenames as listed above
