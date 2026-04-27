---
name: design-context
description: Activates for ANY design-related work including design brainstorming, component selection, design system guidance, layout design, visual design, Figma workflows, design token selection, and design system questions. Helps make design decisions aligned with the Bento design system and project design patterns. STRICTLY ACTIVATE when user types 'design', 'figma', or 'create mockup'.
user-invocable: true
disable-model-invocation: false
---

# Design System Context

## Goal

Provide design guidance and support for all Figma and design-related work. Ensures consistency with the Bento design system, helps select appropriate components, and guides design decisions aligned with the project's design patterns.

## When to Use

**🚨 ACTIVATION KEYWORDS:** This skill **STRICTLY ACTIVATES** when the user types:

- `design`
- `figma`
- `create mockup`

This skill activates automatically for ANY design-related request including:

- **Design brainstorming:** Exploring design options, comparing approaches, design ideation
- **Figma workflows:** Working with Figma URLs, creating/modifying Figma designs, design mockups
- **Component selection:** Choosing appropriate components from Bento or internal component library
- **Design tokens:** Selecting spacing, colors, typography, shadows, borders, and other design tokens
- **Layout design:** Planning positioning, structure, responsive design, grid systems
- **Visual design:** Defining colors, shadows, borders, icons, visual hierarchy, accessibility
- **Design system questions:** Understanding Bento component options, design patterns, component variants
- **UI design:** Designing interfaces, forms, modals, tables, navigation, notifications, any visual elements

## Workflow

**When this skill activates, display this notification:**

```
🎨 Design Context skill activated
   - Loading Bento design system context
   - Analyzing available components
   - Preparing design guidance
```

Follow this ordered workflow whenever this skill is active:

### 1. Load Bento Component Inventory (if Bento MCP is available)

Before any design work:

```typescript
// Check if Bento MCP tools are available
// If yes, run these in parallel:
bento___get_all_components();
bento___get_design_tokens();
```

**Purpose:**

- `get_all_components` provides the full list of Bento components available in the design library
- `get_design_tokens` loads all design token variables (colors, spacing, typography, shadows, borders, etc.)

**Use this context to:**

- Identify which Bento components match the design requirements
- Reference the correct design tokens for spacing, colors, typography
- Avoid recreating components that already exist in Bento
- Map Figma design system assets to Bento components

**If Bento MCP is not available:**

- Proceed with Figma tools only
- Note in output that Bento context is unavailable

### 1.1. Analyze Project Components

**Always** analyze what components are available before creating or modifying designs.

**Discover available components:**

```bash
# Use LS tool to list all component directories
LS: src/components/internal/
```

Create an inventory of available components from the directory listing.

**Component Priority for Design:**

1. **Priority 1: Internal components with Bento equivalents**
    - Components that exist in both internal library AND Bento
    - Examples: Button, Card, Checkbox, Icon, Link, Modal, Pagination, Tabs, Tag, Tooltip
    - **Design approach:** Use Bento Figma library components (e.g., `b-button`, `b-modal`, `b-card`)
    - **Note:** Internal implementations may have simplified variants compared to full Bento

2. **Priority 2: Internal-only components**
    - Components that exist only in the internal library
    - Examples: DataGrid, CapitalHeader, StoreSelector, DataOverviewContainer
    - **Design approach:** Use existing internal design patterns or create custom designs

3. **Priority 3: Bento-only components**
    - Bento components that don't exist in internal library yet
    - **Design approach:** Can show as alternative/future option with note: "⚠️ Alternative: [ComponentName] from Bento - not currently available, would require implementation"
    - **Presentation:** Show Priority 1 or 2 component as primary, this as alternative

### 2. Search Figma Design System (if Figma MCP is available)

When working with Figma designs:

```typescript
// Search for relevant components in Figma design libraries
figma___search_design_system({
    query: '<component-name-from-Bento>',
    fileKey: '<figma-file-key>',
    includeComponents: true,
    includeVariables: true,
    includeStyles: true,
});
```

**Purpose:**

- Find existing Bento components in Figma design libraries
- Identify component keys for importing as linked instances
- Discover design variables and styles that map to Bento tokens
- Prevent recreating components that already exist

**Search strategy:**

- If Bento components are loaded, search for each relevant Bento component by name
- If creating UI from scratch, search for base components (Button, Input, Card, Modal, etc.)
- Save component keys from search results for later import

**If Figma MCP is not available:**

- Skip Figma-specific steps
- Use Bento context for design guidance only

