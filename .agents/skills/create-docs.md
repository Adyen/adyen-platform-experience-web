# Skill: create-docs

## Description

This skill is for creating comprehensive external documentation for Adyen Platform Experience components by analyzing their source code, logic, and intended usage.

## Activation

-   This skill is activated when the user requests documentation for a component or uses the command `/create-docs`.

## Guidelines & Rules

### 1. Analysis Phase

-   **Target Location:** Focus on components located under `/src/components/external`.
-   **Logic Inspection:**
    -   Analyze the component's imports to identify dependencies.
    -   Examine the logic within the component (hooks, state management, event handlers).
    -   Identify the primary purpose and user-facing features of the component.
-   **Props & Types:** Extract props, their types, and whether they are required or optional from the TypeScript definitions.

### 2. Documentation Structure (Adyen Pattern)

Follow the patterns established in official Adyen documentation (e.g., [Adyen Transaction Component Docs](https://docs.adyen.com/platforms/build-user-dashboards?component=Transaction&integration=components&version=1.10.x)):

-   **Hierarchical Headings:** Use clear, nested headings (e.g., `# Component Name`, `## Overview`, `## Integration`, `## Configuration`).
-   **Tone:** Maintain a formal, technical, and instructional tone. Address the developer directly.
-   **Sections to Include:**
    -   **Overview:** High-level summary of what the component does.
    -   **Installation:** How to add/import the component.
    -   **Usage Example:** A concise, well-formatted code block (TypeScript/Preact) showing the component in action.
    -   **Props/Configuration Table:** A table with the following columns:
        -   `Parameter`: The prop name.
        -   `Required`: Whether it is mandatory.
        -   `Description`: Clear explanation of the prop's purpose and expected values.
    -   **Events/Callbacks:** If applicable, document event handlers and the data they return.

### 3. Workflow

1.  **Ask for Input:** Ask the user specifically which component they want to document and for the related YouTrack issue number if they haven't been specified.
2.  **YouTrack Analysis:** If a YouTrack issue number is provided and YouTrack tools are available:
    -   Use `youtrack_get_issue` to retrieve the main issue details.
    -   Search for and analyze all subtasks (e.g., using `youtrack_search` with `parent: {ISSUE_ID}`) to understand the full scope, requirements, and any specific implementation details or edge cases mentioned in the subtasks.
3.  **Research:** Use `read_file` to analyze component and its related types/utils.
4.  **Draft:** Generate the documentation following the Adyen patterns, incorporating context and requirements gathered from the YouTrack issue and its subtasks.
5.  **Validate:** Ensure all code examples are idiomatic to the project (e.g., using Preact hooks) and match the actual component logic.
6.  **Create Markdown File:** Write the finalized documentation to a new `.md` file in a relevant directory (e.g., `docs/` or alongside the component). Use a descriptive name like `<ComponentName>.md`.

## Reference Documentation

-   [Adyen Platform Experience Docs](https://docs.adyen.com/platforms/build-user-dashboards?component=Transaction&integration=components&version=1.10.x)
