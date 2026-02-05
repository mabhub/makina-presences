4.4.0 / 2026-02-06
==================

  * Refactor lambda functions with dependency injection and add comprehensive tests
  * Replace hardcoded year with dynamic date range calculation
  * Externalize Sentry DSN to environment variable
  * Expose application version in UI and global scope
  * Migrate remaining components to use plan UUID with useSpots
  * Add keyboard shortcuts to parking confirmation dialog
  * Add Enter key support to submit spot selection dialog
  * Fix Netlify Lambda handler signature to support both deployment and testing
  * Fix Netlify lambda deployment by moving tests to __tests__ subdirectory
  * Fix spot contextual menu not appearing after refactor
  * Fix useEffect cleanup errors in calendar components

4.3.0 / 2026-01-31
==================

  * Integrate Sentry error monitoring and reporting
  * Introduce Sentry link in header with environment variable
  * Create usePlan hook and add presencePlan relational field
  * Move periods constants to hooks directory with comprehensive tests
  * Use plan UUID for fetching spots instead of place name
  * Add console warnings for missing configuration in useTable
  * Fix day header unsubscribe to remove all user presences

4.2.0 / 2025-08-14
==================

  * Replace ESLint with oxlint for faster linting

4.1.0 / 2025-08-08
==================

  * Refactor DayCard component into smaller specialized components
  * Extract spot interaction logic into dedicated hook
  * Extract UI components from SpotButton
  * Add final performance optimizations to SpotButton
  * Refactor useTable hook for better maintainability
  * Add babel-plugin-react-component-data-attribute for debugging
  * Prevent crash when accessing tri on undefined in SpotButton

4.0.1 / 2025-06-27
==================

  * Add comprehensive unit testing infrastructure
  * Add comprehensive tests for useFields hook
  * Add comprehensive tests for useSpots hook
  * Add comprehensive tests for usePlans hook

4.0.0 / 2025-06-26
==================

BREAKING CHANGES:

  * Upgrade React from 17.0.2 to 19.1.0
  * Migrate from React Query v3 to TanStack Query v5
  * Migrate from React Router v5 to v6 with modern routing patterns
  * Upgrade MUI dependencies from v5 to v7
  * Migrate to modern React 18+ createRoot API
  * Fully rebuild dependencies tree

3.2.0 / 2025-06-25
==================

  * Setup Vitest testing infrastructure
  * Add comprehensive unit tests for helpers
  * Refactor displayCard helper with tests
  * Extract and simplify DayCard component
  * Split styles between DayCard & PresenceCalendar
  * Improve feature flags management
  * Factorize helpers
  * Add missing JSDoc
  * Enforce linting
  * Use window.location.reload() for clearer intent
  * Fix a typo in ExpiredPrefPage

3.1.1 / 2025-03-20
==================

  * Change year for TT checks

3.1.0 / 2024-12-23
==================

  * Add parking spot reservation feature with calendar popup integration
  * Add pop-up reminder for parking inscription
  * Make reminder pop-up non-blocking
  * Wrap parking feature with feature flag
  * Change display of half day presence to horizontal layout
  * Update style of calendar's presence chips
  * Remove all presences when unsubscribing from calendar
  * Clean tri on edit from user menu
  * Consider null period as fullday
  * Reset prefs by user action instead of automatically
  * Update hover behavior to not rely on class name
  * Remove public path on image source

3.0.1 / 2024-10-03
==================

  * Fix unsubscribing a spot when period attribute isn't defined
  * Remove the option section of dialog when adding a favorite
  * Remove autoCorrect and autoCapitalize to tri input

