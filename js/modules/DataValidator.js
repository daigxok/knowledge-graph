/**
 * DataValidator Module
 * 
 * Provides comprehensive data validation for the Higher Mathematics Domain Knowledge Graph System.
 * Validates domain data, node data, and detects circular prerequisites.
 * 
 * @module DataValidator
 */

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Custom error class for data loading errors
 */
export class DataLoadError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DataLoadError';
  }
}

/**
 * Validates a domain data structure
 * 
 * @param {Object} domain - The domain object to validate
 * @returns {boolean} - Returns true if validation passes
 * @throws {ValidationError} - Throws if validation fails
 */
export function validateDomainData(domain) {
  // Check if domain exists
  if (!domain || typeof domain !== 'object') {
    throw new ValidationError('Domain must be a valid object');
  }

  // Required fields for a domain
  const requiredFields = [
    'id',
    'name',
    'nameEn',
    'coreIdea',
    'description',
    'integratedContent',
    'traditionalChapters',
    'typicalProblems',
    'realWorldScenarios',
    'color',
    'icon',
    'keySkills'
  ];

  // Check for missing required fields
  for (const field of requiredFields) {
    if (!(field in domain)) {
      throw new ValidationError(`Domain ${domain.id || 'unknown'} missing required field: ${field}`);
    }
  }

  // Validate field types
  if (typeof domain.id !== 'string' || domain.id.trim() === '') {
    throw new ValidationError(`Domain ${domain.id}: id must be a non-empty string`);
  }

  if (typeof domain.name !== 'string' || domain.name.trim() === '') {
    throw new ValidationError(`Domain ${domain.id}: name must be a non-empty string`);
  }

  if (typeof domain.nameEn !== 'string' || domain.nameEn.trim() === '') {
    throw new ValidationError(`Domain ${domain.id}: nameEn must be a non-empty string`);
  }

  if (typeof domain.coreIdea !== 'string' || domain.coreIdea.trim() === '') {
    throw new ValidationError(`Domain ${domain.id}: coreIdea must be a non-empty string`);
  }

  if (typeof domain.description !== 'string' || domain.description.trim() === '') {
    throw new ValidationError(`Domain ${domain.id}: description must be a non-empty string`);
  }

  // Validate array fields
  if (!Array.isArray(domain.integratedContent)) {
    throw new ValidationError(`Domain ${domain.id}: integratedContent must be an array`);
  }

  if (domain.integratedContent.length === 0) {
    throw new ValidationError(`Domain ${domain.id}: integratedContent cannot be empty`);
  }

  if (!Array.isArray(domain.traditionalChapters)) {
    throw new ValidationError(`Domain ${domain.id}: traditionalChapters must be an array`);
  }

  if (domain.traditionalChapters.length === 0) {
    throw new ValidationError(`Domain ${domain.id}: traditionalChapters cannot be empty`);
  }

  if (!Array.isArray(domain.typicalProblems)) {
    throw new ValidationError(`Domain ${domain.id}: typicalProblems must be an array`);
  }

  if (!Array.isArray(domain.realWorldScenarios)) {
    throw new ValidationError(`Domain ${domain.id}: realWorldScenarios must be an array`);
  }

  if (!Array.isArray(domain.keySkills)) {
    throw new ValidationError(`Domain ${domain.id}: keySkills must be an array`);
  }

  // Validate color format (hex color)
  if (typeof domain.color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(domain.color)) {
    throw new ValidationError(`Domain ${domain.id}: color must be a valid hex color (e.g., #667eea)`);
  }

  // Validate icon
  if (typeof domain.icon !== 'string' || domain.icon.trim() === '') {
    throw new ValidationError(`Domain ${domain.id}: icon must be a non-empty string`);
  }

  // Validate real-world scenarios structure
  for (const scenario of domain.realWorldScenarios) {
    if (!scenario || typeof scenario !== 'object') {
      throw new ValidationError(`Domain ${domain.id}: each scenario must be an object`);
    }

    if (!scenario.title || typeof scenario.title !== 'string') {
      throw new ValidationError(`Domain ${domain.id}: scenario missing valid title`);
    }

    if (!scenario.description || typeof scenario.description !== 'string') {
      throw new ValidationError(`Domain ${domain.id}: scenario missing valid description`);
    }

    if (!Array.isArray(scenario.concepts)) {
      throw new ValidationError(`Domain ${domain.id}: scenario.concepts must be an array`);
    }

    if (!scenario.industry || typeof scenario.industry !== 'string') {
      throw new ValidationError(`Domain ${domain.id}: scenario missing valid industry`);
    }
  }

  return true;
}

