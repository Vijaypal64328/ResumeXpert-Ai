#!/bin/bash
# WARNING: This rewrites git history. Only run if you understand the consequences.
# Make a backup of your repository before running.
# This script shows both BFG and git filter-repo approaches.

echo "Make sure you have a clean working tree (no uncommitted changes)."

echo "1) Using BFG Repo-Cleaner (simpler):"
echo "   Install: https://rtyley.github.io/bfg-repo-cleaner/"
echo "   Example: remove all files named 'serviceAccountKey.json'"

echo "   git clone --mirror git@github.com:<owner>/<repo>.git"
echo "   cd <repo>.git"
echo "   bfg --delete-files serviceAccountKey.json"
echo "   git reflog expire --expire=now --all && git gc --prune=now --aggressive"

echo "2) Using git filter-repo (recommended if available):"
echo "   pip install git-filter-repo"
echo "   git clone --mirror git@github.com:<owner>/<repo>.git"
echo "   cd <repo>.git"
echo "   git filter-repo --invert-paths --paths serviceAccountKey.json"

echo "After either approach push the cleaned repo back to the remote (force push):"
echo "   git push --force"

echo "Important: All collaborators must re-clone the repository after a history rewrite."
