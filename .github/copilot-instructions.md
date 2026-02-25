# Copilot Instructions for fire_calculate

## Project Overview
**fire_calculate** is a Financial Independence, Retire Early (FIRE) calculator - a web-based tool for modeling retirement scenarios and financial freedom milestones. The project calculates when users can achieve financial independence based on savings, expenses, and investment returns.

## Architecture & Key Design Patterns

### Frontend-Only Web App
- Vanilla HTML/CSS/JavaScript (no heavy frameworks by default)
- Single-page application with responsive design for desktop and mobile
- Client-side calculations to ensure no data is sent to servers
- Store calculations in localStorage for session persistence

### Core Calculation Engine
- Create a modular `calculator.js` with pure functions for FIRE calculations:
  - `calculateFireNumber(monthlyExpenses, withdrawalRate)` - 4% rule (SWR)
  - `calculateYearsToFI(annualSavings, currentAssets, targetNumber, averageReturn)`
  - `calculateProjection(years, initialAssets, annualContribution, returnRate)` - time-based projections

### Component Structure
- **index.html** - Single entry point; embed CSS/JS inline or use `<link>` and `<script>` tags
- **styles.css** - Responsive grid layout; mobile-first approach
- **calculator.js** - Core calculation logic (testable, no DOM dependencies)
- **ui.js** - Event listeners, DOM manipulation, form handling
- **utils.js** - Helper functions (formatting, validation, storage)

## Developer Workflows

### Local Development
```bash
# No build step required initially - serve directly
npx http-server . -p 8000
# Or use Live Server extension in VS Code
```

### Testing
- Unit test calculations with minimal test runner (e.g., simple JS tests or Jest)
- Test edge cases: negative inputs, extreme values, rounding
- Verify calculations match FIRE community standards

### Adding Features
1. Define calculation in `calculator.js` with unit test
2. Add UI in `index.html` and hook in `ui.js`
3. Test in browser DevTools console first
4. Update localStorage persistence if needed

## Project Conventions

### Naming & Coding Style
- Variable names: `annualSavings`, `withdrawalRate`, `fireNumber` (camelCase)
- Input values: store as numbers; format for display only
- Comments: explain "why" (FIRE assumptions), not "what"
  - e.g., "//4% withdrawal rate based on Trinity Study for 30-year retirements"

### Calculation Conventions
- Use 4% withdrawal rate as default (FIRE standard; configurable)
- Return rates: work in annual percentages (e.g., 0.07 for 7%)
- All monetary values: store as numbers (cents as integers to avoid float errors)
- Format for display: `toLocaleString('en-US', {style: 'currency', currency: 'USD'})`

### Input Validation
- Validate all user inputs before calculation
- Return meaningful error messages to UI (not console errors)
- Constraint examples: `savings >= 0`, `expenses > 0`, `return_rate between -50 and 100`

### Material & Formatting
- Display large numbers with comma separators: 1,000,000
- Years: round to 1 decimal place for fractional years
- Percentages: display as "7%" not "0.07"
- Currency: USD with "$" prefix

## Integration Points & Data Flow

### External Dependencies (if added)
- Charts: use lightweight library like Chart.js or Plotly (avoid Heavy D3)
- UI Framework: consider Tailwind CSS for rapid styling
- No backend required initially; keep calculations client-side

### Common Enhancements
- Inflation adjustment: `futureValue = presentValue * (1 + inflationRate) ^ years`
- Tax considerations: parameterize investment growth to net-of-tax returns
- Scenario comparison: save multiple scenarios with names in localStorage
- Visualization: chart growth trajectory, breakeven point, projection confidence ranges

## File Naming & Organization
- Keep related functions in same file: `calculator.js` has all math
- Use consistent suffixes: `-test.js` for tests, `.min.js` for minified (if bundling later)
- Git: commit calculation logic separately from UI changes for easier reviews

## Critical Developer Notes
- **Data Privacy**: All calculations happen browser-side; no telemetry/tracking without explicit consent
- **Accessibility**: Use semantic HTML; ensure readability on mobile (min font 16px)
- **Browser Support**: Target modern browsers (ES6+); document any polyfill needs
- **Performance**: Keep calculations sub-100ms even for extreme scenarios
