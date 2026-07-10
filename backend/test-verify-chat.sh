#!/bin/bash

echo "🚀 Starting Chat API Verification..."

# Make sure we are in the backend directory
cd "$(dirname "$0")"

# Run the TypeScript verification script using ts-node
npx ts-node src/scripts/verify-chat.ts