/**
 * Validates a knowledge node data structure
 * 
 * @param {Object} node - The node object to validate
 * @returns {boolean} - Returns true if validation passes
 * @throws {ValidationError} - Throws if validation fails
 */
export function validateNodeData(node) {
  // Check if node exists
  if (!node || typeof node !== 'object') {
    throw new ValidationError('Node must be a valid object');
  }

  // Required fields for a node
  const requiredFields = [
    'id',
    'name',
    'nameEn',
    'description',
    'domains',
    'traditionalChapter',
    'difficulty',
    'prerequisites',
    'relatedSkills',
    'formula',
    'keywords',
    'importance',
    'estimatedStudyTime'
  ];

  // Check for missing required fields
  for (const field of requiredFields) {
    if (!(field in node)) {
      throw new ValidationError(`Node ${node.id || 'unknown'} missing required field: ${field}`);
    }
  }

  // Validate field types
  if (typeof node.id !== 'string' || node.id.trim() === '') {
    throw new ValidationError(`Node ${node.id}: id must be a non-empty string`);
  }

  if (typeof node.name !== 'string' || node.name.trim() === '') {
    throw new ValidationError(`Node ${node.id}: name must be a non-empty string`);
  }

  if (typeof node.nameEn !== 'string' || node.nameEn.trim() === '') {
    throw new ValidationError(`Node ${node.id}: nameEn must be a non-empty string`);
  }

  if (typeof node.description !== 'string' || node.description.trim() === '') {
    throw new ValidationError(`Node ${node.id}: description must be a non-empty string`);
  }

  // Validate domains array (must have at least one domain)
  if (!Array.isArray(node.domains)) {
    throw new ValidationError(`Node ${node.id}: domains must be an array`);
  }

  if (node.domains.length === 0) {
    throw new ValidationError(`Node ${node.id}: domains array cannot be empty (node must belong to at least one domain)`);
  }

  // Validate traditionalChapter
  if (typeof node.traditionalChapter !== 'string' || node.traditionalChapter.trim() === '') {
    throw new ValidationError(`Node ${node.id}: traditionalChapter must be a non-empty string`);
  }

  // Validate difficulty (must be 1-5)
  if (typeof node.difficulty !== 'number' || node.difficulty < 1 || node.difficulty > 5) {
    throw new ValidationError(`Node ${node.id}: difficulty must be a number between 1 and 5`);
  }

  // Validate importance (must be 1-5)
  if (typeof node.importance !== 'number' || node.importance < 1 || node.importance > 5) {
    throw new ValidationError(`Node ${node.id}: importance must be a number between 1 and 5`);
  }

  // Validate estimatedStudyTime (must be positive number)
  if (typeof node.estimatedStudyTime !== 'number' || node.estimatedStudyTime <= 0) {
    throw new ValidationError(`Node ${node.id}: estimatedStudyTime must be a positive number`);
  }

  // Validate array fields
  if (!Array.isArray(node.prerequisites)) {
    throw new ValidationError(`Node ${node.id}: prerequisites must be an array`);
  }

  if (!Array.isArray(node.relatedSkills)) {
    throw new ValidationError(`Node ${node.id}: relatedSkills must be an array`);
  }

  if (!Array.isArray(node.keywords)) {
    throw new ValidationError(`Node ${node.id}: keywords must be an array`);
  }

  if (node.keywords.length === 0) {
    throw new ValidationError(`Node ${node.id}: keywords array cannot be empty`);
  }

  // Validate formula (can be empty string but must be string)
  if (typeof node.formula !== 'string') {
    throw new ValidationError(`Node ${node.id}: formula must be a string`);
  }

  return true;
}

