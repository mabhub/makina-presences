
2.3.0 / 2021-11-26
==================

  * Avoid case mismatch for tri
  * Fix a typo on the "login" page (PresenceForm).
  * Set "today" as default day
  * Highlight hovered presence tri
  * Fix "first day" issue

2.2.0 / 2021-10-23
==================

  * Update vite from 2.6.7 to 2.6.10
  * Update react-query from 3.26.0 to 3.27.0
  * Remove Material-UI v4 dependencies
  * Apply codemods to upgrade Material-UI
  * Install Material-UI v5 peer dependencies
  * Install Material-UI v5 dependencies
  * Remove intermediate context providing setPresence to DayHeader
  * Adjust date management
  * Insure some component memoization
  * Show spots implied in conflicts
  * Insure deleting extraneous presences
  * Fix date filtering in presences query
  * Fix PresenceForm alignement issue
  * Improve UseMenu display & RWD behavior
  * Add repository link in top bar
  * Switch map & calendar position in mobile view

2.1.0 / 2021-10-21
==================

  * Create .env file example
  * Improve legend readability
  * Simplify subscription icons (avoid useless renders)
  * Cleanup some commented code
  * Adjust tooltips
  * Create Legend
  * Create edit mode for spots
  * Manage spot description markdown rendering
  * Adjust "today" calendar stripe style
  * Adjust spot tooltip display timing
  * Manage mobile display
  * Avoid day change when using SpotDialog
  * Manage spot selection with Dialog when map is not available
  * Restore ability to toggle presence from day cards
  * Thicken spots border

2.0.0 / 2021-10-15
==================

  * Add basic description tooltip for spots
  * Enable click behavior for plan spots
  * Remove presence Chip click behaviors
  * Avoid nesting button in DOM
  * Create top menu to change plan & tri
  * Use CSS Grid for main layout
  * Create corner badge for "today"
  * Make main UI full height
  * Show PresenceForm only if data are missing
  * Revamp calendar appearance
  * Remove unsub button for past days
  * Refactor calendar component by relocating some data computation
  * Split PresencePage component as PresencePage & PresenceCalendar
  * Show presences on plans
  * Embed date range selection in usePresences hook
  * Backup createSpot function for future use
  * Manage locked spots
  * Show spot Type colors
  * Make floor plan resizable
  * Adapt business logic to new data storage schema
  * Rename main auth token

1.1.0 / 2021-10-12
==================

  * Upgrade all dependencies
