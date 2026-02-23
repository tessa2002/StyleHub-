# Virtual Garment Preview Images

This folder contains the 2D images used for the virtual garment preview system.

## Required Images

### Body Silhouettes (Base Layer)
Place body silhouette images for different body types:

- `hourglass_body.png` - Hourglass body shape
- `pear_body.png` - Pear body shape  
- `apple_body.png` - Apple body shape
- `rectangle_body.png` - Rectangle body shape
- `inverted_triangle_body.png` - Inverted triangle body shape
- `default_body.png` - Default/fallback body image

**Image Requirements:**
- PNG format with transparent background
- Resolution: 800x1200px recommended
- Body should be centered
- Neutral standing pose
- Skin tone: natural/beige

### Garment Overlays (Overlay Layer)
Place garment images for different types and silhouettes:

**Format:** `{garmentType}_{silhouette}.png`

Examples:
- `kurthi_a_line.png`
- `kurthi_straight.png`
- `saree_traditional.png`
- `lehenga_a_line.png`
- `gown_mermaid.png`
- `default_garment.png` - Default/fallback garment

**Image Requirements:**
- PNG format with transparent background
- Resolution: 800x1200px (same as body)
- Garment should align with body silhouette
- Leave space for head/neck area
- Can include fabric texture

## Image Naming Convention

### Body Images:
```
{bodyShape}_body.png
```

### Garment Images:
```
{garmentType}_{silhouette}.png
```

**Body Shapes:**
- hourglass
- pear
- apple
- rectangle
- inverted_triangle

**Garment Types:**
- kurthi
- short_kurthi
- saree
- lehenga
- gown
- anarkali
- salwar_kameez
- palazzo_set

**Silhouettes:**
- a_line
- straight
- mermaid
- empire
- sheath
- traditional
- designer

## How to Create Images

### Option 1: Use Design Software
1. Create in Photoshop/Illustrator
2. Export as PNG with transparency
3. Ensure proper alignment

### Option 2: Use AI Image Generation
1. Use DALL-E, Midjourney, or Stable Diffusion
2. Prompt: "fashion mannequin body silhouette, {bodyType}, transparent background, front view"
3. For garments: "Indian {garmentType} dress, {silhouette} style, transparent background, flat lay"

### Option 3: Download from Stock Sites
1. Freepik: https://www.freepik.com/
2. Pngtree: https://pngtree.com/
3. Search: "body silhouette PNG" or "dress PNG transparent"

## Quick Start

To get started quickly, you can use placeholder images:

1. Create simple body silhouettes in any image editor
2. Create basic garment shapes
3. Save as PNG with transparency
4. Place in this folder

The system will automatically load and layer them!

## Current Status

- [ ] Body silhouettes added
- [ ] Garment overlays added
- [ ] Default fallback images added

Once images are added, the virtual try-on will display them automatically!