/**
 * Detects circular prerequisites in a collection of nodes
 * Uses depth-first search with recursion stack to detect cycles
 * 
 * @param {Array} nodes - Array of node objects to check
 * @returns {boolean} - Returns true if no circular dependencies found
 * @throws {ValidationError} - Throws if circular dependency detected
 */
export function detectCircularPrerequisites(nodes) {
  if (!Array.isArray(nodes)) {
    throw new ValidationError('Nodes must be an array');
  }

  // Create a map for quick node lookup
  const nodeMap = new Map();
  for (const node of nodes) {
    if (!node.id) {
      throw new ValidationError('All nodes must have an id field');
    }
    nodeMap.set(node.id, node);
  }

  // Track visited nodes and recursion stack
  const visited = new Set();
  const recursionStack = new Set();
  const pathStack = []; // Track the path for better error messages

  /**
   * Helper function to detect cycles using DFS
   * @param {string} nodeId - Current node ID being checked
   * @returns {boolean} - True if cycle detected
   */
  function hasCycle(nodeId) {
    // If node is in recursion stack, we found a cycle
    if (recursionStack.has(nodeId)) {
      const cycleStart = pathStack.indexOf(nodeId);
      const cyclePath = [...pathStack.slice(cycleStart), nodeId].join(' → ');
      throw new ValidationError(
        `Circular prerequisite detected: ${cyclePath}`
      );
    }

    // If already visited and no cycle found, skip
    if (visited.has(nodeId)) {
      return false;
    }

    // Get the node
    const node = nodeMap.get(nodeId);
    if (!node) {
      // Node referenced but doesn't exist - this is a different validation issue
      // We'll just skip it here as it should be caught by reference validation
      return false;
    }

    // Mark as visited and add to recursion stack
    visited.add(nodeId);
    recursionStack.add(nodeId);
    pathStack.push(nodeId);

    // Check all prerequisites
    if (node.prerequisites && Array.isArray(node.prerequisites)) {
      for (const prereqId of node.prerequisites) {
        if (hasCycle(prereqId)) {
          return true;
        }
      }
    }

    // Remove from recursion stack and path
    recursionStack.delete(nodeId);
    pathStack.pop();
    return false;
  }

  // Check each node for cycles
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      hasCycle(node.id);
    }
  }

  return true;
}

/**
 * Validates that all node prerequisites reference existing nodes
 * 
 * @param {Array} nodes - Array of node objects to check
 * @returns {boolean} - Returns true if all references are valid
 * @throws {ValidationError} - Throws if invalid reference found
 */
export function validateNodeReferences(nodes) {
  if (!Array.isArray(nodes)) {
    throw new ValidationError('Nodes must be an array');
  }

  // Create a set of all valid node IDs
  const validNodeIds = new Set(nodes.map(node => node.id));

  // Check each node's prerequisites
  for (const node of nodes) {
    if (!node.prerequisites || !Array.isArray(node.prerequisites)) {
      continue;
    }

    for (const prereqId of node.prerequisites) {
      if (!validNodeIds.has(prereqId)) {
        throw new ValidationError(
          `Node ${node.id} references non-existent prerequisite: ${prereqId}`
        );
      }
    }
  }

  return true;
}

/**
 * Validates that all node domain references are valid
 * 
 * @param {Array} nodes - Array of node objects to check
 * @param {Array} domains - Array of valid domain objects
 * @returns {boolean} - Returns true if all domain references are valid
 * @throws {ValidationError} - Throws if invalid domain reference found
 */
export function validateDomainReferences(nodes, domains) {
  if (!Array.isArray(nodes)) {
    throw new ValidationError('Nodes must be an array');
  }

  if (!Array.isArray(domains)) {
    throw new ValidationError('Domains must be an array');
  }

  // Create a set of all valid domain IDs
  const validDomainIds = new Set(domains.map(domain => domain.id));

  // Check each node's domain references
  for (const node of nodes) {
    if (!node.domains || !Array.isArray(node.domains)) {
      continue;
    }

    for (const domainId of node.domains) {
      if (!validDomainIds.has(domainId)) {
        throw new ValidationError(
          `Node ${node.id} references non-existent domain: ${domainId}`
        );
      }
    }
  }

  return true;
}

