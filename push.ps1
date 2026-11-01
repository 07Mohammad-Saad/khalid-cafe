$message = Read-Host "What did you change?"

git add .

git commit -m "$message"

git push origin main