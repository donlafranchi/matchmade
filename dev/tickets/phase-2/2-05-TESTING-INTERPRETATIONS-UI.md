# Testing Interpretations UI (Ticket 2-05)

## Manual Testing Guide

### Prerequisites
1. Dev server running: `npm run dev`
2. Database populated with test user (test-interpretation@example.com)
3. User has completed analysis (from Ticket 2-02 testing)

### Test Scenarios

#### Scenario 1: View Completed Interpretations
**Setup:** User with 15+ messages and completed analysis

1. Navigate to http://localhost:3000
2. Login as test-interpretation@example.com
3. Go to romantic context page
4. Click "Interpretations" tab
5. **Expected:**
   - See "Here's what we're hearing from you" header
   - See last analyzed timestamp
   - See profile summary text
   - See "Attachment & Connection" insight card
   - See "Core Needs" with list of needs
   - See confidence badges (should show ~85%)
   - See "Refresh" button

6. Click "Show evidence" on attachment insight
7. **Expected:**
   - Evidence quotes expand
   - See actual user message quotes

8. Click "Hide evidence"
9. **Expected:**
   - Evidence collapses

10. Click "Refresh" button
11. **Expected:**
    - Button changes to "Refreshing..."
    - After ~5 seconds, data refreshes
    - Timestamp updates

#### Scenario 2: Empty State (Insufficient Messages)
**Setup:** User with <10 messages

1. Create new test user
2. Send 5 messages in chat
3. Click "Interpretations" tab
4. **Expected:**
   - See "Share more to see insights" message
   - See current message count (5)
   - See how many more needed (5 more)
   - No error state

#### Scenario 3: Processing State
**Setup:** Trigger analysis manually

1. User with 10+ messages, never analyzed
2. Click "Interpretations" tab
3. API should auto-trigger analysis
4. **Expected:**
   - See "Analyzing your conversation..." message
   - See pulsing animation
   - Message says "30-60 seconds"

5. Wait for completion (or manually trigger: `POST /api/profile/analyze`)
6. **Expected:**
   - View auto-updates when complete
   - Shows interpretations

#### Scenario 4: Failed State
**Setup:** Simulate API failure

1. Temporarily break ANTHROPIC_API_KEY in .env
2. Trigger analysis
3. Wait for failure
4. Click "Interpretations" tab
5. **Expected:**
   - See "Analysis failed" message
   - See error details
   - See "Try again" button

6. Fix API key
7. Click "Try again"
8. **Expected:**
   - Button shows "Retrying..."
   - Analysis completes successfully
   - Shows interpretations

#### Scenario 5: Mobile Responsive
1. Open browser DevTools
2. Set viewport to iPhone SE (375px width)
3. Navigate through all states
4. **Expected:**
   - No horizontal scroll
   - Text readable (≥16px)
   - Buttons at least 44px touch targets
   - Confidence badges don't overflow
   - Layout stacks vertically

#### Scenario 6: Accessibility
1. Use keyboard only (no mouse)
2. Tab through page
3. **Expected:**
   - Can focus on "Interpretations" tab
   - Can focus on "Refresh" button
   - Can focus on "Show evidence" buttons
   - Focus indicators visible
   - Proper tab order

4. Use screen reader (VoiceOver on Mac)
5. **Expected:**
   - Announces "Here's what we're hearing from you"
   - Announces loading states
   - Announces confidence percentages
   - Describes evidence expand/collapse state

#### Scenario 7: Toggle Between Views
1. Start on "Profile Form" tab (default)
2. Click "Interpretations" tab
3. **Expected:**
   - Form disappears
   - Interpretations load
   - Tab underline indicator moves

4. Click "Profile Form" tab
5. **Expected:**
   - Interpretations disappear
   - Form reappears
   - No data loss in form

#### Scenario 8: Multiple Contexts
1. Have user with romantic AND friendship contexts
2. View romantic interpretations
3. Switch to friendship context
4. Click "Interpretations" tab
5. **Expected:**
   - Different interpretations load
   - Context-specific insights (if any)
   - No romantic-specific insights shown

### Visual Inspection Checklist

- [ ] Typography hierarchy clear (h2 > h3 > h4 > p)
- [ ] Spacing consistent (6-8px between related items)
- [ ] Colors accessible (contrast ratio ≥4.5:1)
- [ ] Confidence badges subtle (not alarming)
- [ ] Evidence quotes visually distinct (italic, smaller)
- [ ] Loading states centered and clear
- [ ] Error states not scary (encouraging retry)
- [ ] Borders subtle (not harsh)
- [ ] Rounded corners consistent
- [ ] Hover states visible but subtle

### Performance Checklist

- [ ] Initial load <1 second
- [ ] Tab switch instant (<100ms)
- [ ] Refresh animation smooth (60fps)
- [ ] Evidence expand/collapse smooth
- [ ] No layout shift when loading
- [ ] No console errors
- [ ] No React warnings

### Browser Testing

Test in:
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Automated Testing (Future)

### Component Tests (Jest + Testing Library)
```typescript
describe('InterpretationsView', () => {
  it('renders loading state initially', () => {
    render(<InterpretationsView contextType="romantic" />);
    expect(screen.getByText(/loading your insights/i)).toBeInTheDocument();
  });

  it('renders empty state when insufficient messages', async () => {
    // Mock API to return messageCount < 10
    render(<InterpretationsView contextType="romantic" />);
    await waitFor(() => {
      expect(screen.getByText(/share more to see insights/i)).toBeInTheDocument();
    });
  });

  it('renders interpretations when completed', async () => {
    // Mock API to return completed interpretations
    render(<InterpretationsView contextType="romantic" />);
    await waitFor(() => {
      expect(screen.getByText(/here's what we're hearing from you/i)).toBeInTheDocument();
    });
  });

  it('expands evidence on button click', async () => {
    render(<InterpretationsView contextType="romantic" />);
    // ... test evidence expand/collapse
  });
});
```

### E2E Tests (Playwright)
```typescript
test('user can view interpretations', async ({ page }) => {
  await page.goto('/contexts/romantic');
  await page.click('text=Interpretations');
  await expect(page.getByText(/here's what we're hearing from you/i)).toBeVisible();
});

test('user can refresh interpretations', async ({ page }) => {
  await page.goto('/contexts/romantic');
  await page.click('text=Interpretations');
  await page.click('text=Refresh');
  await expect(page.getByText(/refreshing/i)).toBeVisible();
  // Wait for completion...
});
```

## Known Issues / Future Enhancements

### Known Issues
- None currently

### Future Enhancements (Not in this ticket)
1. User feedback buttons ("This feels right" / "Not quite")
2. Animation transitions between states
3. Skeleton loading instead of spinner
4. Print-friendly view
5. Export as PDF
6. Dark mode support
7. Compare interpretations over time
8. Voice-over audio version

## Success Criteria

**The UI is considered complete when:**
- [ ] All 8 test scenarios pass
- [ ] Visual inspection checklist complete
- [ ] Performance metrics met
- [ ] Mobile responsive on 320px width
- [ ] Accessible via keyboard and screen reader
- [ ] No console errors or warnings
- [ ] Works in all major browsers
- [ ] Toggle between form and interpretations smooth
- [ ] Users feel understood (not analyzed)
- [ ] Interface gets out of the way (not overwhelming)
