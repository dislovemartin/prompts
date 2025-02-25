<!-- SOLNAI:DEVELOPMENT-WORKFLOW -->
# SolnAI Development Workflow: [Feature/Component Name]

## 📋 Task Overview

[Provide a clear, concise description of the feature or component to be developed. Explain its purpose, importance, and how it fits into the overall application architecture.]

**Task Type:** [New Feature | Component Enhancement | Bug Fix | Refactoring]  
**Priority:** [High | Medium | Low]  
**Estimated Effort:** [Small | Medium | Large]  

## 🎯 Development Objectives

- [Primary objective 1]
- [Primary objective 2]
- [Primary objective 3]

## 🔍 Requirements Analysis

### Functional Requirements

- [ ] [Requirement 1]
- [ ] [Requirement 2]
- [ ] [Requirement 3]

### Technical Requirements

- [ ] [Technical requirement 1]
- [ ] [Technical requirement 2]
- [ ] [Technical requirement 3]

### UX/UI Requirements

- [ ] [Design requirement 1]
- [ ] [Design requirement 2]
- [ ] [Design requirement 3]

### Accessibility Requirements

- [ ] [A11y requirement 1]
- [ ] [A11y requirement 2]
- [ ] [A11y requirement 3]

### Performance Requirements

- [ ] [Performance requirement 1]
- [ ] [Performance requirement 2]
- [ ] [Performance requirement 3]

## 🛠️ Development Workflow

### Phase 1: Environment Setup and Planning

1. **Verify Development Environment**
   - Confirm Next.js version (^14.1.0)
   - Verify TypeScript configuration
   - Check required dependencies

2. **Set Up Feature Branch**

   ```bash
   git checkout -b feature/[feature-name]
   ```

3. **Define Component Architecture**
   - Determine if server or client component
   - Plan state management approach
   - Identify reusable sub-components
   - Map data flow and component hierarchy

### Phase 2: Core Implementation

4. **Create Directory Structure**

   ```
   app/
   ├── components/
   │   └── features/
   │       └── [feature-name]/
   │           ├── index.ts
   │           ├── [ComponentName].tsx
   │           └── [ComponentName].test.tsx
   ```

5. **Implement Component Skeleton**

   ```tsx
   // Example component skeleton
   import React from 'react';
   
   interface [ComponentName]Props {
     // Define props here
   }
   
   export function [ComponentName]({ ...props }: [ComponentName]Props) {
     // Implementation
     return (
       <div>
         {/* Component structure */}
       </div>
     );
   }
   ```

6. **Implement Core Functionality**
   - Build core feature logic
   - Implement state management
   - Set up API integration if needed
   - Add proper error handling

7. **Implement UI Elements**
   - Follow design system guidelines
   - Implement responsive layouts
   - Add appropriate animations/transitions
   - Ensure dark mode compatibility

### Phase 3: Testing and Validation

8. **Write Unit Tests**

   ```tsx
   // Example test structure
   import { render, screen } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   import { [ComponentName] } from './[ComponentName]';
   
   describe('[ComponentName]', () => {
     it('renders correctly', () => {
       // Test implementation
     });
     
     it('handles user interaction correctly', async () => {
       // Test user interactions
     });
     
     it('manages error states correctly', () => {
       // Test error handling
     });
   });
   ```

9. **Conduct Code Review**
   - Verify TypeScript types
   - Check for ESLint/Prettier compliance
   - Ensure proper error handling
   - Validate performance optimizations

10. **Perform Accessibility Testing**
    - Test keyboard navigation
    - Verify screen reader compatibility
    - Check color contrast
    - Validate ARIA attributes

### Phase 4: Final Polish and Documentation

11. **Optimize Performance**
    - Check for unnecessary re-renders
    - Optimize bundle size
    - Implement lazy loading if appropriate
    - Add appropriate caching strategies

12. **Add Documentation**
    - Update component comments
    - Document props and functions
    - Add usage examples
    - Update README if necessary

13. **Prepare Pull Request**

    ```bash
    git add .
    git commit -m "feat: implement [feature-name]"
    git push -u origin feature/[feature-name]
    ```

## 🔗 Dependencies and Integrations

### External Dependencies

- [Dependency 1] - [Version] - [Purpose]
- [Dependency 2] - [Version] - [Purpose]
- [Dependency 3] - [Version] - [Purpose]

### Internal Dependencies

- [Internal component/service 1] - [Purpose]
- [Internal component/service 2] - [Purpose]
- [Internal component/service 3] - [Purpose]

## 🧪 Validation Checklist

Reference: [SOLNAI:PROMPT-VALIDATION]

### Implementation Validation

- [ ] All functional requirements implemented
- [ ] All technical requirements met
- [ ] Design requirements followed
- [ ] No console errors or warnings
- [ ] Component is properly typed with TypeScript
- [ ] Component follows project naming conventions

### Testing Validation

- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Edge cases handled appropriately
- [ ] Responsive behavior verified
- [ ] Accessibility requirements met

### Performance Validation

- [ ] No unnecessary re-renders
- [ ] Efficient state management
- [ ] Optimized for bundle size
- [ ] Lazy loading implemented where appropriate
- [ ] Network requests optimized

### Code Quality Validation

- [ ] ESLint shows no errors or warnings
- [ ] TypeScript shows no type errors
- [ ] Code follows project style guide
- [ ] No duplicate or dead code
- [ ] Proper error handling implemented

## 🚨 Error Handling Strategy

| Error Scenario | Expected Behavior | Recovery Mechanism |
|----------------|-------------------|-------------------|
| [Scenario 1]   | [Behavior 1]      | [Recovery 1]      |
| [Scenario 2]   | [Behavior 2]      | [Recovery 2]      |
| [Scenario 3]   | [Behavior 3]      | [Recovery 3]      |

## 🔄 State Management

### Client-Side State

- [State 1] - [Management approach] - [Purpose]
- [State 2] - [Management approach] - [Purpose]
- [State 3] - [Management approach] - [Purpose]

### Server-Side State

- [State 1] - [Management approach] - [Purpose]
- [State 2] - [Management approach] - [Purpose]
- [State 3] - [Management approach] - [Purpose]

## 📊 Performance Monitoring

- [ ] Set up performance metrics tracking
- [ ] Monitor render times
- [ ] Track bundle size impact
- [ ] Analyze network request performance

## 📈 Improvement Opportunities

- [Potential future enhancement 1]
- [Potential future enhancement 2]
- [Potential future enhancement 3]

---

## Development Progress Tracking

### Phase 1: Environment Setup and Planning

- [ ] Task 1 - [Status]
- [ ] Task 2 - [Status]
- [ ] Task 3 - [Status]

### Phase 2: Core Implementation

- [ ] Task 1 - [Status]
- [ ] Task 2 - [Status]
- [ ] Task 3 - [Status]

### Phase 3: Testing and Validation

- [ ] Task 1 - [Status]
- [ ] Task 2 - [Status]
- [ ] Task 3 - [Status]

### Phase 4: Final Polish and Documentation

- [ ] Task 1 - [Status]
- [ ] Task 2 - [Status]
- [ ] Task 3 - [Status]

## Notes and Challenges

- [Note or challenge 1]
- [Note or challenge 2]
- [Note or challenge 3]
<!-- /SOLNAI:DEVELOPMENT-WORKFLOW -->