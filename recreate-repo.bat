@echo off
echo Creating backup of current repository...
cd /d "c:\Users\Vijay\OneDrive\Desktop\clone"
if exist "ResumeXpert-Ai-backup" rmdir /s /q "ResumeXpert-Ai-backup"
xcopy "ResumeXpert-Ai" "ResumeXpert-Ai-backup" /e /i /h /y

echo.
echo Repository backed up to ResumeXpert-Ai-backup
echo.
echo Please follow these steps:
echo 1. Go to https://github.com/Vijaypal64328/ResumeXpert-Ai
echo 2. Click Settings (tab at the top)
echo 3. Scroll down to "Danger Zone"
echo 4. Click "Delete this repository"
echo 5. Type the repository name to confirm deletion
echo 6. After deletion, go to https://github.com/new
echo 7. Create a new repository with the same name: ResumeXpert-Ai
echo 8. Do NOT initialize with README, .gitignore, or license
echo 9. Run the push command again
echo.
pause
