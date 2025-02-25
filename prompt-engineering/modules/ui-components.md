# UI Component Implementation Guide

## 🎨 Overview

This module defines the implementation guidelines for SolnAI UI components. These components serve as the foundation for the application interface and should be implemented with consistency, accessibility, and reusability in mind.

## 📋 Component Library Structure

UI components are organized in the `/src/components/ui/` directory and follow a consistent pattern:

```
src/components/ui/
├── Button.tsx               # Primary button component
├── Card.tsx                 # Card container component
├── Dialog.tsx               # Modal dialog component
├── Dropdown.tsx             # Dropdown menu component
├── Input.tsx                # Text input component
├── Badge.tsx                # Status badge component
├── Avatar.tsx               # User avatar component
├── Tabs.tsx                 # Tabbed interface component
├── Toggle.tsx               # Toggle switch component
├── Toast.tsx                # Toast notification component
└── Tooltip.tsx              # Tooltip component
```

## 🖌️ Design System Integration

All UI components should adhere to the SolnAI design system and utilize Tailwind CSS for styling. Components should support:

1. **Theme Integration**
   - Light and dark mode variants
   - Consistent color palette usage
   - Design token-based styling

2. **Responsive Design**
   - Mobile-first approach
   - Proper scaling across breakpoints
   - Touch-friendly target sizes

3. **Accessibility**
   - ARIA attributes where appropriate
   - Keyboard navigation support
   - Focus management
   - Screen reader compatibility

## 📝 Component Implementation Template

Each UI component should follow this implementation pattern:

```tsx
"use client"

import React from 'react'
import { cn } from '@/lib/utils'

// Define component props with TypeScript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
}

// Implement the component with appropriate defaults
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    isLoading = false, 
    icon,
    children, 
    ...props 
  }, ref) => {
    // Define variant classes using utility function
    const variantClasses = {
      default: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-800 hover:bg-gray-900 text-white',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-800',
      link: 'bg-transparent underline text-blue-600 hover:text-blue-800'
    }
    
    // Define size classes
    const sizeClasses = {
      sm: 'text-sm px-2 py-1',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3'
    }
    
    return (
      <button
        className={cn(
          'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={isLoading || props.disabled}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 inline-block animate-spin">⟳</span>
        )}
        {icon && !isLoading && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
      </button>
    )
  }
)

// Set displayName for better debugging
Button.displayName = 'Button'
```

## 📋 Required UI Components

### 1. Button Component

**Purpose**: Primary interaction element for user actions.

**Variants**:
- `default`: Standard button
- `primary`: Primary action button
- `secondary`: Secondary action button
- `ghost`: Minimal visual button
- `link`: Text-only button that looks like a link

**Properties**:
- `variant`: Visual style of the button
- `size`: Size of the button (sm, md, lg)
- `isLoading`: Show loading state
- `icon`: Optional leading icon
- All standard HTML button attributes

**Accessibility Requirements**:
- Focusable with keyboard
- Visible focus state
- ARIA attributes for non-standard buttons
- Loading state announced to screen readers

### 2. Card Component

**Purpose**: Container for grouping related content.

**Variants**:
- `default`: Standard card
- `interactive`: Card with hover/focus states
- `bordered`: Card with visible border

**Properties**:
- `variant`: Visual style of the card
- `padding`: Padding size or none
- Children components

**Accessibility Requirements**:
- Proper heading hierarchy inside cards
- Sufficient color contrast for content

### 3. Input Component

**Purpose**: Text input field for user data entry.

**Variants**:
- `default`: Standard input
- `filled`: Input with background fill
- `outlined`: Input with visible outline

**Properties**:
- `label`: Input label text
- `variant`: Visual style
- `error`: Error message text
- `icon`: Optional icon
- `helperText`: Helper text below input
- All standard HTML input attributes

**Accessibility Requirements**:
- Associated label
- Error states announced to screen readers
- Clear validation feedback

### 4. Dialog Component

**Purpose**: Modal dialogs for focused interactions.

**Properties**:
- `title`: Dialog title
- `description`: Optional description
- `isOpen`: Control dialog visibility
- `onOpenChange`: Handle open/close events
- Children for dialog content

**Accessibility Requirements**:
- Focus trapped within dialog when open
- ESC key closes dialog
- ARIA roles and attributes
- Focus returns to trigger element when closed

### 5. Dropdown Component

**Purpose**: Menu for providing multiple options in a compact space.

**Properties**:
- `trigger`: Element that opens the dropdown
- `items`: Array of menu items
- `align`: Alignment relative to trigger
- `onSelect`: Selection handler

**Accessibility Requirements**:
- Arrow key navigation
- ARIA menu role attributes
- Keyboard selection support

## 🔍 Implementation Examples

### Button Component Example

```tsx
import { Button } from '@/components/ui/Button'
import { PlusIcon } from 'lucide-react'

// Default button
<Button>Click Me</Button>

// Primary button with icon
<Button variant="primary" icon={<PlusIcon size={16} />}>
  Add Item
</Button>

// Loading state
<Button isLoading>Processing...</Button>

// Disabled state
<Button disabled>Unavailable</Button>

// Link variant
<Button variant="link">Learn More</Button>
```

### Card Component Example

```tsx
import { Card } from '@/components/ui/Card'

<Card>
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="mt-2 text-gray-600">Card content goes here with details about this item.</p>
</Card>

<Card variant="interactive" onClick={() => console.log('Card clicked')}>
  <h3 className="text-lg font-semibold">Interactive Card</h3>
  <p className="mt-2 text-gray-600">Click this card to trigger an action.</p>
</Card>
```

### Input Component Example

```tsx
import { Input } from '@/components/ui/Input'

// Basic input
<Input label="Username" placeholder="Enter your username" />

// With error state
<Input 
  label="Email" 
  placeholder="Enter your email"
  error="Please enter a valid email address" 
/>

// With helper text
<Input 
  label="Password" 
  type="password"
  helperText="Password must be at least 8 characters" 
/>
```

## 🔄 Component Testing Guidelines

Each UI component should include comprehensive tests:

1. **Rendering Tests**
   - Component renders without errors
   - All variants render correctly
   - Responsive behavior works as expected

2. **Interaction Tests**
   - Click handlers work correctly
   - Hover/focus states function properly
   - Loading states display correctly

3. **Accessibility Tests**
   - Screen reader compatibility
   - Keyboard navigation
   - Sufficient color contrast

## 📏 Quality Criteria

UI components should meet these quality standards:

1. **Code Quality**
   - TypeScript types for all props
   - JSDoc comments for public methods
   - Consistent naming conventions
   - No unnecessary re-renders

2. **Visual Consistency**
   - Matches design specifications
   - Consistent spacing and sizing
   - Proper responsive behavior
   - Theme compatibility

3. **Performance**
   - Minimal bundle size
   - Efficient rendering
   - No layout shifts during interactions
   - Smooth animations

---

This module serves as the definitive guide for implementing UI components in the SolnAI application. All components should follow these guidelines to ensure consistency, accessibility, and maintainability. 