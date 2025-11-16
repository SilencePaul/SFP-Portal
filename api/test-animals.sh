#!/bin/bash

# Animal Controller Test Script
# Make sure the server is running on port 5000

echo "=== Animal Controller Tests ==="
echo ""

# First, login to get a token
echo "1. Login as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✓ Login successful"
echo "Token: $TOKEN"
echo ""

# Test 1: Get all animals (requires auth)
echo "2. Get all animals (authenticated)..."
curl -s -X GET http://localhost:5000/api/animals \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 2: Get available animals (public)
echo "3. Get available animals (public)..."
curl -s -X GET http://localhost:5000/api/animals/available | jq .
echo ""

# Test 3: Get animal by ID (public)
echo "4. Get animal by ID (public - using ID 1)..."
curl -s -X GET http://localhost:5000/api/animals/1 | jq .
echo ""

# Test 4: Create a new animal
echo "5. Create a new animal..."
curl -s -X POST http://localhost:5000/api/animals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "unique_id": "SFP-TEST-001",
    "name": "Test Dog",
    "species": "Dog",
    "breed": "Labrador",
    "age": "2 years",
    "sex": "Male",
    "size": "Large",
    "color": "Golden",
    "description": "Friendly test dog",
    "personality": ["Friendly", "Energetic"],
    "image_urls": ["https://example.com/dog.jpg"],
    "vaccinated": true,
    "neutered": true,
    "good_with_children": true,
    "good_with_dogs": true,
    "good_with_cats": false,
    "location": "Toronto",
    "adoption_fee": 250.00,
    "status": "Published"
  }' | jq .
echo ""

# Test 5: Update an animal
echo "6. Update animal (ID 1)..."
curl -s -X PUT http://localhost:5000/api/animals/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description for this animal"
  }' | jq .
echo ""

# Test 6: Update animal state
echo "7. Update animal status..."
curl -s -X PATCH http://localhost:5000/api/animals/1/state \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "state": "adopted"
  }' | jq .
echo ""

echo "=== Tests Complete ==="
