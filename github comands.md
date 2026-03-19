# GitHub Commands Guide

## Basic Git Workflow

### Stage Changes
`git add .`  
Adds all changed and new files in the current folder to the staging area.

### Commit Changes
`git commit -m "your update message"`  
Creates a snapshot of staged changes with a message describing the update.

### Push to Remote
`git push`  
Uploads your local commits to the connected remote repository (for example, GitHub).

## Common Commands

### Clone a Repository
`git clone <repository-url>`  
Downloads a remote repository to your local machine and sets the remote as `origin`.

### Check Status
`git status`  
Shows current branch, staged changes, unstaged changes, and untracked files.

### View Commit History
`git log`  
Displays commit history, including commit IDs, authors, dates, and messages.

### Create a New Branch
`git branch <branch-name>`  
Creates a new branch pointer without switching to it.

### Switch Branches
`git checkout <branch-name>`  
Switches your working directory to the specified branch.

### Pull Latest Changes
`git pull`  
Fetches and merges the latest commits from the remote branch into your current branch.

### View Differences
`git diff`  
Shows line-by-line changes that are not yet staged.

### Push (Again)
`git push`  
Pushes any new local commits to the remote repository.