import { useRef, useEffect, memo } from 'react';
import { shallowEqual } from 'react-redux';
import { useTimedSelector } from '../hooks/useTimedSelector';
import { memoizedFilteredItems } from '../features/items/selectors';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { StatItem } from './ui/stat-item';

export const Case4 = memo(function Case4() {
  const renderCount = useRef(0);
  const prevValueRef = useRef<{ id: number; value: number }[] | null>(null);

  // eslint-disable-next-line react-hooks/refs -- 의도적으로 렌더 카운트 추적
  renderCount.current += 1;

  const { value: items, selectorTimeUs } = useTimedSelector(memoizedFilteredItems);

  useEffect(() => {
    const prev = prevValueRef.current;
    if (prev !== null) {
      const sameRef = prev === items;
      const shallowEq = shallowEqual(prev, items);
      console.log(
        `[Case4] render #${renderCount.current} | ` +
          `prev === curr: ${sameRef} | shallowEqual: ${shallowEq} | ` +
          `len: ${items.length} | first.value: ${items[0]?.value}`
      );
    }
    prevValueRef.current = items;
  });

  return (
    <Card variant="success">
      <CardHeader>
        <CardTitle>Case 4: createSelector</CardTitle>
        <CardDescription>
          <code className="font-mono bg-muted/50 px-1 rounded">createSelector</code>
          <span className="mx-2 text-border/50">|</span>
          <span className="text-success">입력 동일시 캐시</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="text-sm font-mono bg-zinc-900 text-zinc-100 rounded p-3 mb-3 overflow-x-auto">
{`const selector = createSelector(
  [selectItems, selectFilterEvenOnly],
  (items, filter) => filter ? items.filter(...) : items
);
useSelector(selector);`}
        </pre>
        <div className="flex gap-4 flex-wrap">
          {/* eslint-disable-next-line react-hooks/refs -- 의도적으로 렌더 카운트 표시 */}
          <StatItem label="Render" value={renderCount.current} variant="success" />
          <StatItem label="Time" value={`${selectorTimeUs.toFixed(1)}μs`} variant="success" />
          <StatItem label="Len" value={items.length} />
          <StatItem label="[0].val" value={items[0]?.value} />
        </div>
      </CardContent>
    </Card>
  );
});
