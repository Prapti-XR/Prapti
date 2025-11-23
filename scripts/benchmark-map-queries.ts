/**
 * Benchmark script to test map query performance
 * Run with: npx tsx scripts/benchmark-map-queries.ts
 */

interface BenchmarkResult {
  query: string;
  time: number;
  dataSize: number;
  siteCount: number;
  source: string;
}

async function benchmark(url: string, label: string): Promise<BenchmarkResult> {
  const start = Date.now();
  const response = await fetch(url);
  const data = await response.json();
  const time = Date.now() - start;
  
  const dataSize = JSON.stringify(data).length;
  
  return {
    query: label,
    time,
    dataSize,
    siteCount: data.sites?.length || 0,
    source: data.source || 'unknown',
  };
}

async function runBenchmarks() {
  const baseUrl = 'http://localhost:3000/api/sites/nearby';
  
  console.log('🚀 Starting Map Query Benchmarks\n');
  console.log('=' .repeat(80));
  
  const queries = [
    {
      label: 'Small area (high zoom)',
      params: 'north=14.574&south=14.573&east=74.852&west=74.850',
    },
    {
      label: 'Medium area (city level)',
      params: 'north=14.640&south=14.539&east=74.963&west=74.730',
    },
    {
      label: 'Large area (region level)',
      params: 'north=14.857&south=14.455&east=75.189&west=74.255',
    },
    {
      label: 'With era filter',
      params: 'north=14.640&south=14.539&east=74.963&west=74.730&era=Ancient',
    },
    {
      label: 'With country filter',
      params: 'north=14.640&south=14.539&east=74.963&west=74.730&country=India',
    },
  ];
  
  const results: BenchmarkResult[] = [];
  
  for (const query of queries) {
    console.log(`\n📊 Testing: ${query.label}`);
    
    // First request (database)
    console.log('   🔍 First request (database)...');
    const result1 = await benchmark(`${baseUrl}?${query.params}`, query.label);
    results.push(result1);
    
    console.log(`   ⏱️  Time: ${result1.time}ms`);
    console.log(`   📦 Data size: ${(result1.dataSize / 1024).toFixed(2)} KB`);
    console.log(`   🏛️  Sites: ${result1.siteCount}`);
    console.log(`   📍 Source: ${result1.source}`);
    
    // Second request (cache)
    console.log('   🔍 Second request (cache)...');
    const result2 = await benchmark(`${baseUrl}?${query.params}`, `${query.label} (cached)`);
    
    console.log(`   ⏱️  Time: ${result2.time}ms`);
    console.log(`   📍 Source: ${result2.source}`);
    
    const improvement = ((result1.time - result2.time) / result1.time * 100).toFixed(1);
    console.log(`   ✨ Cache improvement: ${improvement}%`);
    
    // Wait a bit before next query
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📈 Summary Statistics\n');
  
  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
  const avgSize = results.reduce((sum, r) => sum + r.dataSize, 0) / results.length;
  const avgSites = results.reduce((sum, r) => sum + r.siteCount, 0) / results.length;
  
  console.log(`Average query time: ${avgTime.toFixed(0)}ms`);
  console.log(`Average data size: ${(avgSize / 1024).toFixed(2)} KB`);
  console.log(`Average sites returned: ${avgSites.toFixed(0)}`);
  
  console.log('\n✅ Benchmark complete!\n');
  
  // Performance targets
  console.log('🎯 Performance Targets:');
  console.log('   - Query time: <500ms (database), <100ms (cache)');
  console.log('   - Data size: <200KB per query');
  console.log('   - Cache hit rate: >80% for repeated queries');
  
  const passedTime = results.every(r => r.time < 500);
  const passedSize = results.every(r => r.dataSize < 200 * 1024);
  
  console.log(`\n${passedTime && passedSize ? '✅' : '❌'} Overall: ${passedTime && passedSize ? 'PASS' : 'NEEDS IMPROVEMENT'}`);
}

// Run benchmarks
runBenchmarks().catch(console.error);
