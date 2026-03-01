# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - AllNodes Type Safety
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing case(s) to ensure reproducibility
  - Test that when `this.allNodes` is not an array (undefined, null, or object), calling `.filter()` throws `TypeError: this.allNodes.filter is not a function`
  - Test scenarios: `this.allNodes = undefined`, `this.allNodes = null`, `this.allNodes = {}`
  - The test assertions should match the Expected Behavior: system converts non-array to empty array and prevents TypeError
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause (e.g., "renderPrerequisitesList() with this.allNodes=undefined throws TypeError")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Valid Array Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (when `this.allNodes` is a valid array)
  - Observe: `renderPrerequisitesList()` with valid array displays node list correctly
  - Observe: Filter logic (excluding current node, search filtering) works correctly
  - Observe: Node selection and UI rendering work as expected
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Test that for all valid array inputs, node list display, filtering, and selection work correctly
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [-] 3. Fix for AllNodes filter TypeError

  - [x] 3.1 Implement type safety in NodeEditor.js
    - Add defensive type check at the start of `renderPrerequisitesList()` method
    - Ensure `this.allNodes` is converted to empty array if not an array type
    - Add type check in `loadPrerequisitesList()` before assigning to `this.allNodes`
    - Use `Array.isArray()` to validate and convert: `this.allNodes = Array.isArray(nodes) ? nodes : []`
    - Add type check in `renderSelectedPrerequisites()` before using `.find()` method
    - Ensure constructor initializes `this.allNodes = []` with clear documentation
    - _Bug_Condition: isBugCondition(input) where input.allNodes is not an array (undefined, null, or object) and operation is 'filter'_
    - _Expected_Behavior: When this.allNodes is not an array, system converts it to empty array, preventing TypeError and allowing filter operation to complete successfully (from design Property 1)_
    - _Preservation: When this.allNodes is a valid array, all existing functionality for node list display, filtering, and selection must remain unchanged (from design Property 2)_
    - _Requirements: 2.1, 2.3_

  - [x] 3.2 Strengthen NodeDataManager.js type guarantees
    - Add stricter type check in `getAllNodes()` method
    - If `this.nodes` is not an array, log warning and return empty array
    - Improve error handling in `loadNodes()` to ensure `this.nodes = []` in catch block
    - Validate `this.nodes` is array before returning from `loadNodes()`
    - Add detailed error logging for debugging
    - _Bug_Condition: nodeDataManager.getAllNodes() returns non-array type_
    - _Expected_Behavior: getAllNodes() always returns array type, even on error_
    - _Preservation: Normal node loading and retrieval behavior unchanged_
    - _Requirements: 2.1, 2.3_

  - [x] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - AllNodes Type Safety
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed) ✓
    - Verify no TypeError is thrown when `this.allNodes` is not an array ✓
    - Verify system converts non-array to empty array successfully ✓
    - **RESULT**: All 8 bug condition tests passed successfully
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Valid Array Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions) ✓
    - Confirm all tests still pass after fix (no regressions) ✓
    - Verify node list display, filtering, and selection work correctly with valid arrays ✓
    - Verify existing node editing functionality unchanged ✓
    - **RESULT**: All 12 preservation tests passed successfully

- [x] 4. Checkpoint - Ensure all tests pass
  - Run all exploration and preservation tests ✓
  - Verify bug is fixed: no TypeError when `this.allNodes` is not an array ✓
  - Verify preservation: all existing functionality works with valid arrays ✓
  - **Bug Exploration Tests**: 8/8 passed
  - **Preservation Tests**: 12/12 passed
  - **Total**: 20/20 tests passed
  - Test complete node creation flow: Ready for manual testing
  - Test node editing flow: Ready for manual testing
  - Test error scenarios: Covered in automated tests ✓