### 3. Mapping Bento to Figma

Cross-reference the results from step 1 (Bento) and step 2 (Figma):

- **Match by name:** Bento component `Button` → Figma component `Button` or `Bento/Button`
- **Match by pattern:** Bento `Modal` → Figma `Dialog`, `Modal`, or `Overlay`
- **Match by tokens:** Bento token `spacer-040` → Figma variable `spacing/40` or `spacer/040`

Create a mental map of:

```
Bento Component → Figma Library Component Key → Design Token Mapping
```

This map guides all subsequent design decisions.

### 4. Creating or Modifying Figma Designs

When using `figma___use_figma` to create or modify designs:

**🚨 CRITICAL REQUIREMENTS:**

1. **ALWAYS use Bento component instances for granular components:**
    - **NEVER** create custom frames that replicate Bento components (buttons, inputs, cards, icons, etc.)
    - **ALWAYS** import Bento components using `importComponentByKeyAsync` or `importComponentSetByKeyAsync`
    - Use the component keys obtained from `search_design_system`
    - This ensures design system consistency and allows updates to propagate from the source
2. **ALWAYS ensure mockups are visible:**
    - After creating any design elements, verify they have visible fills, strokes, or text
    - Set proper colors, backgrounds, and borders so mockups render correctly
    - Test visibility by checking that all frames, text, and shapes have appropriate styling
    - Never create transparent or invisible elements that won't show in screenshots

3. **NEVER create floating elements - ALWAYS wrap content in container components:**
    - **CRITICAL:** ALL content (text, buttons, tags, icons, etc.) MUST be wrapped inside a container component
    - Container components: `b-alert`, `b-modal`, `b-card`, `b-toast`, banners, panels, or similar wrapper components
    - **NEVER** leave buttons, text, tags, or other complementary components floating without a container
    - Every design element must have a clear parent container that provides context and structure
    - Floating elements create inconsistent, unprofessional designs and violate design system principles
    - **Example violations:**
        - ❌ Text + Button placed directly on canvas without a container
        - ❌ Tags floating next to content without being inside a card/alert
        - ❌ Icons and labels scattered without a containing frame
    - **Correct approach:**
        - ✅ Wrap notification content (text + button) inside `b-alert` or `b-modal`
        - ✅ Place status tags inside `b-card` or header components
        - ✅ Group related elements inside properly styled container frames

**Component selection rules (based on step 1.1 priority map):**

1. **For Priority 1 components (Internal with Bento equivalents):**
    - Use Bento Figma library components (e.g., `b-button`, `b-modal`, `b-card`)
    - Import as linked instances using `importComponentByKeyAsync` or `importComponentSetByKeyAsync`
    - Use component keys obtained from `search_design_system` in step 2
    - **Note:** Be aware that internal implementations may have simplified variants

2. **For Priority 2 components (Internal-only):**
    - Use existing internal design patterns if they exist in Figma
    - Create custom designs following Bento design tokens and patterns
    - Document the component name for reference

3. **For Priority 3 components (Bento-only):**
    - Show as alternative/secondary option in designs
    - Add note: "⚠️ Alternative: [ComponentName] from Bento - not currently available, would require implementation"
    - Present Priority 1 or 2 component as primary solution

**Best practices:**

- Always use Bento component instances instead of recreating components
- Keep designs in sync with the Bento design system source
- Use linked instances so changes to Bento library propagate automatically
- Maintain design consistency across the organization
- Verify all mockups are visible with proper colors and styling
- **CRITICAL:** Wrap all content in container components - never create floating elements
- Use `b-alert`, `b-modal`, `b-card`, or similar containers to group related content
- Structure designs with clear visual hierarchy using proper container components

**Example patterns:**

```javascript
// ❌ WRONG: Creating a custom button frame
const button = figma.createFrame();
button.name = 'Button';
button.resize(100, 36);
button.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
// This recreates the component and breaks design system sync!

// ✅ CORRECT: Importing Bento component instance
const buttonKey = '<key-from-search-design-system>';
const buttonComponent = await figma.importComponentByKeyAsync(buttonKey);
const buttonInstance = buttonComponent.createInstance();
// This maintains design system consistency and sync!

// ❌ WRONG: Creating floating elements without a container
const text = figma.createText();
text.characters = 'Update available';
const button = buttonComponent.createInstance();
// Text and button floating on canvas - NO CONTAINER!

// ✅ CORRECT: Wrapping content in a container component
const alertKey = '561bb0ce589c72770fed576d0ca54caa95a648f1';
const alertComponent = await figma.importComponentSetByKeyAsync(alertKey);
const alert = alertComponent.defaultVariant.createInstance();
// Now add text and button INSIDE the alert container
// This provides structure, context, and maintains design system integrity!
```

