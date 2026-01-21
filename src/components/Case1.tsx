import { useRef, useEffect, memo } from 'react';
import { shallowEqual } from 'react-redux';
import type { RootState } from '../app/store';
import { useTimedSelector } from '../hooks/useTimedSelector';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { StatItem } from './ui/stat-item';

export const Case1 = memo(function Case1() {
  const renderCount = useRef(0);
  const prevValueRef = useRef<{ id: number; value: number }[] | null>(null);

  // eslint-disable-next-line react-hooks/refs -- 의도적으로 렌더 카운트 추적
  renderCount.current += 1;

  const selector = (state: RootState) => state.items.items;
  const { value: items, selectorTimeUs } = useTimedSelector(selector);

  useEffect(() => {
    const prev = prevValueRef.current;
    if (prev !== null) {
      const sameRef = prev === items;
      const shallowEq = shallowEqual(prev, items);
      console.log(
        `[Case1] render #${renderCount.current} | ` +
          `prev === curr: ${sameRef} | shallowEqual: ${shallowEq} | ` +
          `len: ${items.length} | first.value: ${items[0]?.value}`
      );
    }
    prevValueRef.current = items;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case 1: 기본 배열 반환</CardTitle>
        <CardDescription>
          <code className="text-sm font-semibold bg-muted px-2 py-1 rounded">(s) =&gt; s.items.items</code>
          <span className="mx-3 text-border">|</span>
          <span>equalityFn: <strong>없음 (===)</strong></span>
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
