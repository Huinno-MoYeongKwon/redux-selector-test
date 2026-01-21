import { useRef, memo } from 'react';
import { useSelector } from 'react-redux';
import { selectDraftProbeLog } from '../features/items/selectors';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';

export const Case6 = memo(function Case6() {
  const renderCount = useRef(0);
  // eslint-disable-next-line react-hooks/refs -- 의도적으로 렌더 카운트 추적
  renderCount.current += 1;

  const draftProbeLog = useSelector(selectDraftProbeLog);

  return (
    <Card variant="experiment">
      <CardHeader>
        <CardTitle>Case 6: createDraftSafeSelector</CardTitle>
        <CardDescription>
          draft(Proxy) 상태에서 캐시 동작 비교
          <span className="mx-2 text-border/50">|</span>
          <span className="text-experiment">runDraftProbe로 실행</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-3">
          {/* eslint-disable-next-line react-hooks/refs -- 의도적으로 렌더 카운트 표시 */}
          <Badge variant="experiment">Render: {renderCount.current}</Badge>
          <Badge variant="default">
            Last: {draftProbeLog.lastRunAt > 0 ? new Date(draftProbeLog.lastRunAt).toLocaleTimeString() : '-'}
          </Badge>
        </div>

        <pre className="text-sm font-mono bg-zinc-900 text-zinc-100 rounded p-3 mb-3 overflow-x-auto">
{`// reducer 내부에서 draft 상태로 selector 호출 시
createSelector(...)         // draft → 캐시 미스 가능
createDraftSafeSelector(...) // draft → 안전하게 캐시`}
        </pre>

        {/* Log */}
        <div className="rounded border border-border/50 bg-muted/20 p-3">
          {draftProbeLog.notes.length === 0 ? (
            <p className="text-lg text-muted-foreground">runDraftProbe 버튼을 클릭하세요.</p>
          ) : (
            <pre className="text-sm font-mono bg-zinc-900 text-zinc-100 rounded p-3 overflow-x-auto max-h-56">
              {draftProbeLog.notes.map((note, i) => (
                <div key={i} className={note.startsWith('결론') || note.startsWith('===') ? 'text-emerald-400 font-semibold' : ''}>
                  {note}
                </div>
              ))}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
