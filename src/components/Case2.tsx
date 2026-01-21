import { useRef, useEffect, memo } from 'react';
import { shallowEqual } from 'react-redux';
import { useTimedSelector } from '../hooks/useTimedSelector';
import { unmemoizedFilteredItems } from '../features/items/selectors';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { StatItem } from './ui/stat-item';

export const Case2 = memo(function Case2() {
  const renderCount = useRef(0);
  const prevValueRef = useRef<{ id: number; value: number }[] | null>(null);

  // eslint-disable-next-line react-hooks/refs -- 의도적으로 렌더 카운트 추적
  renderCount.current += 1;

  const { value: items, selectorTimeUs } = useTimedSelector(unmemoizedFilteredItems);

  useEffect(() => {
    const prev = prevValueRef.current;
    if (prev !== null) {
      const sameRef = prev === items;
      const shallowEq = shallowEqual(prev, items);
      console.log(
        `[Case2] render #${renderCount.current} | ` +
          `prev === curr: ${sameRef} | shallowEqual: ${shallowEq} | ` +
          `len: ${items.length} | first.value: ${items[0]?.value}`
      );
    }
    prevValueRef.current = items;
  });

  return (
    <Card variant="warning">
      <CardHeader>
        <CardTitle>Case 2: 가공 배열 (메모이즈 X)</CardTitle>
        <CardDescription>
          <code className="text-sm font-semibold bg-muted px-2 py-1 rounded">items.filter(...)</code>
          <span className="mx-3 text-border">|</span>
          <span>equalityFn: <strong>없음</strong></span>
          <span className="mx-3 text-border">|</span>
          <span className="text-warning font-semibold">매번 새 배열 생성</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-10 flex-wrap">
          {/* eslint-disable-next-line react-hooks/refs -- 의도적으로 렌더 카운트 표시 */}
          <StatItem label="Render" value={renderCount.current} variant="warning" />
          <StatItem label="Time" value={`${selectorTimeUs.toFixed(1)}μs`} variant="warning" />
          <StatItem label="Length" value={items.length} />
          <StatItem label="[0].value" value={items[0]?.value} />
        </div>
      </CardContent>
    </Card>
  );
});
