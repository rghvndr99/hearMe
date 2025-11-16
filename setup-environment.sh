#!/bin/bash

# VoiceLap Environment Setup Script
# Helps you set up the correct environment configuration

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        VoiceLap Environment Setup                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Ask which environment
echo -e "${YELLOW}Which environment do you want to set up?${NC}"
echo "1) Development (local MongoDB)"
echo "2) Staging (MongoDB Atlas)"
echo "3) Production (MongoDB Atlas)"
echo ""
read -p "Enter choice [1-3]: " env_choice

case $env_choice in
  1)
    ENV="development"
    ENV_FILE=".env.development"
    ;;
  2)
    ENV="staging"
    ENV_FILE=".env.staging"
    ;;
  3)
    ENV="production"
    ENV_FILE=".env.production"
    ;;
  *)
    echo -e "${RED}Invalid choice. Exiting.${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}Setting up ${ENV} environment...${NC}"
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
  echo -e "${YELLOW}⚠️  .env file already exists${NC}"
  read -p "Do you want to overwrite it? [y/N]: " overwrite
  if [[ ! $overwrite =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Keeping existing .env file${NC}"
    exit 0
  fi
fi

# Copy environment template to .env
echo -e "${BLUE}Copying ${ENV_FILE} to .env...${NC}"
cp "$ENV_FILE" .env

echo -e "${GREEN}✅ Created .env file from ${ENV_FILE}${NC}"
echo ""

# For staging/production, prompt for MongoDB Atlas URI
if [ "$ENV" != "development" ]; then
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}MongoDB Atlas Configuration${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "You need to update the MongoDB Atlas connection string in .env"
  echo ""
  echo "Format:"
  echo "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority"
  echo ""
  read -p "Do you have your MongoDB Atlas URI ready? [y/N]: " has_uri
  
  if [[ $has_uri =~ ^[Yy]$ ]]; then
    read -p "Enter your MongoDB Atlas URI: " atlas_uri
    
    # Update MONGO_URI in .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' "s|MONGO_URI=.*|MONGO_URI=$atlas_uri|" .env
    else
      # Linux
      sed -i "s|MONGO_URI=.*|MONGO_URI=$atlas_uri|" .env
    fi
    
    echo -e "${GREEN}✅ Updated MONGO_URI in .env${NC}"
  else
    echo -e "${YELLOW}⚠️  Please update MONGO_URI in .env manually${NC}"
  fi
  
  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}JWT Secret Configuration${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  read -p "Generate a random JWT secret? [Y/n]: " gen_jwt
  
  if [[ ! $gen_jwt =~ ^[Nn]$ ]]; then
    jwt_secret=$(openssl rand -base64 48)
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$jwt_secret|" .env
    else
      sed -i "s|JWT_SECRET=.*|JWT_SECRET=$jwt_secret|" .env
    fi
    
    echo -e "${GREEN}✅ Generated and set JWT_SECRET${NC}"
  fi
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Environment setup complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Update API keys in .env file:"
echo "   - OPENAI_API_KEY"
echo "   - ELEVENLABS_API_KEY"
echo "   - RESEND_API_KEY"
echo "   - DEEPGRAM_API_KEY"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo ""

if [ "$ENV" != "development" ]; then
  echo "2. Update FRONTEND_ORIGIN in .env with your domain"
  echo ""
  echo "3. Migrate data to Atlas (if needed):"
  echo "   export MONGO_ATLAS_URI=\"your-atlas-uri\""
  echo "   npm run migrate:atlas"
  echo ""
fi

echo "4. Start the application:"
if [ "$ENV" == "development" ]; then
  echo "   npm run dev"
else
  echo "   npm run start:${ENV}"
fi
echo ""

echo -e "${YELLOW}⚠️  Remember: Never commit .env to git!${NC}"
echo ""

