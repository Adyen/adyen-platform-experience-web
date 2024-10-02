#!/bin/sh

#!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!#
#!! NEVER RUN THIS SHELL SCRIPT YOURSELF !!#
#!! WILL RUN AUTOMATICALLY (DURING CI)   !!#
#!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!#

# Root dir of the project
SCRIPT_DIR=$(dirname "$0")
PROJECT_ROOT=$(realpath "$SCRIPT_DIR/../..")
I18N_CONFIG_FILE_PATH=$(realpath "$PROJECT_ROOT/.i18nrc")

# Stage downloaded files
for source_path in $(jq -r '.translationSourcePaths[]' $I18N_CONFIG_FILE_PATH); do
  git add $(dirname "$source_path")
done

if git diff-index --cached --quiet HEAD; then
  # there are no changes to commit
  echo "No translations updates"
else
  # Create a commit for staged files and push
  git commit -m "${COMMIT_TITLE}"
  git push -u origin ${BRANCH_NAME}

  # Create a PR on the default branch (using GitHub CLI)
  gh pr create --base ${BASE_REF} --head ${BRANCH_NAME} --fill
fi
