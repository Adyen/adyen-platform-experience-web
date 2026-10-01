#!/bin/sh

#!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!#
#!! NEVER RUN THIS SHELL SCRIPT YOURSELF !!#
#!! WILL RUN AUTOMATICALLY (DURING CI)   !!#
#!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!#

# Root dir of the project
SCRIPT_DIR=$(dirname "$0")
PROJECT_ROOT=$(realpath "$SCRIPT_DIR/../..")
I18N_CONFIG_FILE_PATH=$(realpath "$PROJECT_ROOT/.i18nrc")

# Location of the domain translation catalogs, relative to each domain directory
DOMAIN_TRANSLATIONS_DIRECTORY="vue/translations"

# Split the downloaded SDK locale catalogs back into their domain catalogs, then regenerate the
# SDK catalogs from the domains so both sides carry the downloaded translations in sorted form.
if ! node "$PROJECT_ROOT/scripts/process-translations/split-sdk-catalogs.mjs"; then
  echo "Error: splitting the SDK catalogs into domain catalogs failed. Aborting" >&2
  exit 1
fi
if ! node "$PROJECT_ROOT/scripts/process-translations/sync-sdk-catalogs.mjs"; then
  echo "Error: synchronizing the SDK catalogs from the domain catalogs failed. Aborting" >&2
  exit 1
fi

# Stage downloaded files
for source_path in $(jq -r '.translationSourcePaths[]' "$I18N_CONFIG_FILE_PATH"); do
  git add "$(dirname "$source_path")"
done

# Stage the domain catalogs updated by the split
git add packages/domains/*/"$DOMAIN_TRANSLATIONS_DIRECTORY"

if git diff-index --cached --quiet HEAD; then
  # there are no changes to commit
  echo "No translations updates"
else
  # Create a commit for staged files and push. The branch is recreated from the base branch on
  # every run and is written only by this workflow (dispatches are serialized by the workflow
  # concurrency group), so a plain force push is intended. --force-with-lease is not usable
  # here: actions/checkout never fetches the bot branch, so there is no remote-tracking ref to
  # lease against, and the push would be rejected as stale info on every refresh run.
  git commit -m "${COMMIT_TITLE}"
  git push --force origin "${BRANCH_NAME}"

  # Create a PR on the base branch (using GitHub CLI). When a PR is already open for the branch,
  # the force push above has refreshed it, so a new PR is only needed when none exists yet.
  pr_count=$(gh pr list --head "${BRANCH_NAME}" --json number --jq 'length') || exit 1
  if [ "$pr_count" -eq 0 ]; then
    gh pr create --base "${BASE_REF}" --head "${BRANCH_NAME}" --fill
  else
    echo "Open pull request for ${BRANCH_NAME} already exists; it has been refreshed"
  fi
fi
