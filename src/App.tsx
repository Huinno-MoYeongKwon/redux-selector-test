import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './app/store';
import { setItemCount, bumpTick, mutateOneItem, toggleFilter, runDraftProbe } from './features/items/itemsSlice';
import { useState } from 'react';
import { Case1 } from './components/Case1';
import { Case2 } from './components/Case2';
import { Case3 } from './components/Case3';
import { Case4 } from './components/Case4';
import { Case5 } from './components/Case5';
import { Case6 } from './components/Case6';
import { Case7 } from './components/Case7';
import { ThemeToggle } from './components/ThemeToggle';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const tick = useSelector((state: RootState) => state.items.tick);
  const filterEvenOnly = useSelector((state: RootState) => state.items.filterEvenOnly);
  const itemCount = useSelector((state: RootState) => state.items.items.length);
  const [inputCount, setInputCount] = useState(itemCount.toString());

  return (
    <div className="min-h-screen">
      {/* Sticky Header + Controls */}
      <div className="sticky top-0 z-50">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Redux Selector Test
              </h1>
              <p className="text-sm text-muted-foreground">
                리렌더 / createSelector / createDraftSafeSelector 동작 검증
              </p>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Controls */}
        <div className="border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 py-4">
            {/* Item Count */}
            <div className="flex items-center gap-4 pb-4 mb-4 border-b border-border/50">
              <span className="text-sm font-medium text-muted-foreground">배열 크기</span>
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
                className="w-28 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(setItemCount(parseInt(inputCount) || 200))}
              >
                적용
              </Button>
              <Badge variant="info">{itemCount.toLocaleString()}개</Badge>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <Button variant="default" size="sm" onClick={() => dispatch(bumpTick())}>
                  bumpTick
                </Button>
                <Button variant="secondary" size="sm" onClick={() => dispatch(mutateOneItem())}>
                  mutateOneItem
                </Button>
                <Button variant="success" size="sm" onClick={() => dispatch(toggleFilter())}>
                  toggleFilter
                </Button>
                <Button variant="experiment" size="sm" onClick={() => dispatch(runDraftProbe())}>
                  runDraftProbe
                </Button>
              </div>

              <div className="ml-auto flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  tick: <span className="font-mono font-semibold text-foreground">{tick}</span>
                </span>
                <span className="text-muted-foreground">
                  filter: <span className="font-mono font-semibold text-foreground">{filterEvenOnly ? 'on' : 'off'}</span>
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
              {/* 상태 구조 */}
              <div className="space-y-1">
                <div>
                  <span className="font-semibold text-foreground">items:</span>
                  <code className="ml-1 px-1.5 py-0.5 bg-muted rounded font-mono">
                    {'{ id: number, value: number }[]'}
                  </code>
                </div>
                <div>
                  <span className="font-semibold text-foreground">tick:</span>
                  <span className="ml-1">items와 무관한 카운터 (리렌더 테스트용)</span>
                </div>
              </div>
              {/* 버튼 설명 */}
              <div className="space-y-1">
                <div><span className="font-semibold text-foreground">bumpTick</span>: tick += 1 (items 불변)</div>
                <div><span className="font-semibold text-foreground">mutateOneItem</span>: items[0].value += 1</div>
                <div><span className="font-semibold text-foreground">toggleFilter</span>: 짝수만 필터 on/off</div>
                <div><span className="font-semibold text-foreground">runDraftProbe</span>: draft에서 selector 캐시 테스트</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-6">
        {/* Cases */}
        <div className="space-y-5">
          <Case1 />
          <Case2 />
          <Case3 />
          <Case4 />
          <Case5 />
          <Case6 />
          <Case7 />
        </div>

        {/* Footer Table */}
        <div className="mt-12 rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold text-foreground mb-5">
            버튼별 예상 리렌더 동작
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left font-semibold text-muted-foreground">Action</th>
                  <th className="py-3 px-4 text-center font-semibold text-muted-foreground">Case 1</th>
                  <th className="py-3 px-4 text-center font-semibold text-muted-foreground">Case 2</th>
                  <th className="py-3 px-4 text-center font-semibold text-muted-foreground">Case 3</th>
                  <th className="py-3 px-4 text-center font-semibold text-muted-foreground">Case 4</th>
                  <th className="py-3 px-4 text-center font-semibold text-muted-foreground">Case 5</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-semibold">bumpTick</td>
                  <td className="py-3 px-4 text-center"><span className="text-success font-bold text-lg">-</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-warning font-bold text-lg">O</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-success font-bold text-lg">-</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-success font-bold text-lg">-</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-success font-bold text-lg">-</span></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-semibold">mutateOneItem</td>
                  <td className="py-3 px-4 text-center"><span className="text-warning font-bold text-lg">O</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-warning font-bold text-lg">O</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-warning font-bold text-lg">O</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-warning font-bold text-lg">O</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-warning font-bold text-lg">O</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">toggleFilter</td>
                  <td className="py-3 px-4 text-center"><span className="text-warning font-bold text-lg">O</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-warning font-bold text-lg">O</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-warning font-bold text-lg">O</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-warning font-bold text-lg">O</span></td>
                  <td className="py-3 px-4 text-center"><span className="text-warning font-bold text-lg">O</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            <strong>O</strong> = 리렌더 발생, <strong>-</strong> = 리렌더 없음 / Case 6은 runDraftProbe 시에만 리렌더
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
