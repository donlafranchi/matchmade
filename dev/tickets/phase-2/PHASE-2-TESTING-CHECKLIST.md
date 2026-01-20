# Phase 2 Testing Checklist

**Date:** 2025-12-26
**Status:** Ready for testing
**Dev Server:** http://localhost:3000

---

## UI Testing (Manual)

### 1. View Completed Interpretations
- [ ] Login to app (test-interpretation@example.com or your test user)
- [ ] Navigate to romantic context page
- [ ] Click "Interpretations" tab
- [ ] Verify header: "Here's what we're hearing from you"
- [ ] Verify "Last analyzed" timestamp displays
- [ ] Verify profile summary text appears

### 2. Gabor Maté Insights Display
- [ ] Verify "Attachment & Connection" insight card shows
- [ ] Verify attachment style (e.g., "anxious") displays
- [ ] Verify "Core Needs" section with list of needs
- [ ] Verify confidence badges show (should be ~85%)
- [ ] Verify confidence badge colors (green ≥80%, yellow 70-79%, gray <70%)
- [ ] Verify "Authentic Self" section (if available)
- [ ] Verify "Patterns & Coping" section (if available)

### 3. Evidence Quotes
- [ ] Click "Show evidence" on attachment insight
- [ ] Verify evidence quotes expand below
- [ ] Verify quotes are actual user messages (italicized, smaller text)
- [ ] Click "Hide evidence"
- [ ] Verify evidence collapses smoothly

### 4. Manual Refresh
- [ ] Click "Refresh" button
- [ ] Verify button changes to "Refreshing..."
- [ ] Verify button is disabled during refresh
- [ ] Wait ~5-10 seconds
- [ ] Verify data refreshes (timestamp updates)
- [ ] Verify no page reload (smooth update)

### 5. Empty State (<10 Messages)
- [ ] Create new test user with fresh context
- [ ] Send exactly 5 messages in chat
- [ ] Click "Interpretations" tab
- [ ] Verify shows "Share more to see insights" message
- [ ] Verify shows current message count (5)
- [ ] Verify shows how many more needed (5 more)
- [ ] Verify NO error state appearance (encouraging, not blocking)

### 6. Processing State
- [ ] Use user with 10+ messages, never analyzed
- [ ] Click "Interpretations" tab
- [ ] Verify shows "Analyzing your conversation..." message
- [ ] Verify pulsing animation appears
- [ ] Verify message says "30-60 seconds"
- [ ] Verify message says "Feel free to continue chatting"
- [ ] Wait for completion or manually trigger: `POST /api/profile/analyze`
- [ ] Verify view auto-updates when complete

### 7. Toggle Between Views
- [ ] Start on "Profile Form" tab (default)
- [ ] Verify form is visible
- [ ] Click "Interpretations" tab
- [ ] Verify form disappears smoothly
- [ ] Verify interpretations load
- [ ] Verify tab underline indicator moves
- [ ] Click "Profile Form" tab
- [ ] Verify interpretations disappear
- [ ] Verify form reappears
- [ ] Verify NO data loss in form fields

### 8. Mobile Responsive
- [ ] Open browser DevTools (F12)
- [ ] Set viewport to iPhone SE (375px width)
- [ ] Navigate through all states above
- [ ] Verify NO horizontal scroll
- [ ] Verify text is readable (≥14px)
- [ ] Verify buttons are at least 44px touch targets
- [ ] Verify confidence badges don't overflow
- [ ] Verify layout stacks vertically
- [ ] Test at 320px width (minimum)

### 9. Keyboard Navigation
- [ ] Use ONLY keyboard (no mouse)
- [ ] Press Tab to navigate through page
- [ ] Verify can focus on "Interpretations" tab
- [ ] Press Enter to switch to interpretations
- [ ] Verify can focus on "Refresh" button
- [ ] Verify can focus on "Show evidence" buttons
- [ ] Verify focus indicators are visible
- [ ] Verify tab order is logical (top to bottom, left to right)

### 10. Multiple Contexts
- [ ] Create user with BOTH romantic AND friendship contexts
- [ ] View romantic interpretations
- [ ] Switch to friendship context (via "Other contexts" links)
- [ ] Click "Interpretations" tab
- [ ] Verify different interpretations load
- [ ] Verify context-specific insights (if any)
- [ ] Verify NO romantic-specific insights shown in friendship

### 11. Visual Inspection
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

### 12. Performance
- [ ] Initial load <1 second
- [ ] Tab switch instant (<100ms)
- [ ] Refresh animation smooth (60fps)
- [ ] Evidence expand/collapse smooth
- [ ] No layout shift when loading
- [ ] Open browser console (F12)
- [ ] Verify NO console errors
- [ ] Verify NO React warnings

---

## API Testing

### 13. Background Job Triggers
- [ ] Send 5 new messages in chat
- [ ] Check database: `SELECT * FROM "AnalysisJob" ORDER BY "createdAt" DESC LIMIT 1;`
- [ ] Verify job was created with status "pending"
- [ ] Verify priority is "low" (chat trigger)
- [ ] Verify source is "chat"

### 14. Rate Limiting
- [ ] Trigger analysis manually (click Refresh)
- [ ] Wait 1 minute
- [ ] Try to refresh again
- [ ] Verify NOT creates duplicate job (check logs)
- [ ] Wait 1 hour
- [ ] Refresh again
- [ ] Verify DOES create new job

