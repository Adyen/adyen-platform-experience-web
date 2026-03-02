# Skill: think-external-props

## Description

This skill analyzes a given YouTrack ticket, the local codebase, and Adyen's external documentation patterns to generate ideas and recommendations for new external component props.

## Activation

-   Activated by the phrase `think-external-props` or explicitly calling the skill.

## Prerequisites

-   **YouTrack Integration:** This skill requires YouTrack tools to be available. If YouTrack tools (like `youtrack_get_issue`) are not available or not integrated, inform the user that YouTrack MCP is not integrated and immediately abort execution.

## Guidelines & Rules

### 1. Information Gathering

-   **Ask for Ticket:** Upon activation, ask the user for the relevant YouTrack ticket number if not already provided in the prompt.
-   **Fetch Ticket:** Use the `youtrack_get_issue` tool to retrieve the details, description, and comments of the provided ticket number. Additionally, use `youtrack_search` with a query like `parent: {ISSUE_ID}` to retrieve and analyze all related sub-tasks to understand the full scope of requirements.
-   **Analyze Codebase:** Review relevant types and existing component properties, specifically focusing on files like `src/components/types.ts` or files within `src/components/external/` to understand the current structure of `ExternalUIComponentProps` and specific component props.
-   **Analyze External Docs:** Analyze Adyen's external documentation (e.g., https://docs.adyen.com/platforms/build-user-dashboards?component=Transaction&integration=components&version=1.10.x) using the `web_fetch` tool to understand the standard format, naming conventions, and typical behaviors exposed as props in Adyen components.

### 2. Analysis & Ideation

-   Cross-reference the requirements detailed in the YouTrack ticket with the existing codebase capabilities and external documentation patterns.
-   Formulate ideas for new external props that might be needed to fulfill the ticket's requirements.
-   Consider both:
    -   **Configuration Props:** For enabling/disabling features, providing initial state, or styling overrides.
    -   **Callback/Event Props:** For handling user interactions or data flow (e.g., `onClick`, `onDataRetrieved`).

### 3. Output Generation

-   Present the ideas to the user in a structured format.
-   Include the following in your output:
    -   **Ticket Context:** A brief summary of the ticket's goal.
    -   **Proposed Props:** A list of suggested external props. For each proposed prop, provide:
        -   **Name:** Following Adyen's naming conventions (e.g., camelCase, descriptive).
        -   **Type:** Suggested TypeScript type.
        -   **Description:** What the prop does and its intended behavior.
        -   **Justification:** Why this prop is needed based on the ticket and how it aligns with the external docs and codebase patterns.
