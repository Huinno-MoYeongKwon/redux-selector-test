import { useRef, useEffect, memo } from 'react';
import { shallowEqual } from 'react-redux';
import { useTimedSelector } from '../hooks/useTimedSelector';
import { unmemoizedFilteredItems } from '../features/items/selectors';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { StatItem } from './ui/stat-item';

export const Case3 = memo(function Case3() {
  const renderCount = useRef(0);
  const prevValueRef = useRef<{ id: number; value: number }[] | null>(null);

  // eslint-disable-next-line react-hooks/refs -- 의도적으로 렌더 카운트 추적
  renderCount.current += 1;

  const { value: items, selectorTimeUs } = useTimedSelector(unmemoizedFilteredItems, shallowEqual);

  useEffect(() => {
    const prev = prevValueRef.current;
    if (prev !== null) {
      const sameRef = prev === items;
      const shallowEq = shallowEqual(prev, items);
      console.log(
        `[Case3] render #${renderCount.current} | ` +
          `prev === curr: ${sameRef} | shallowEqual: ${shallowEq} | ` +
          `len: ${items.length} | first.value: ${items[0]?.value}`
      );
    }
    prevValueRef.current = items;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case 3: 가공 배열 + shallowEqual</CardTitle>
        <CardDescription>
          <code className="text-sm font-semibold bg-muted px-2 py-1 rounded">items.filter(...)</code>
          <span className="mx-3 text-border">|</span>
          <span>equalityFn: <strong>shallowEqual</strong></span>
          <span className="mx-3 text-border">|</span>
          <span className="text-info font-semibold">내용 같으면 리렌더 방지</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-10 flex-wrap">
          {/* eslint-disable-next-line react-hooks/refs -- 의도적으로 렌더 카운트 표시 */}
          <StatItem label="Render" value={renderCount.current} variant="info" />
          <StatItem label="Time" value={`${selectorTimeUs.toFixed(1)}μs`} />
          <StatItem label="Length" value={items.length} />
          <StatItem label="[0].value" value={items[0]?.value} />
        </div>
      </CardContent>
    </Card>
  );
});
