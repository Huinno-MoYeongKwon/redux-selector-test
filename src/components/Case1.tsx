import { useRef, useEffect, memo } from 'react';
import { shallowEqual } from 'react-redux';
import type { RootState } from '../app/store';
import { useTimedSelector } from '../hooks/useTimedSelector';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { StatItem } from './ui/stat-item';
import { RenderReasonBadge } from './RenderReasonBadge';

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
          <code className="font-mono bg-muted/50 px-1 rounded">(s) =&gt; s.items.items</code>
          <span className="mx-2 text-border/50">|</span>
          equalityFn: <strong>없음</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="text-sm font-mono bg-zinc-900 text-zinc-100 rounded p-3 mb-3 overflow-x-auto">
{`const selector = (state) => state.items.items;
useSelector(selector);`}
        </pre>
        <div className="flex gap-4 flex-wrap mb-2">
          {/* eslint-disable-next-line react-hooks/refs -- 의도적으로 렌더 카운트 표시 */}
          <StatItem label="Render" value={renderCount.current} variant="info" />
          <StatItem label="실행시간" value={`${selectorTimeUs.toFixed(1)}μs`} />
          <StatItem label="Len" value={items.length} />
          <StatItem label="[0].val" value={items[0]?.value} />
        </div>
        <RenderReasonBadge caseType={1} />
      </CardContent>
    </Card>
  );
});
