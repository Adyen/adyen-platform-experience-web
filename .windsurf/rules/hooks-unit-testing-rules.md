---
trigger: always_on
---

# Unit testing Guideline

## Unit test rules

- Analyse the provided code file
- Use mock-data file for mocking data
- Coverage should be around 100% when possible
- Write unit tests using the tool stack we already have in the project
- Use meaningful and readable names for test cases
- To run the tests/coverage use the scripts in package.json
- Check the test at the end if there is any test that can be deleted
- If there are redundant test cases remove them

## Common mistakes to avoid

1. Analyse the test files and follow a consistent pattern for unit test names.
2. Before adding a test, ask: "Does this exercise a unique code path?" and be aware of the scope
3. Group related assertions in one test rather than splitting into multiple tests
4. Testing undefined and null separately is often redundant in JavaScript/TypeScript
5. Accept build artifact gaps in coverage (HMR, source maps, etc.)
6. Prefer one comprehensive test over multiple narrow tests for the same path
7. Use coverage tools to identify truly untested code, not just to hit 100%
