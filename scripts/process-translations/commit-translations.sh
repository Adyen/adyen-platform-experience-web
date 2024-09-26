#!/bin/sh

# (!) This script only exists to be executed in the context of a GitHub action
# (!) You should never have to execute it yourself
if ${{ github.event_name }}; then
  # Root dir of the project
  SCRIPT_DIR=$(dirname "$0")
  PROJECT_ROOT=$(realpath "$SCRIPT_DIR/../..")
  I18N_RC_PATH=$(realpath "$PROJECT_ROOT/.i18nrc")

  # Stage downloaded files
  for source_path in $(jq -r '.translationSourcePaths[]' $I18N_RC_PATH); do
    root_path=$(dirname $source_path)
    for locale in $(jq -r '.locales[]' $I18N_RC_PATH); do
      git add $(realpath "./$root_path/$locale.json")
    done
  done

  if git diff-index --cached --quiet HEAD; then
    # there are no changes to commit
    echo "No translations updates"
  else
    # Create a commit for staged files and push
    git commit -m "${{ env.COMMIT_TITLE }}"
    git push -u origin ${{ env.BRANCH_NAME }}

    # Create a PR on the default branch (using GitHub CLI)
    gh pr create --base ${{ env.BASE_REF }} --head ${{ env.BRANCH_NAME }} --fill
  fi
fi
