import { memo, useState, useCallback } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../app/store';
import type { Item } from '../features/items/itemsSlice';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';

interface BenchmarkResult {
  name: string;
  avgTimeUs: number;
  totalTimeMs: number;
  iterations: number;
  description: string;
}

const basicSelector = (state: RootState) => state.items.items;

const filterSelector = (state: RootState) => {
  const { items, filterEvenOnly } = state.items;
  if (!filterEvenOnly) return items.filter(() => true);
  return items.filter((item) => item.value % 2 === 0);
};

const memoizedSelector = createSelector(
  [(state: RootState) => state.items.items, (state: RootState) => state.items.filterEvenOnly],
  (items, filterEvenOnly) => {
    if (!filterEvenOnly) return items;
    return items.filter((item) => item.value % 2 === 0);
  }
);

export const Case7 = memo(function Case7() {
  const [iterations, setIterations] = useState(1000);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const state = useSelector((s: RootState) => s);

  const runBenchmark = useCallback(() => {
    setIsRunning(true);
    setResults([]);

    setTimeout(() => {
      const newResults: BenchmarkResult[] = [];
      const items = state.items.items;

      // 1. Basic
      {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) basicSelector(state);
        const end = performance.now();
        newResults.push({
          name: '기본 selector',
          avgTimeUs: ((end - start) / iterations) * 1000,
          totalTimeMs: end - start,
          iterations,
          description: '단순 참조 반환',
        });
      }

      // 2. Filter
      {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) filterSelector(state);
        const end = performance.now();
        newResults.push({
          name: 'filter selector',
          avgTimeUs: ((end - start) / iterations) * 1000,
          totalTimeMs: end - start,
          iterations,
          description: '매번 새 배열',
        });
      }

      // 3. createSelector hit
      {
        memoizedSelector(state);
        const start = performance.now();
        for (let i = 0; i < iterations; i++) memoizedSelector(state);
        const end = performance.now();
        newResults.push({
          name: 'createSelector (hit)',
          avgTimeUs: ((end - start) / iterations) * 1000,
          totalTimeMs: end - start,
          iterations,
          description: '캐시 반환',
        });
      }

      // 4. createSelector miss
      {
        const itemVariants: Item[][] = [];
        for (let i = 0; i < Math.min(iterations, 100); i++) {
          itemVariants.push(items.map((item) => ({ ...item, value: item.value + i })));
        }
        const testSelector = createSelector(
          [(s: { items: Item[]; flag: boolean }) => s.items, (s: { items: Item[]; flag: boolean }) => s.flag],
          (items, flag) => (flag ? items.filter((item) => item.value % 2 === 0) : items)
        );
        const actualIterations = Math.min(iterations, 100);
        const start = performance.now();
        for (let i = 0; i < actualIterations; i++) {
          testSelector({ items: itemVariants[i], flag: false });
        }
        const end = performance.now();
        newResults.push({
          name: 'createSelector (miss)',
          avgTimeUs: ((end - start) / actualIterations) * 1000,
          totalTimeMs: end - start,
          iterations: actualIterations,
          description: '재계산',
        });
      }

      // 5. shallowEqual diff ref
      {
        const arr1 = items;
        const arr2 = [...items];
        const start = performance.now();
        for (let i = 0; i < iterations; i++) shallowEqual(arr1, arr2);
        const end = performance.now();
        newResults.push({
          name: 'shallowEqual (diff)',
          avgTimeUs: ((end - start) / iterations) * 1000,
          totalTimeMs: end - start,
          iterations,
          description: `${items.length}개 비교`,
        });
      }

      // 6. shallowEqual same ref
      {
        const arr1 = items;
        const start = performance.now();
        for (let i = 0; i < iterations; i++) shallowEqual(arr1, arr1);
        const end = performance.now();
        newResults.push({
          name: 'shallowEqual (same)',
          avgTimeUs: ((end - start) / iterations) * 1000,
          totalTimeMs: end - start,
          iterations,
          description: '즉시 true',
        });
      }

      setResults(newResults);
      setIsRunning(false);

      console.log('\n[Case7] Benchmark Results');
      console.table(newResults.map((r) => ({
        Name: r.name,
        'Avg (μs)': r.avgTimeUs.toFixed(3),
        Iterations: r.iterations,
      })));
    }, 10);
  }, [iterations, state]);

  return (
    <Card variant="benchmark">
      <CardHeader>
        <CardTitle>Case 7: 벤치마크</CardTitle>
        <CardDescription>
          각 방식의 실행 시간 비교
          <span className="mx-3 text-border">|</span>
          <span className="text-benchmark font-semibold">Run Benchmark 버튼으로 측정</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-5 mb-6">
          <label className="flex items-center gap-3 text-base">
            <span className="text-muted-foreground font-medium">반복</span>
            <select
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="px-4 py-2 text-base border border-input rounded-lg bg-transparent cursor-pointer"
            >
              <option value={100}>100</option>
              <option value={1000}>1,000</option>
              <option value={5000}>5,000</option>
              <option value={10000}>10,000</option>
            </select>
          </label>
          <Button onClick={runBenchmark} disabled={isRunning} variant="benchmark">
            {isRunning ? 'Running...' : 'Run Benchmark'}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-base">
              <thead>
                <tr className="bg-muted/50">
                  <th className="py-3 px-5 text-left font-semibold text-muted-foreground">방식</th>
                  <th className="py-3 px-5 text-left font-semibold text-muted-foreground">설명</th>
                  <th className="py-3 px-5 text-right font-semibold text-muted-foreground">평균 (μs)</th>
                  <th className="py-3 px-5 text-right font-semibold text-muted-foreground">배수</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, i) => {
                  const baseline = results[0].avgTimeUs || 1;
                  const relative = result.avgTimeUs / baseline;
                  return (
                    <tr key={i} className="border-t border-border/50">
                      <td className="py-3 px-5 font-semibold">{result.name}</td>
                      <td className="py-3 px-5 text-muted-foreground">{result.description}</td>
                      <td className="py-3 px-5 text-right font-mono font-semibold">{result.avgTimeUs.toFixed(3)}</td>
                      <td className={`py-3 px-5 text-right font-mono font-bold ${relative > 10 ? 'text-warning' : relative < 2 ? 'text-success' : ''}`}>
                        {relative.toFixed(1)}x
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {results.length === 0 && (
          <div className="text-base text-muted-foreground">
            Run Benchmark를 클릭하면 결과가 여기에 표시됩니다.
          </div>
        )}
      </CardContent>
    </Card>
  );
});
