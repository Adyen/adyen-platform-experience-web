# Skill: create-external-docs

## Description

This skill creates comprehensive external documentation for Adyen Platform Experience components by analyzing their source code, logic, and intended usage.

## Activation

- This skill is activated when the user requests documentation for a component or uses the command `create-external-docs`.

## Output Format

> **IMPORTANT:** All generated documentation must strictly follow the structure, tone, section names, heading hierarchy, and code conventions defined in the template file below. The quality and correctness of the output depends entirely on adhering to this template.

**Template:** [`.agents/skills/external-documentation-template.md`](.agents/skills/external-documentation-template.md)

## Execution Steps

### Step 1 — Gather Requirements

1.  Ask the user the name of the component they want to document. Ask this as a plain open-ended question with no predefined options, choices, or suggestions — the user must type the component name freely.
2.  Check if the YouTrack MCP is available (i.e., tools such as `youtrack_get_issue` are accessible in the current session):
    - **If NOT available:** Ask the user whether they want to provide YouTrack issue details manually or skip. Present exactly two options: **Provide details** and **Skip**.
        - **Provide details** — Ask the user to copy and paste the relevant YouTrack issue details (title, description, subtasks, acceptance criteria, etc.) directly into the chat. Use that pasted content as the source of truth for requirements.
        - **Skip** — Proceed to Step 2 without any YouTrack context.
    - **If available:** Ask the user to provide the YouTrack issue number, then:
        - Use `youtrack_get_issue` to retrieve the main issue details.
        - Use `youtrack_search` with `parent: {ISSUE_ID}` to fetch and analyze all subtasks for full scope, requirements, and edge cases.

### Step 2 — Code Analysis

1.  Ask the user whether the code for the component already exists. Present exactly two options: **Yes** and **No**.
    - **Yes** — Ask the user to provide the external component folder path as a plain open-ended question with no predefined options. Then analyze the source code:
        - Inspect imports to identify dependencies.
        - Examine hooks, state management, and event handlers.
        - Identify the primary purpose and user-facing features.
        - Extract props, their types, and whether they are required or optional from the TypeScript definitions.
        - Focus on components located under `/src/components/external`.
    - **No** — Skip source code analysis and rely solely on the requirements gathered in Step 1.

> **Minimum information check:** If the user skipped YouTrack details (MCP not available → Skip) AND selected No for code existence, stop and inform the user: "Not enough information has been collected to generate the documentation. At least one of the following must be provided: requirement details (YouTrack issue or manual paste) or the related component source code." Do not proceed to Step 3 until the user provides one of these.

### Step 3 — Draft

Generate the documentation following the **Output Format** section, incorporating all context gathered from the YouTrack issue and/or source code analysis.

> **IMPORTANT:** Only include information that is explicitly available from the gathered requirements or source code. If a section has no available information, leave it empty — do not assume, infer, or invent any content to fill it.

If the analysis reveals one or more important user or technical flows (e.g. a cashout request flow, an error handling flow, a multi-step user journey), add a `## Diagrams (Additional)` section at the very end of the document. Use [Mermaid](https://mermaid.js.org/) syntax inside fenced code blocks (` ```mermaid `), which renders natively in markdown without any external tooling. Choose the most appropriate diagram type for each flow (e.g. `sequenceDiagram` for API interactions, `flowchart LR` for user journeys, `stateDiagram-v2` for state transitions). Only include this section if there is a meaningful flow to illustrate — do not add it for the sake of it.

### Step 4 — Validate

Ensure all code examples follow the conventions in the template: plain JavaScript with `async/await`, correct package name (`@adyen/adyen-platform-experience-web`), CSS import included, mount via string selector, and no framework-specific wrappers. Verify that all props, callbacks, and error states accurately reflect the component's actual logic and requirements.

## Output

- **File Name:** `{component-name}-documentation-draft.md`, where `{component-name}` is the component name provided by the user in Step 1, written in kebab-case (e.g., `transaction-list-documentation-draft.md`).
- **Location:** Place the file in a relevant directory (e.g., `docs/` or alongside the component).

## Reference Documentation

- [Adyen Platform Experience Docs](https://docs.adyen.com/platforms/build-user-dashboards?component=Transaction&integration=components&version=1.10.x)
- **Example template:** [`.agents/skills/external-documentation-template.md`](.agents/skills/external-documentation-template.md) — use this as the structural and stylistic reference for all generated documentation
