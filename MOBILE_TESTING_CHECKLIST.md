# Mobile Testing Checklist for Sandstone

## Pre-Flight Checks

- [ ] Run `npm run build` successfully
- [ ] No console errors or warnings
- [ ] All TypeScript types pass
- [ ] All unit tests pass

## Device Testing Matrix

### iOS Devices

| Device | OS Version | Browser | Status |
|--------|------------|---------|--------|
| iPhone SE (3rd gen) | iOS 17 | Safari | ⬜ |
| iPhone 14 | iOS 17 | Safari | ⬜ |
| iPhone 14 Pro Max | iOS 17 | Safari | ⬜ |
| iPad Air | iPadOS 17 | Safari | ⬜ |
| iPad Pro 12.9" | iPadOS 17 | Safari | ⬜ |

### Android Devices

| Device | OS Version | Browser | Status |
|--------|------------|---------|--------|
| Samsung Galaxy S23 | Android 14 | Chrome | ⬜ |
| Google Pixel 7 | Android 14 | Chrome | ⬜ |
| Samsung Galaxy Tab S9 | Android 14 | Chrome | ⬜ |
| Xiaomi Redmi Note 12 | Android 13 | Chrome | ⬜ |

## Touch Target Testing

### Navigation

- [ ] All sidebar items have 44px+ touch targets
- [ ] Bottom nav items have 64px+ width and 56px+ height
- [ ] Menu button (hamburger) has 44px+ touch target
- [ ] Close button in drawer has 44px+ touch target

### Buttons

- [ ] Primary buttons have 48px+ height
- [ ] Icon buttons have 48px+ width and height
- [ ] Touch feedback visible on all buttons
- [ ] No overlapping touch targets

### Cards

- [ ] Feature cards have full-width pressable area
- [ ] Activity list items have 52px+ height
- [ ] Visual feedback on press (scale animation)

### Forms

- [ ] Input fields have 44px+ height
- [ ] Checkboxes/radio buttons have 24px+ size
- [ ] Form inputs use 16px font (prevents iOS zoom)

## Gesture Testing

### Swipe Gestures

- [ ] Swipe left on mobile drawer closes it
- [ ] Swipe gestures don't interfere with scrolling
- [ ] Swipe threshold feels natural (50-80px)

### Pull to Refresh

- [ ] Pull gesture triggers refresh
- [ ] Visual indicator shows during pull
- [ ] Refresh completes and animates back
- [ ] Works only when at top of page

### Scroll Behavior

- [ ] Smooth scrolling enabled
- [ ] Momentum scrolling on iOS
- [ ] Scroll position maintained on navigation
- [ ] No scroll jank or freezing

## Responsive Layout Testing

### Breakpoints

- [ ] Mobile (< 640px): Bottom nav visible, sidebar hidden
- [ ] Tablet (640px - 1024px): Sidebar visible, condensed
- [ ] Desktop (> 1024px): Full sidebar, no bottom nav

### Content Adaptation

- [ ] Stats grid: 2 columns on mobile, 4 on desktop
- [ ] Feature cards: 1 column on mobile, 2 on desktop
- [ ] Typography scales appropriately
- [ ] Padding/margins adjust per breakpoint

### Safe Areas

- [ ] Content not obscured by notch (iPhone X+)
- [ ] Bottom nav accounts for home indicator
- [ ] Status bar content visible
- [ ] Landscape mode handles safe areas

## Performance Testing

### Load Performance

- [ ] First Contentful Paint < 1.5s on 4G
- [ ] Time to Interactive < 3.5s on 4G
- [ ] No layout shift during load
- [ ] Images lazy loaded

### Runtime Performance

- [ ] 60fps animations
- [ ] No dropped frames during scroll
- [ ] Touch response < 100ms
- [ ] Memory usage stable

### Network Performance

- [ ] Works on slow 3G
- [ ] Graceful degradation offline
- [ ] Cached assets load quickly
- [ ] API calls have loading states

## Accessibility Testing

### Screen Reader (VoiceOver/TalkBack)

- [ ] All interactive elements have labels
- [ ] Navigation announces current page
- [ ] Focus order is logical
- [ ] Dynamic content announced

### Keyboard Navigation

- [ ] Tab order is logical
- [ ] Focus visible on all elements
- [ ] Escape closes modals/drawers
- [ ] Enter/Space activates buttons

### Visual Accessibility

- [ ] Color contrast meets WCAG AA
- [ ] Text readable at 200% zoom
- [ ] Focus indicators visible
- [ ] Reduced motion respected

## PWA Testing

### Installation

- [ ] Add to Home Screen prompt appears
- [ ] App installs successfully
- [ ] Custom icon displays correctly
- [ ] App launches from home screen

### Offline Functionality

- [ ] App loads offline (cached)
- [ ] Appropriate offline messaging
- [ ] Data syncs when back online
- [ ] No errors when offline

### App Behavior

- [ ] Runs in standalone mode (no browser UI)
- [ ] Status bar color matches theme
- [ ] Splash screen displays
- [ ] App shortcuts work

## Browser-Specific Testing

### Safari (iOS)

- [ ] No zoom on input focus
- [ ] Bottom nav not obscured by toolbar
- [ ] Smooth scrolling works
- [ ] Safe areas respected

### Chrome (Android)

- [ ] Address bar hides on scroll
- [ ] Bottom nav positioned correctly
- [ ] Touch events work properly
- [ ] No visual glitches

### Samsung Internet

- [ ] Renders correctly
- [ ] Touch targets work
- [ ] No Samsung-specific issues

## Orientation Testing

### Portrait

- [ ] Layout adapts correctly
- [ ] All content visible
- [ ] No horizontal scroll
- [ ] Bottom nav stays at bottom

### Landscape

- [ ] Layout adapts correctly
- [ ] Content reflows properly
- [ ] Safe areas handled
- [ ] No content cut off

## Edge Cases

### Extreme Viewports

- [ ] Very small screens (320px width)
- [ ] Very large screens (tablet landscape)
- [ ] Split-screen multitasking
- [ ] Picture-in-picture mode

### Interaction Edge Cases

- [ ] Rapid button taps
- [ ] Multiple simultaneous touches
- [ ] Touch during animation
- [ ] Touch while loading

### Network Edge Cases

- [ ] Very slow connection
- [ ] Intermittent connection
- [ ] Airplane mode
- [ ] Roaming conditions

## Regression Testing

### Core Functionality

- [ ] User can log in/out
- [ ] User can grade responses
- [ ] User can create/view flashcards
- [ ] User can take quizzes
- [ ] User can view documents
- [ ] AI chat works

### Data Persistence

- [ ] Data saves correctly
- [ ] Data loads on refresh
- [ ] No data loss on navigation
- [ ] Sync works across devices

## Bug Reporting Template

```
**Device:** [e.g., iPhone 14 Pro]
**OS:** [e.g., iOS 17.1]
**Browser:** [e.g., Safari]
**Screen Size:** [e.g., 393 × 852]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**

**Actual Behavior:**

**Screenshots/Videos:**

**Console Errors:**
```

## Sign-Off Checklist

- [ ] All critical tests passed
- [ ] No P0 or P1 bugs open
- [ ] Performance metrics met
- [ ] Accessibility audit passed
- [ ] Design review approved
- [ ] Product owner sign-off

## Post-Release Monitoring

- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] User feedback collected
- [ ] Analytics dashboard reviewed
- [ ] Crash reports monitored
