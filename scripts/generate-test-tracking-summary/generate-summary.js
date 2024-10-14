import { graphql } from '@octokit/graphql';
import fs from 'fs';

(async () => {
    const GITHUB_TOKEN = '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';
    const projectNumber = 7; // Replace with your project number

    const graphqlWithAuth = graphql.defaults({
        headers: {
            authorization: `token ${GITHUB_TOKEN}`,
        },
    });

    const query = `
  query($projectNumber: Int!, $organization: String!) {
    organization(login: $organization) {
      projectV2(number: $projectNumber) {
        items(first: 100) {
          nodes {
            content {
              ... on DraftIssue {
                title
              }
              ... on Issue {
                title
                url
              }
              ... on PullRequest {
                title
                url
              }
            }
            fieldValues(first: 10) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                    }
                  }
                  name
                }
              }
            }
          }
        }
      }
    }
  }
  `;

    const variables = {
        projectNumber: projectNumber,
        organization: 'Adyen',
    };

    const data = await graphqlWithAuth(query, variables);

    const items = data.organization.projectV2.items.nodes;

    // Utility function to get field value by name
    function getFieldValue(item, fieldName) {
        const field = item.fieldValues.nodes.find(fieldValue => fieldValue?.field?.name === fieldName);
        return field?.name || field?.text || 'Unknown';
    }

    // Step 1: Filter items with 'Test status' of 'Missing'
    const missingItems = items.filter(item => {
        const status = getFieldValue(item, 'Test status');
        return status === 'Missing';
    });

    // Step 2: Group items by 'Component' and 'Test Type'
    const groupedItems = {};

    missingItems.forEach(item => {
        const component = getFieldValue(item, 'Component');
        const testType = getFieldValue(item, 'Test type');
        const testName = item?.content?.title || 'Unnamed Test';

        if (!groupedItems[component]) {
            groupedItems[component] = {};
        }

        if (!groupedItems[component][testType]) {
            groupedItems[component][testType] = [];
        }

        groupedItems[component][testType].push(testName);
    });

    // Generate summary
    let summary = '# Missing Test Cases\n';
    for (const component in groupedItems) {
        summary += `\n- ## ${component}\n`;
        for (const testType in groupedItems[component]) {
            summary += `\n    - ### ${testType}\n`;

            for (const testName of groupedItems[component][testType]) {
                summary += `        - ${testName}\n`;
            }
        }
    }

    // Output the summary to a Markdown file
    fs.writeFileSync('MISSING_TESTS.md', summary);

    // Write the summary to the GitHub Actions output
    const outputPath = process.env.GITHUB_OUTPUT;

    if (outputPath) {
        fs.appendFileSync(outputPath, `summary<<EOF\n${summary}\nEOF\n`);
    } else {
        console.error('GITHUB_OUTPUT is not defined');
        process.exit(1);
    }
})().catch(error => {
    console.error(error);
    process.exit(1);
});
