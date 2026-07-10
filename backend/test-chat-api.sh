#!/bin/bash

echo "🚀 Starting Chat API Test..."
echo "This will create 3 messages in the database and fetch them using the API route."

# Make sure we are in the backend directory
cd "$(dirname "$0")"

# Run the TypeScript test script using ts-node
npx ts-node src/scripts/test-chat-api.ts
