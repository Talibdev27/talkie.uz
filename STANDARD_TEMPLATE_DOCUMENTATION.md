# Standardized Wedding Website Template Documentation

## Overview

The standardized wedding template provides a structured, responsive wedding website with mandatory sections and configurable optional components. It follows specific design requirements with elegant typography and mobile-first responsive design.

## Template Structure

### Mandatory Sections (Fixed Order)

1. **Header with Large Couple Photo**
   - Full-width hero image (16:9 aspect ratio)
   - Couple names (h1) - Playfair Display font
   - Wedding date & time display
   - Language switcher (top-right corner)

2. **Welcome Message**
   - Formal invitation text
   - Decorative divider (⚭⚭⚭)
   - Customizable message per language

3. **Wedding Details**
   - Section title: "Töy haqida" (About Wedding)
   - Family names display
   - Date & time confirmation
   - Location with Google Maps integration

4. **RSVP Section**
   - Attendance radio button options
   - Message field for guests
   - Form validation and submission

5. **Comments (Guest Book)**
   - Guest message form
   - Display of existing messages
   - Chronological ordering

### Optional Sections (Configurable)

- **Photo Gallery** - Customizable layout with lightbox
- **Social Media Sharing** - Facebook, WhatsApp integration
- **Gift Registry** - Links and information
- **Accommodation Info** - Hotel recommendations
- **Transportation Details** - Directions and parking

## Typography System

- **Headings**: Playfair Display (400, 500, 600, 700)
- **Body Text**: Open Sans (300, 400, 500, 600, 700)
- **Mobile-first responsive scaling**

## Color Customization

```css
:root {
  --primary-color: #1F2937;    /* Customizable per couple */
  --accent-color: #D4B08C;     /* Customizable per couple */
}
```

## Configuration System

### JSON Structure

```json
{
  "couple": {
    "names": "Bride & Groom",
    "photo": "/path/to/photo.jpg",
    "enableGallery": true,
    "enableSocial": false
  },
  "wedding": {
    "date": "DD.MM.YYYY HH:MM",
    "location": {
      "name": "Venue Name",
      "address": "Full Address",
      "mapLink": "Google Maps URL"
    }
  }
}
```

## Responsive Design

- **Mobile-first approach** with Flexbox/Grid
- **Breakpoints**: 640px, 768px, 1024px, 1280px
- **Touch-friendly** 44px minimum touch targets
- **Elegant image cropping** maintains aspect ratios

## Language Support

- **Uzbek (uz)** - Primary language
- **Russian (ru)** - Secondary language  
- **English (en)** - International language
- **RTL support** ready for future implementation

## Implementation Features

### Seamless Section Management
- When optional sections are disabled, the page automatically reflows
- No empty containers or broken layouts
- Section dividers adjust automatically

### Image Handling
- **Couple photos** maintain 16:9 aspect ratio
- **Geometric pattern fallbacks** when no photo is uploaded
- **Mobile optimization** with proper cropping

### Form Validation
- **Client-side validation** for RSVP forms
- **Server-side validation** with proper error handling
- **Success feedback** for form submissions

## Layout Variations

1. **Minimal** - Only mandatory sections
2. **Default** - Mandatory + photo gallery
3. **Full** - All sections enabled

## SEO Implementation

- **Unique page titles** per wedding
- **Meta descriptions** with couple names and date
- **Open Graph tags** for social media sharing
- **Structured data** for search engines

## Development Guidelines

### Adding New Optional Sections

1. Update the template configuration JSON
2. Add the section component to the template
3. Implement the toggle logic
4. Test responsive behavior

### Customizing Colors

1. Modify CSS custom properties
2. Update the configuration system
3. Test contrast ratios for accessibility

### Managing Translations

1. Add new keys to translation files
2. Update the language switcher
3. Test all language variations

## Browser Compatibility

- **Modern browsers** (Chrome 80+, Firefox 75+, Safari 13+)
- **Mobile browsers** (iOS Safari, Chrome Mobile)
- **Progressive enhancement** for older browsers

## Performance Optimization

- **Lazy loading** for images
- **Font optimization** with font-display: swap
- **Minimal JavaScript** for core functionality
- **Optimized CSS** with purging

## Accessibility Features

- **ARIA labels** for interactive elements
- **Keyboard navigation** support
- **Screen reader** compatibility
- **High contrast** color combinations

## Deployment Notes

- All assets are optimized for production
- Configuration files are validated
- Error boundaries handle edge cases
- Graceful degradation for missing data