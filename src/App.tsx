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
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Redux Selector Test
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              리렌더 / createSelector / createDraftSafeSelector 동작 검증
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="rounded-xl border border-border bg-card p-6 mb-8">
          {/* Item Count */}
          <div className="flex items-center gap-5 pb-5 mb-5 border-b border-border">
            <span className="text-base font-medium text-muted-foreground">배열 크기</span>
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
              className="w-32 text-base"
            />
            <Button
              variant="outline"
              onClick={() => dispatch(setItemCount(parseInt(inputCount) || 200))}
            >
              적용
            </Button>
            <div className="ml-auto">
              <Badge variant="info">{itemCount.toLocaleString()}개</Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 flex-wrap">
            <Button variant="default" onClick={() => dispatch(bumpTick())}>
              bumpTick
            </Button>
            <Button variant="secondary" onClick={() => dispatch(mutateOneItem())}>
              mutateOneItem
            </Button>
            <Button variant="success" onClick={() => dispatch(toggleFilter())}>
              toggleFilter
            </Button>
            <Button variant="experiment" onClick={() => dispatch(runDraftProbe())}>
              runDraftProbe
            </Button>

            <div className="ml-auto flex items-center gap-4">
              <span className="text-base text-muted-foreground">
                tick: <span className="font-mono font-semibold text-foreground">{tick}</span>
              </span>
              <span className="text-base text-muted-foreground">
                filter: <span className="font-mono font-semibold text-foreground">{filterEvenOnly ? 'on' : 'off'}</span>
              </span>
            </div>
          </div>
        </div>

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