3.0.0 / 2024-09-30
==================

  * Update baseFlag imports
  * Optimize feature flag service
  * Add ability to use dash before a .env feature flag to exclude it
  * Add feature flag service
  * Changed UI of selecting a period pref
  * Add a badge in the calendar to people that are concerned by a conflict
  * Allow to click on conflict spot to remove own presence
  * Memoize 'rest' array to avoid recomputing effect on each render
  * Change behavior when concurrent accessing a spot
  * Remove ability to add a parking spot to favorite
  * Invert icon representing the period of inscription in the calendar
  * Add a notification onto the tasks that nobody are doing
  * Fix colors of day button and info label
  * Change scrollbar size and its color on dark mode
  * Fix padding and import
  * Can chose a favorite agency
  * Fix bug when selecting pref & Made day button UI clearer
  * Display a notification on quick inscription
  * Setup "fast open"
  * Add additionnal spots to display information or a task
  * Can use 'esc' to close modal window
  * Set pre-selected spot to empty when adding a new favorite
  * Fix compatibility between new and old presence table

2.8.0 / 2024-08-26
==================

  * Make PWA full screen
  * Add support for PWA & fix style
  * Fix rebase error on props name
  * Can disable half day reservation feature from .env
  * Merged half day spot button in one component
  * Display icon in calendar card when parking and half day is reserved
  * Fix conlict on cumulative spot
  * Allow to reserve a slot for only half day
  * Init contextual menu for spots
  * Change mobile UI + center map on load
  * Change variables and props name
  * Use field name in request instead of id
  * Change favicon to svg
  * Display popup when two people reserve same spot
  * Remove unesed import & property
  * Message when nobody is present & amount of people when card is closed
  * Add unique favicon
  * Update calendar stlye + add favicon
  * Allow to display or not past days

2.7.0 / 2024-07-30
==================

  * Allow choosing favorite day & modernize calendar ui
  * Choose the number of displayed days
  * Allow to choose spot location on spot dialog
  * Fix style when do/don't have favorite
  * Add key to each listItem
  * Fix manage favorite with multiple agency
  * Manage different persisted state format
  * Fix inform when spot is removed from DB
  * Manage favorites with multiple agences
  * Inform when favorite spot is removed from DB
  * Remove row usage of field ID
  * Create new component for updating tri
  * Create new component for favorite spots preferences
  * Create new component for display preferences
  * Fix select default favorite
  * Complete the README
  * Auto-select first favorite spot + eslint refactor
  * Update TRI from usermenu
  * Use persistated state for localStorage access
  * Add full width setting
  * Add favorite spot setting
  * Add table id to .env.dist
  * Remove raw usage of table ID
  * Add .env to .gitignore
  * Add README and its installation part
  * Disable ESLint plugin in ViteJS config to avoid build blocking
  * Enforce linting
  * Upgrade ViteJS
  * Upgrade eslint & ruleset
  * Change default page lang to french

2.6.0 / 2024-04-15
==================

  * Fix Google Translate messing up names
  * Change year for TT checks
  * Restore archive page
  * Avoid TT page crash when user has not any result
  * Hide home button for draft places
  * Only hide draft places
  * Allow some spots to be cumulative
  * Do not show Plans marked as draft (Brouillon)

2.5.0 / 2023-10-17
==================

  * Add custom border for duplicated dates
  * Change style of multiple days & excess days
  * Sort TTO squares according dates
  * Avoid cash when more TTO than maximum
  * Make TTO & TTR search case insensitive
  * Change year for TT checks
  * Reduce Spot size

2.4.0 / 2022-04-14
==================

  * Create dedicated Provider for DarkTheme
  * Add dark theme feature
  * Manage Bluemind error response
  * Adjust TTO display
  * Adjust TTR display
  * Add LoadIndicator for TT page
  * Adjust TT update script outputs
  * Deduplicate TriPresence in calendar view
  * Display TTR line
  * Simplify filtering
  * Remove over-factorization
  * Increase parallelism
  * Compute current week TTR
  * Simplify some fields naming
  * Display TTO days timeline
  * Avoid updating users with no change
  * Parallelize TT update process
  * Create config for allow using remote lambda in dev mode
  * Dim users with no TTO
  * Create page to display TTO counts
  * Create proxy function to query counts
  * Create function to count remote work days from Bluemind calendars
  * Clear localStorage whenever app version change
  * Disable panning map from spot button
  * Display version number more precisely
  * Manage place & day with router instead of localStorage

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