### 15. Job Queue Priority
- [ ] Create 3 jobs: high, medium, low priority
- [ ] Check database: `SELECT * FROM "AnalysisJob" WHERE status = 'pending' ORDER BY priority, "createdAt";`
- [ ] Verify high priority (value 0) is first
- [ ] Verify medium (value 1) is second
- [ ] Verify low (value 2) is last

---

## Browser Compatibility

### 16. Cross-Browser Testing
- [ ] Chrome (latest) - macOS
- [ ] Safari (latest) - macOS
- [ ] Firefox (latest) - macOS
- [ ] Mobile Safari - iOS (if available)
- [ ] Chrome Mobile - Android (if available)
- [ ] Edge - Windows (if available)

---

## Accessibility (Screen Reader)

### 17. VoiceOver Testing (macOS)
- [ ] Enable VoiceOver (Cmd+F5)
- [ ] Navigate to interpretations view
- [ ] Verify announces "Here's what we're hearing from you"
- [ ] Verify announces loading states
- [ ] Verify announces confidence percentages
- [ ] Verify describes evidence expand/collapse state
- [ ] Verify button labels are clear
- [ ] Disable VoiceOver

---

## Edge Cases

### 18. Empty Interpretations (Low Confidence)
- [ ] Manually set interpretations to {} in database
- [ ] Refresh interpretations view
- [ ] Verify shows yellow info box: "We need a bit more conversation..."
- [ ] Verify NO error state (this is valid)

### 19. Network Failure Simulation
- [ ] Open DevTools > Network tab
- [ ] Set throttling to "Offline"
- [ ] Click "Interpretations" tab
- [ ] Verify shows ErrorState with retry button
- [ ] Set throttling back to "No throttling"
- [ ] Click "Retry"
- [ ] Verify loads successfully

### 20. Long Insight Text
- [ ] Manually insert insight with >500 characters
- [ ] View interpretations
- [ ] Verify text wraps naturally
- [ ] Verify NO truncation (full text visible)

---

## Comprehensive Testing

### 21. End-to-End Flow
- [ ] Create brand new user account
- [ ] Complete onboarding (select romantic context)
- [ ] Send 3 messages in chat
- [ ] Check interpretations (should see empty state)
- [ ] Send 7 more messages (total 10)
- [ ] Wait 5 minutes for background job to process
- [ ] Check interpretations (should see processing or completed)
- [ ] Wait for analysis to complete
- [ ] View completed interpretations
- [ ] Verify all insights display correctly
- [ ] Click refresh and verify update

---

## Remaining Phase 2 Items

### 22. Comprehensive Phase 2 Testing
- [ ] Test full interpretation pipeline with multiple users
- [ ] Test all 3 frameworks when implemented (Gabor Maté, Esther Perel, etc.)
- [ ] Test context-specific vs shared interpretations
- [ ] Monitor logs for errors during testing
- [ ] Document any bugs in dev/tickets/slice-1-issues.md

---

## Next Steps (After Testing)

### 23. Review Unresolved Issues
- [ ] Open dev/tickets/slice-1-issues.md
- [ ] Prioritize issues by severity
- [ ] Fix critical bugs before proceeding
- [ ] Document any new issues discovered during testing

### 24. Deployment Decision
- [ ] Decide: Deploy to staging for real user testing?
- [ ] OR: Proceed directly to Phase 3?
- [ ] Update dev/project-state.md with decision

### 25. Phase 3 Planning
- [ ] Review dev/vision/ documents
- [ ] Plan Profile View Redesign:
  - Remove form-based profile entry
  - Interpretations-first approach
  - Refinement flow (user corrections)
  - Multi-framework synthesis
- [ ] Create Phase 3 ticket breakdown

---

## Testing Tips

**Database Inspection:**
```bash
# Check latest analysis job
psql $DATABASE_URL -c "SELECT * FROM \"AnalysisJob\" ORDER BY \"createdAt\" DESC LIMIT 5;"

# Check interpretation status
psql $DATABASE_URL -c "SELECT id, \"contextType\", \"interpretationStatus\", \"lastAnalyzed\" FROM \"ContextProfile\" WHERE \"userId\" = 'YOUR_USER_ID';"

# Check message count
psql $DATABASE_URL -c "SELECT \"contextType\", COUNT(*) FROM \"ChatMessage\" WHERE \"contextProfileId\" = 'YOUR_PROFILE_ID' GROUP BY \"contextType\";"
```

**Trigger Analysis Manually:**
```bash
curl -X POST http://localhost:3000/api/profile/analyze \
  -H "Content-Type: application/json" \
  -d '{"contextType": "romantic"}' \
  -b "your-session-cookie"
```

**View Interpretations:**
```bash
curl http://localhost:3000/api/profile/interpretations?contextType=romantic \
  -b "your-session-cookie" | jq
```

---

## Status Legend

- [ ] Not started
- [x] Completed
- [!] Issue found (document in slice-1-issues.md)
- [~] Partially complete

---

## Notes

_Use this section to document any observations, bugs, or improvements during testing:_

-

---

**Last Updated:** 2025-12-26
**Phase 2 Status:** 5/5 tickets complete, ready for testing
**Next Milestone:** Comprehensive testing → Phase 3 planning
