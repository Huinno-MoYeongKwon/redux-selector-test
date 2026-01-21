import { useRef, memo } from 'react';
import { useSelector } from 'react-redux';
import { selectDraftProbeLog } from '../features/items/selectors';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';

export const Case6 = memo(function Case6() {
  const renderCount = useRef(0);
  renderCount.current += 1;

  const draftProbeLog = useSelector(selectDraftProbeLog);

  return (
    <Card variant="experiment">
      <CardHeader>
        <CardTitle>Case 6: createDraftSafeSelector 실험</CardTitle>
        <CardDescription>
          reducer 내부에서 draft(Proxy) 상태를 selector에 전달할 때 캐시 동작 비교
          <span className="mx-3 text-border">|</span>
          <span className="text-experiment font-semibold">runDraftProbe 버튼으로 실행</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-5 mb-6">
          <Badge variant="experiment" className="text-lg">Render: {renderCount.current}</Badge>
          <Badge variant="default" className="text-lg">
            Last: {draftProbeLog.lastRunAt > 0 ? new Date(draftProbeLog.lastRunAt).toLocaleTimeString() : '-'}
          </Badge>
        </div>

        {/* Log */}
        <div className="rounded-lg border border-border bg-muted/30 p-5">
          <h4 className="text-base font-semibold text-foreground mb-4">실험 결과</h4>
          {draftProbeLog.notes.length === 0 ? (
            <p className="text-base text-muted-foreground">
              runDraftProbe 버튼을 클릭하세요.
            </p>
          ) : (
            <pre className="text-sm font-mono bg-zinc-900 text-zinc-100 rounded-lg p-5 overflow-x-auto leading-relaxed">
              {draftProbeLog.notes.map((note, i) => (
                <div key={i} className={note.startsWith('결론') || note.startsWith('===') ? 'text-emerald-400 font-semibold' : ''}>
                  {note}
                </div>
              ))}
            </pre>
          )}
        </div>

        {/* Explanation */}
        <div className="mt-5 text-sm text-muted-foreground space-y-2">
          <p><strong className="text-foreground">createSelector</strong>: draft(Proxy) 입력시 캐시 미스 가능</p>
          <p><strong className="text-foreground">createDraftSafeSelector</strong>: draft를 안전하게 처리하여 캐시 유지</p>
        </div>
      </CardContent>
    </Card>
  );
});
