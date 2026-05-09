# Zeusnent E-Commerce Images

This directory contains all image assets for the Zeusnent e-commerce platform.

## Directory Structure

```
images/
├── products/           # Product images
│   ├── electronics/    # Electronics products
│   ├── fashion/        # Fashion products
│   ├── home/          # Home & Garden products
│   └── sports/        # Sports & Outdoors products
├── categories/         # Category images
├── banners/           # Hero banners and promotional banners
├── brands/            # Brand logos
├── users/             # User avatars and profile images
├── ui/                # UI elements and icons
└── placeholders/      # Placeholder images
```

## Image Guidelines

### Product Images
- **Main Images**: 800x800px, square format
- **Thumbnails**: 300x300px, square format
- **Gallery Images**: 800x800px, multiple angles
- **Format**: WebP preferred, PNG/JPG fallback

### Category Images
- **Category Cards**: 400x300px, landscape format
- **Category Banners**: 1200x400px, landscape format

### Banners
- **Hero Banners**: 1920x800px, landscape format
- **Promotional Banners**: 1200x600px, landscape format

### Brand Logos
- **Brand Logos**: 200x100px, transparent background preferred
- **Format**: SVG preferred, PNG fallback

## Image Optimization
- All images should be optimized for web
- Use WebP format for better compression
- Include alt text for accessibility
- Implement lazy loading for performance

## Placeholder Images
For development and testing, use the following placeholder services:
- Products: `https://picsum.photos/seed/product-{id}/800/800`
- Thumbnails: `https://picsum.photos/seed/product-{id}/300/300`
- Categories: `https://picsum.photos/seed/category-{name}/400/300`
- Banners: `https://picsum.photos/seed/banner-{name}/1920/800`