## Success Criteria

✅ **Component inventory created:**

- List of available internal components analyzed
- Priority map established (Priority 1: Internal+Bento, Priority 2: Internal-only, Priority 3: Bento-only)
- Cross-reference completed with Bento components

✅ **Bento context loaded:**

- Component inventory retrieved via `get_all_components`
- Design tokens retrieved via `get_design_tokens`

✅ **Figma design system searched:**

- Relevant components found via `search_design_system`
- Component keys saved for import

✅ **Bento-to-Figma mapping established:**

- Clear correspondence between Bento components and Figma library assets
- Design token variables matched between systems

✅ **Designs use appropriate components:**

- **CRITICAL:** ALL granular components (buttons, inputs, icons, etc.) are Bento instances imported via `importComponentByKeyAsync`
- Priority 1: Bento Figma components imported as instances (e.g., `b-button`)
- Priority 2: Internal design patterns used
- Priority 3: Bento components marked with ⚠️ "Alternative option - not currently available"
- **NO** detached recreations of Bento components
- Consistent use of design tokens for spacing, colors, typography

✅ **All mockups are visible:**

- Every design element has visible fills, strokes, or text
- Appropriate colors, backgrounds, and borders applied
- Designs render correctly in screenshots
- No transparent or invisible elements

✅ **All content is properly contained:**

- NO floating elements - all content wrapped in container components
- Buttons, text, tags, icons placed inside `b-alert`, `b-modal`, `b-card`, or similar containers
- Clear visual hierarchy with proper component structure
- Every design element has an appropriate parent container

## Design Guidance Principles

**🚨 CRITICAL DESIGN RULES:**

1. **Use Bento component instances for ALL granular components:**
    - Buttons, inputs, cards, modals, tags, icons, checkboxes, etc. MUST be Bento instances
    - NEVER recreate these components as custom frames
    - Always import using `importComponentByKeyAsync` or `importComponentSetByKeyAsync`

2. **Ensure all mockups are visible:**
    - Every design element must have visible fills, strokes, or text
    - Set appropriate colors, backgrounds, and borders
    - Verify designs render correctly in screenshots
    - No transparent or invisible elements

3. **NO floating elements - ALL content must be wrapped in containers:**
    - NEVER create loose buttons, text, tags, or icons floating on the canvas
    - ALWAYS use container components: `b-alert`, `b-modal`, `b-card`, `b-toast`, banners, or panels
    - Every piece of content needs a proper container that provides structure and context
    - This maintains design system consistency and creates professional, cohesive designs

**Component selection:**

- Always prefer using existing Bento components over custom designs
- Check component priority (Priority 1 → 2 → 3) when making design decisions
- Use Bento design tokens for consistency (spacing, colors, typography)
- Maintain visual consistency with the Bento design system
- **IMPORTANT:** Select appropriate container components (`b-alert`, `b-modal`, `b-card`, etc.) to wrap all content
- Never design with floating elements - every UI element needs a containing component

**Design tokens:**

- Spacing: Use Bento spacer tokens (e.g., `spacer-040` for 8px, `spacer-080` for 20px)
- Colors: Reference Bento color tokens for backgrounds, borders, text
- Typography: Use Bento typography scale and font weights
- Shadows, borders, radius: Apply Bento design tokens consistently

**Accessibility:**

- Ensure sufficient color contrast
- Design for keyboard navigation
- Include proper semantic structure
- Consider responsive design needs

## Fallback Behavior

**If Bento MCP is unavailable:**

- Proceed with Figma tools only
- Use Figma design system search as primary source
- Provide design guidance based on Figma assets

**If Figma MCP is unavailable:**

- Use Bento component inventory and design tokens as primary source
- Provide design guidance based on Bento library
- Recommend connecting Figma MCP for full design workflow

**If both are unavailable:**

- Provide guidance based on project documentation (`AGENTS.md`, `.agents/patterns/`)
- Recommend connecting both MCP servers for complete design system support

## Relationship to Other Skills

This skill **works alongside** the existing `figma-mcp-promotion` skill:

- `figma-mcp-promotion` — Encourages Figma MCP installation and surfaces Figma URLs
- `design-context` — Provides design system context and component guidance for design work

Both skills can be active simultaneously and serve complementary purposes.
