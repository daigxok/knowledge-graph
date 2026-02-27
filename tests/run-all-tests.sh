#!/bin/bash

# Run All Tests Script
# Executes property tests and unit tests for Phase 2

echo "🧪 Phase 2 Test Suite"
echo "===================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
OVERALL_STATUS=0

# Run Property Tests
echo "📋 Running Property-Based Tests..."
echo "-----------------------------------"
node tests/property-tests.js
PROPERTY_STATUS=$?

if [ $PROPERTY_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ Property tests passed${NC}"
else
    echo -e "${RED}❌ Property tests failed${NC}"
    OVERALL_STATUS=1
fi

echo ""
echo ""

# Run Unit Tests
echo "📋 Running Unit Tests..."
echo "------------------------"
node tests/unit-tests.js
UNIT_STATUS=$?

if [ $UNIT_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ Unit tests passed${NC}"
else
    echo -e "${RED}❌ Unit tests failed${NC}"
    OVERALL_STATUS=1
fi

echo ""
echo ""

# Final Summary
echo "===================="
echo "📊 Final Test Summary"
echo "===================="
echo ""

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo -e "${RED}❌ Some tests failed${NC}"
fi

echo ""

exit $OVERALL_STATUS
