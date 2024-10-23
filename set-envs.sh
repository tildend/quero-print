# Read the .env file and run the `fly secrets set VAR=VALUE`` command for each line
while IFS= read -r line; do
    if [[ $line =~ ^([A-Z0-9_]+)=(.*)$ ]]; then
        fly secrets set $line
    fi
done < .env