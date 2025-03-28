#!/bin/bash

# This script helps set up the Stripe CLI for webhook testing
# Make sure you have the Stripe CLI installed: https://stripe.com/docs/stripe-cli

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Stripe webhook forwarding for testing...${NC}"

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo -e "${RED}Stripe CLI is not installed. Please install it from https://stripe.com/docs/stripe-cli${NC}"
    exit 1
fi

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${RED}.env file not found. Please create one with your Stripe API keys.${NC}"
    exit 1
fi

# Load environment variables
source .env

# Login to Stripe if needed
echo -e "${YELLOW}Checking Stripe CLI login status...${NC}"
if ! stripe whoami &> /dev/null; then
    echo -e "${YELLOW}Please login to Stripe CLI:${NC}"
    stripe login
fi

# Start webhook forwarding
echo -e "${GREEN}Starting webhook forwarding to localhost:3000...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the webhook forwarding${NC}"

stripe listen --forward-to localhost:3000/api/stripe/webhook \
    --events checkout.session.completed,payment_intent.succeeded,payment_intent.payment_failed

echo -e "${GREEN}Webhook forwarding stopped.${NC}" 