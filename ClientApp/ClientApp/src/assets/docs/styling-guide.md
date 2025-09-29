# ERP Application Styling Guide

## Overview

This document explains the global styling system implemented for the ERP application to ensure consistent UI across all components.

## Global Styles (styles.css)

The global styles are defined in `src/styles.css` and include:

### CSS Variables (Design System)

We've defined a comprehensive design system using CSS variables:

```css
:root {
  /* Colors */
  --primary-color: #0d6efd;
  --secondary-color: #6c757d;
  --success-color: #198754;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #0dcaf0;
  --light-color: #f8f9fa;
  --dark-color: #212529;

  /* Typography */
  --font-family-sans-serif: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-size-base: 0.875rem;

  /* Spacing */
  --spacer: 1rem;
  --spacer-0: 0;
  --spacer-1: calc(var(--spacer) * 0.25);
  --spacer-2: calc(var(--spacer) * 0.5);
  --spacer-3: var(--spacer);
  --spacer-4: calc(var(--spacer) * 1.5);
  --spacer-5: calc(var(--spacer) * 3);

  /* Borders */
  --border-radius: 0.375rem;
  --border-radius-lg: 0.5rem;
  --border-radius-sm: 0.25rem;

  /* Components */
  --card-border-radius: 0.75rem;
  --btn-border-radius: 0.5rem;
  --input-border-radius: 0.5rem;
}
```

### Base Components

1. **Cards**
   - Consistent border radius (`--card-border-radius`)
   - Box shadow for depth
   - Padding system

2. **Buttons**
   - Consistent border radius (`--btn-border-radius`)
   - Hover effects and transitions
   - Size variations (normal, small)

3. **Forms**
   - Consistent input styling (`--input-border-radius`)
   - Validation states
   - Label styling

4. **Tables**
   - Consistent header styling
   - Hover states
   - Responsive behavior

5. **Typography**
   - Consistent font family
   - Heading hierarchy
   - Text utilities

## Component-Specific Styles

Component-specific styles should only include:
1. Layout-specific rules
2. Component-specific animations
3. Overrides that cannot be achieved with global styles
4. Responsive adjustments for specific components

### Best Practices

1. **Use CSS Variables**: Always use the defined CSS variables for consistency
   ```css
   .my-component {
     border-radius: var(--border-radius);
     color: var(--primary-color);
   }
   ```

2. **Mobile-First Approach**: Write styles for mobile first, then use media queries for larger screens

3. **Utility Classes**: Use the provided utility classes when possible
   - `.text-center` for center alignment
   - `.d-flex` for flex layouts
   - `.gap-2` for spacing

4. **Responsive Breakpoints**:
   - Small: `max-width: 576px`
   - Medium: `max-width: 768px`
   - Large: `max-width: 1200px`

## Implementation Examples

### Creating a New Component

```html
<!-- my-component.component.html -->
<div class="container-fluid">
  <div class="card">
    <div class="card-header">
      <h5 class="mb-0">Component Title</h5>
    </div>
    <div class="card-body">
      <form>
        <div class="mb-3">
          <label for="name" class="form-label required">Name</label>
          <input type="text" class="form-control" id="name">
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-outline-secondary">
            <i class="fas fa-times me-1"></i>Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save me-1"></i>Save
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
```

### Adding Component-Specific Styles

```css
/* my-component.component.css */
/* Only add styles that cannot be achieved with global styles */

.form-section {
  margin-bottom: var(--spacer-4);
}

@media (max-width: 768px) {
  .form-section {
    margin-bottom: var(--spacer-3);
  }
}
```

## Maintenance

1. **Updating Global Styles**: Changes to `styles.css` affect the entire application
2. **Adding New Variables**: Add new CSS variables to the `:root` section in `styles.css`
3. **Component Refactoring**: When refactoring components, ensure they use global styles where possible

## Troubleshooting

1. **Inconsistent Styling**: Check if the component is using global classes correctly
2. **Responsive Issues**: Ensure proper media query breakpoints are used
3. **Performance**: Minimize component-specific styles; use global styles whenever possible