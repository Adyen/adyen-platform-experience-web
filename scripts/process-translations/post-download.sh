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
  # Create a commit for staged files and push
  git commit -m "${COMMIT_TITLE}"
  git push -u origin "${BRANCH_NAME}"

  # Create a PR on the default branch (using GitHub CLI)
  gh pr create --base "${BASE_REF}" --head "${BRANCH_NAME}" --fill
fi
