/**
 * Results from a benchmark test
 */
export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  operationsPerSecond: number;
}

/**
 * Run a benchmark test
 * @param name Name of the benchmark
 * @param fn Function to benchmark
 * @param iterations Number of iterations to run
 * @returns Benchmark results
 */
export const benchmark = (
  name: string,
  fn: () => void,
  iterations: number = 1000
): BenchmarkResult => {
  // Warm up
  for (let i = 0; i < 5; i++) {
    fn();
  }
  
  // Measure
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const totalTime = performance.now() - start;
  const averageTime = totalTime / iterations;
  const operationsPerSecond = 1000 / averageTime;
  
  return {
    name,
    iterations,
    totalTime,
    averageTime,
    operationsPerSecond
  };
};

/**
 * Format benchmark results for display
 * @param result Benchmark result
 * @returns Formatted string
 */
export const formatBenchmarkResult = (result: BenchmarkResult): string => {
  return `${result.name}: ${result.averageTime.toFixed(3)} ms (${result.operationsPerSecond.toFixed(2)} ops/sec)`;
};