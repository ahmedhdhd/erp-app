# ERP Application - Styling System

## Overview

This application uses a comprehensive styling system to ensure consistent UI across all components. The system is based on:

1. **Global Styles** (`src/styles.css`) - Base styles and design system
2. **Component-Specific Styles** - Component-level overrides and layout styles
3. **Bootstrap 5** - For responsive grid and components
4. **Font Awesome** - For icons

## Design System

The application follows a design system defined in CSS variables:

- **Colors**: Primary, secondary, success, danger, warning, info
- **Typography**: Consistent font family, sizes, and weights
- **Spacing**: Consistent spacing system using rem units
- **Borders**: Consistent border radius and widths
- **Components**: Standardized cards, buttons, forms, tables

## Global Styles (`src/styles.css`)

Contains:
- CSS variables for the design system
- Base component styles (buttons, forms, cards, tables)
- Utility classes
- Responsive breakpoints
- Print styles

## Component Styles

Each component should:
1. Use global styles whenever possible
2. Only include component-specific overrides
3. Follow the established design system
4. Be responsive

## Form Styles (`src/assets/css/form-styles.css`)

Specialized styles for forms, particularly:
- Command forms (sales orders)
- Purchase order forms
- Compact form layouts with all elements on one line
- Responsive adjustments for different screen sizes

## Shared Component Utilities (`src/assets/css/component-styles.css`)

Reusable styles for common component patterns:
- Advanced search panels
- Section titles
- Form actions
- Utility classes

## Adding New Styles

1. **For global changes**: Modify `src/styles.css`
2. **For form-specific styles**: Add to `src/assets/css/form-styles.css`
3. **For component-specific styles**: Add to the component's CSS file
4. **For shared utilities**: Add to `src/assets/css/component-styles.css`

## Best Practices

1. **Use CSS Variables**: Always use the defined CSS variables for consistency
2. **Mobile-First**: Write styles for mobile first, then use media queries
3. **Utility Classes**: Use existing utility classes when possible
4. **Semantic HTML**: Use appropriate HTML elements for proper styling
5. **Accessibility**: Ensure sufficient color contrast and keyboard navigation

## File Structure

```
src/
├── styles.css                 # Global styles
├── assets/
│   ├── css/
│   │   ├── component-styles.css  # Shared component utilities
│   │   ├── form-styles.css       # Specialized form styles
│   │   └── [other css files]
│   └── docs/
│       └── styling-guide.md      # Detailed styling documentation
├── app/
│   ├── components/
│   │   ├── shared/
│   │   │   └── header/
│   │   │       └── header.component.css  # Component-specific styles
│   │   └── [other components]/
└── README.md                  # This file

## Maintenance

When updating styles:
1. **Global changes**: Update `src/styles.css` and test across components
2. **Form changes**: Update `src/assets/css/form-styles.css`
3. **Component changes**: Only modify the specific component's CSS
4. **New utilities**: Add to appropriate shared CSS files
5. **Documentation**: Update `styling-guide.md` with significant changes

## Troubleshooting

1. **Styles not applying**: Check specificity and ensure files are imported
2. **Responsive issues**: Verify media query breakpoints
3. **Inconsistencies**: Ensure CSS variables are used consistently
4. **Performance**: Minimize component-specific styles; leverage global styles