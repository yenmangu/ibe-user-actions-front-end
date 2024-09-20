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
echo "Deploying IBEscore api to remote:/home/ibe-$project_name/htdocs/$project_name.ibescore.com/"

read -p "Press Y to continue or N to abort: " choice
choice=$(echo "$choice" | tr '[:lower:]' '[:upper:]')


if [[ "$choice" == "Y" ]]; then
    echo "Continuing with deployment..."
    # Add your deployment commands here
elif [[ "$choice" == "N" ]]; then
    echo "Deployment aborted."
    exit 1
else
    echo "Invalid choice. Please press Y to continue or N to abort."
    exit 1
fi

# Construct the destination path
destination_path="ibe-$project_name@141.136.42.220:/home/ibe-user-actions/htdocs/$project_name.ibescore.com//"

# Run rsync over SSH
rsync -avz --update --exclude "*.sh" --exclude "*.md" -e "ssh -i ~/.ssh/hostinger/ibe-api_ed25519" "$source_path" "$destination_path"

# Check rsync exit status
if [ $? -eq 0 ]; then
    echo "Successfully synchronized."
else
    echo "Synchronization encountered errors."
fi
