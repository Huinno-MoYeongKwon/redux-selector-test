import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './app/store';
import { setItemCount, setItemMode, bumpTick, mutateOneItem, toggleFilter } from './features/items/itemsSlice';
import type { ItemMode } from './features/items/itemsSlice';
import { useState } from 'react';
import { Case1 } from './components/Case1';
import { Case2 } from './components/Case2';
import { Case3 } from './components/Case3';
import { Case4 } from './components/Case4';
import { Case5 } from './components/Case5';
import { Case6 } from './components/Case6';
import { ThemeToggle } from './components/ThemeToggle';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';

const MODE_LABELS: Record<ItemMode, string> = {
  simple: 'Simple',
  medium: 'Medium',
  deep: 'Deep',
};

const MODE_DESCRIPTIONS: Record<ItemMode, string> = {
  simple: '2 fields',
  medium: '~15 fields',
  deep: '~50+ fields, 6 depth',
};

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const tick = useSelector((state: RootState) => state.items.tick);
  const filterEvenOnly = useSelector((state: RootState) => state.items.filterEvenOnly);
  const itemCount = useSelector((state: RootState) => state.items.items.length);
  const itemMode = useSelector((state: RootState) => state.items.itemMode);
  const [inputCount, setInputCount] = useState(itemCount.toString());

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          {/* Top Row: Title + Theme Toggle */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-bold">Redux Selector Test</h1>
              <span className="text-xs text-muted-foreground hidden sm:inline">리렌더 / createSelector / shallowEqual</span>
            </div>
            <ThemeToggle />
          </div>

          {/* Control Row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Size Control */}
            <div className="flex items-center gap-2 pr-4 border-r border-border/50">
              <span className="text-lg text-muted-foreground">Size</span>
              <Input
                type="number"
                min={1}
                max={10000}
                value={inputCount}
                onChange={(e) => setInputCount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    dispatch(setItemCount(parseInt(inputCount) || 200));
                  }
                }}
                className="w-24"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(setItemCount(parseInt(inputCount) || 200))}
              >
                Set
              </Button>
              <Badge variant="info">{itemCount.toLocaleString()}</Badge>
            </div>

            {/* Mode Control */}
            <div className="flex items-center gap-2 pr-4 border-r border-border/50">
              <span className="text-lg text-muted-foreground">Mode</span>
              <select
                value={itemMode}
                onChange={(e) => dispatch(setItemMode(e.target.value as ItemMode))}
                className="px-3 py-2 text-lg border border-input rounded bg-transparent cursor-pointer"
              >
                {(['simple', 'medium', 'deep'] as ItemMode[]).map((mode) => (
                  <option key={mode} value={mode}>
                    {MODE_LABELS[mode]}
                  </option>
                ))}
              </select>
              <Badge variant="default" className="hidden sm:inline-flex">
                {MODE_DESCRIPTIONS[itemMode]}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" onClick={() => dispatch(bumpTick())}>
                bumpTick
              </Button>
              <Button variant="secondary" size="sm" onClick={() => dispatch(mutateOneItem())}>
                mutateOneItem
              </Button>
              <Button variant="success" size="sm" onClick={() => dispatch(toggleFilter())}>
                {filterEvenOnly ? '전체 보기' : '짝수만 보기'}
              </Button>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4 ml-auto text-lg">
              <span className="text-muted-foreground">
                tick: <span className="font-mono font-semibold text-foreground">{tick}</span>
              </span>
              <span className="text-muted-foreground">
                보기: <span className="font-mono font-semibold text-foreground">{filterEvenOnly ? '짝수만' : '전체'}</span>
              </span>
            </div>
          </div>

          {/* Info Row - Collapsible on mobile */}
          <details className="mt-3 text-lg">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">상태 구조 & 버튼 설명</summary>
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-muted-foreground">
              <div>
                <span className="text-foreground">items:</span>{' '}
                <code className="px-1.5 py-0.5 bg-muted rounded text-lg font-mono">{'{ id, value }[]'}</code>
              </div>
              <div><span className="text-foreground">bumpTick:</span> tick += 1</div>
              <div><span className="text-foreground">tick:</span> items와 무관한 카운터</div>
              <div><span className="text-foreground">mutateOneItem:</span> items[0].value += 1</div>
              <div><span className="text-foreground">filterEvenOnly:</span> 짝수만 보기 상태</div>
              <div><span className="text-foreground">짝수만/전체:</span> 필터 상태 토글</div>
            </div>
          </details>
        </div>
      </div>

      {/* Main Content - 2 Column Grid */}
      <main className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Left Column - Case 1-5 */}
          <div className="space-y-3">
            <Case1 key={`case1-${itemMode}`} />
            <Case2 key={`case2-${itemMode}`} />
            <Case3 key={`case3-${itemMode}`} />
            <Case4 key={`case4-${itemMode}`} />
            <Case5 key={`case5-${itemMode}`} />
          </div>

          {/* Right Column - Case 6 + Summary */}
          <div className="space-y-3">
            <Case6 key={`case6-${itemMode}`} />

            {/* Summary Table */}
            <div className="rounded-lg border border-border/50 bg-card/80 p-4">
              <h3 className="text-xl font-semibold mb-3">버튼별 예상 리렌더</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-lg">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="py-1.5 px-2 text-left font-medium text-muted-foreground">Action</th>
                      <th className="py-1.5 px-2 text-center font-medium text-muted-foreground">1</th>
                      <th className="py-1.5 px-2 text-center font-medium text-muted-foreground">2</th>
                      <th className="py-1.5 px-2 text-center font-medium text-muted-foreground">3</th>
                      <th className="py-1.5 px-2 text-center font-medium text-muted-foreground">4</th>
                      <th className="py-1.5 px-2 text-center font-medium text-muted-foreground">5</th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    <tr className="border-b border-border/30">
                      <td className="py-1.5 px-2 text-left font-medium">bumpTick</td>
                      <td className="py-1.5 px-2 text-success">-</td>
                      <td className="py-1.5 px-2 text-warning">O</td>
                      <td className="py-1.5 px-2 text-success">-</td>
                      <td className="py-1.5 px-2 text-success">-</td>
                      <td className="py-1.5 px-2 text-success">-</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-1.5 px-2 text-left font-medium">mutateOneItem</td>
                      <td className="py-1.5 px-2 text-warning">O</td>
                      <td className="py-1.5 px-2 text-warning">O</td>
                      <td className="py-1.5 px-2 text-warning">O</td>
                      <td className="py-1.5 px-2 text-warning">O</td>
                      <td className="py-1.5 px-2 text-warning">O</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 text-left font-medium">필터 토글</td>
                      <td className="py-1.5 px-2 text-success">-</td>
                      <td className="py-1.5 px-2 text-warning">O</td>
                      <td className="py-1.5 px-2 text-warning">O</td>
                      <td className="py-1.5 px-2 text-warning">O</td>
                      <td className="py-1.5 px-2 text-warning">O</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-lg text-muted-foreground space-y-1">
                <p>
                  <span className="text-warning">O</span> = 리렌더 / <span className="text-success">-</span> = 스킵
                </p>
                <p>
                  <span className="font-semibold text-foreground">실행시간</span> = useSelector 내부 함수 실행 시간 (μs, 1ms = 1,000μs)
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
