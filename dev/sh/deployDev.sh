#!/bin/bash

# Source and destination paths
source_path="./dist/security-actions/"  # Current directory

# Prompt for the project name
read -p "Enter the project name: " project_name

# Check if the project name is provided
if [ -z "$project_name" ]; then
    echo "Project name is required."
    exit 1
fi

# Construct the destination path and ssh paths
destination_path="dev-companion@141.136.42.220:/home/$project_name/htdocs/www.user-actions.ibescore.com/"
destination_hostname="ibe-user-actions@141.136.42.220"
destination_directory="/home/$project_name/htdocs/www.user-actions.ibescore.com/"

# Delete old files first
ssh -i ~/.ssh/hostinger/dev-companion_ed25519 "$destination_hostname" \
"rm -rf $destination_directory*.js \
$destination_directory*.css \
$destination_directory*.html"

# Run rsync over SSH
rsync -avz --update --exclude "*.sh" --exclude "*.md" -e "ssh -i ~/.ssh/hostinger/dev-companion_ed25519" "$source_path" "$destination_path"

# Check rsync exit status
if [ $? -eq 0 ]; then
    echo "Successfully synchronized."
else
    echo "Synchronization encountered errors."
fi