/**
 * Validates edge data structure
 * 
 * @param {Object} edge - The edge object to validate
 * @returns {boolean} - Returns true if validation passes
 * @throws {ValidationError} - Throws if validation fails
 */
export function validateEdgeData(edge) {
  if (!edge || typeof edge !== 'object') {
    throw new ValidationError('Edge must be a valid object');
  }

  const requiredFields = ['id', 'source', 'target', 'type', 'strength'];

  for (const field of requiredFields) {
    if (!(field in edge)) {
      throw new ValidationError(`Edge ${edge.id || 'unknown'} missing required field: ${field}`);
    }
  }

  if (typeof edge.id !== 'string' || edge.id.trim() === '') {
    throw new ValidationError(`Edge ${edge.id}: id must be a non-empty string`);
  }

  if (typeof edge.source !== 'string' || edge.source.trim() === '') {
    throw new ValidationError(`Edge ${edge.id}: source must be a non-empty string`);
  }

  if (typeof edge.target !== 'string' || edge.target.trim() === '') {
    throw new ValidationError(`Edge ${edge.id}: target must be a non-empty string`);
  }

  const validTypes = ['prerequisite', 'related', 'cross-domain'];
  if (!validTypes.includes(edge.type)) {
    throw new ValidationError(
      `Edge ${edge.id}: type must be one of: ${validTypes.join(', ')}`
    );
  }

  if (typeof edge.strength !== 'number' || edge.strength < 0 || edge.strength > 1) {
    throw new ValidationError(`Edge ${edge.id}: strength must be a number between 0 and 1`);
  }

  return true;
}

/**
 * Comprehensive validation of all graph data
 * 
 * @param {Object} data - Object containing domains, nodes, and edges
 * @returns {Object} - Validation result with success flag and any errors
 */
export function validateGraphData(data) {
  const errors = [];

  try {
    // Validate data structure
    if (!data || typeof data !== 'object') {
      throw new DataLoadError('Graph data must be a valid object');
    }

    if (!data.domains || !Array.isArray(data.domains)) {
      throw new DataLoadError('Graph data must contain a domains array');
    }

    if (!data.nodes || !Array.isArray(data.nodes)) {
      throw new DataLoadError('Graph data must contain a nodes array');
    }

    if (!data.edges || !Array.isArray(data.edges)) {
      throw new DataLoadError('Graph data must contain an edges array');
    }

    // Validate each domain
    for (const domain of data.domains) {
      try {
        validateDomainData(domain);
      } catch (error) {
        errors.push(error.message);
      }
    }

    // Validate each node
    for (const node of data.nodes) {
      try {
        validateNodeData(node);
      } catch (error) {
        errors.push(error.message);
      }
    }

    // Validate each edge
    for (const edge of data.edges) {
      try {
        validateEdgeData(edge);
      } catch (error) {
        errors.push(error.message);
      }
    }

    // Validate references
    try {
      validateDomainReferences(data.nodes, data.domains);
    } catch (error) {
      errors.push(error.message);
    }

    try {
      validateNodeReferences(data.nodes);
    } catch (error) {
      errors.push(error.message);
    }

    // Detect circular prerequisites
    try {
      detectCircularPrerequisites(data.nodes);
    } catch (error) {
      errors.push(error.message);
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors: errors
      };
    }

    return {
      success: true,
      message: 'All validation checks passed',
      stats: {
        domains: data.domains.length,
        nodes: data.nodes.length,
        edges: data.edges.length
      }
    };

  } catch (error) {
    return {
      success: false,
      errors: [error.message]
    };
  }
}

// Export all functions
export default {
  ValidationError,
  DataLoadError,
  validateDomainData,
  validateNodeData,
  detectCircularPrerequisites,
  validateNodeReferences,
  validateDomainReferences,
  validateEdgeData,
  validateGraphData
};
