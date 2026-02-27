/**
 * Integration test to validate actual data files
 * Run with: node test-validate-data-files.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { validateGraphData } from './js/modules/DataValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Data Files Validation Test\n');
console.log('='.repeat(70));
console.log('Loading and validating actual project data files...');
console.log('='.repeat(70));

try {
  // Load data files
  console.log('\n📂 Loading data files...');
  
  const domainsPath = join(__dirname, 'data/domains.json');
  const nodesPath = join(__dirname, 'data/nodes.json');
  const edgesPath = join(__dirname, 'data/edges.json');
  
  const domainsData = JSON.parse(readFileSync(domainsPath, 'utf-8'));
  const nodesData = JSON.parse(readFileSync(nodesPath, 'utf-8'));
  const edgesData = JSON.parse(readFileSync(edgesPath, 'utf-8'));
  
  // Extract arrays from the wrapper objects
  const domains = domainsData.domains || domainsData;
  const nodes = nodesData.nodes || nodesData;
  const edges = edgesData.edges || edgesData;
  
  console.log(`✓ Loaded ${domains.length} domains`);
  console.log(`✓ Loaded ${nodes.length} nodes`);
  console.log(`✓ Loaded ${edges.length} edges`);
  
  // Validate the data
  console.log('\n🔍 Validating data structure...\n');
  
  const graphData = {
    domains: domains,
    nodes: nodes,
    edges: edges
  };
  
  const result = validateGraphData(graphData);
  
  if (result.success) {
    console.log('✅ SUCCESS: All data files are valid!\n');
    console.log('📊 Statistics:');
    console.log(`   - Domains: ${result.stats.domains}`);
    console.log(`   - Nodes: ${result.stats.nodes}`);
    console.log(`   - Edges: ${result.stats.edges}`);
    console.log('\n✨ Data validation complete. All requirements met.');
    console.log('\n✅ Requirement 10.3: Data structure validation passed');
    console.log('   - All domains have complete metadata');
    console.log('   - All nodes have valid structure');
    console.log('   - All edges are properly formatted');
    console.log('   - No circular prerequisites detected');
    console.log('   - All references are valid');
    
    process.exit(0);
  } else {
    console.log('❌ VALIDATION FAILED\n');
    console.log('Errors found:');
    result.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
    console.log('\n⚠️ Please fix the errors above and run validation again.');
    process.exit(1);
  }
  
} catch (error) {
  console.error(`\n❌ Error during validation: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
}
