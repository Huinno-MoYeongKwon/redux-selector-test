# Redux Selector Test - 맥락 백업 (v2)

## 프로젝트 개요

Redux selector의 리렌더링 동작을 테스트하고 시각화하는 프로젝트

---

## 완료된 작업

### 1. UI 디자인 리뉴얼

- **테마**: 다크 모드 기본, 모던한 색상 팔레트
- **레이아웃**: 2열 그리드 (좌: Case 1-5, 우: Case 6 + 요약 테이블)
- **여백 축소**: 컴팩트한 디자인
- **폰트 크기**: `text-lg` (18px) 기본, `text-xl` (20px) 제목

### 2. 셀렉터 코드 스니펫 추가

각 Case에 해당 셀렉터가 어떻게 구성되어 있는지 코드 블록으로 표시

### 3. toggleFilter 직관성 개선

- 버튼: `짝수만 보기` / `전체 보기` (동적)
- 상태: `보기: 짝수만/전체`

### 4. 리렌더 사유 표시 기능 (RenderReasonBadge)

- `lastAction`을 useSelector로 구독하는 별도 컴포넌트
- 리렌더링 여부와 관계없이 항상 사유 표시
- 리렌더 스킵된 경우에도 "스킵됨" 메시지 표시

**사유 아이콘:**

- 🔄 = 리렌더가 발생해야 하는 상황
- ❌ = 리렌더가 스킵되어야 하는 상황
- ⚠️ = 예상 외로 리렌더가 발생한 상황

### 5. Case 6 (createDraftSafeSelector) 제거

- 설명하기 모호하여 제거
- 기존 Case 7 (벤치마크) → Case 6으로 변경

### 6. 객체 복잡도 모드 추가 (ItemMode)

3가지 모드로 테스트 가능:

**Simple (2 fields)**

```ts
{ id, value }
```

**Medium (~15 fields)**

```ts
{
  id, value, name, description, status, priority,
  metadata: {
    created, updated, version, author,
    tags[], categories[],
    permissions: { read, write, delete, admin }
  }
}
```

**Deep (~50+ fields, 6 depth)**

```ts
{
  // Medium 필드들 +
  analytics: {
    views, clicks, shares, rating,
    engagement: { likes, comments, bookmarks },
    history: [{ date, action, userId }]
  },
  config: {
    settings: {
      theme, language, timezone,
      notifications: { email, push, sms, frequency },
      privacy: { public, searchable, showActivity }
    },
    features[], limits: { maxStorage, maxRequests, rateLimit }
  },
  nested: {
    level1 → level2 → level3 → level4 → level5 → level6: {
      data, count, finalPayload: { secret, timestamp, checksum }
    }
  },
  relationships: {
    parent, children[], siblings[], references[]
  }
}
```

**모드 변경 시 리셋:**

- items 배열 재생성
- tick → 0
- filterEvenOnly → false
- Case 컴포넌트 리마운트 (key prop) → renderCount → 1

### 7. UI 레이블 개선

- `Time` → `실행시간`
- 설명: `실행시간 = useSelector 내부 함수 실행 시간 (μs, 1ms = 1,000μs)`

---

## 주요 파일 구조

```
src/
├── app/
│   └── store.ts
├── features/items/
│   ├── itemsSlice.ts      # Item, ItemMode, ActionType, reducers
│   └── selectors.ts       # selectItems, memoizedFilteredItems 등
├── components/
│   ├── Case1.tsx          # 기본 배열 반환
│   ├── Case2.tsx          # 가공 배열 (메모이즈 X)
│   ├── Case3.tsx          # 가공 배열 + shallowEqual
│   ├── Case4.tsx          # createSelector
│   ├── Case5.tsx          # createSelector + shallowEqual
│   ├── Case6.tsx          # 벤치마크
│   ├── RenderReasonBadge.tsx  # 리렌더 사유 표시
│   ├── ThemeToggle.tsx
│   └── ui/                # Card, Button, Badge, Input, StatItem
├── hooks/
│   └── useTimedSelector.ts  # selector 실행 시간 측정
├── contexts/
│   └── ThemeContext.tsx
└── App.tsx
```

---

## 리렌더 동작 요약

| Action        | Case 1 | Case 2 | Case 3 | Case 4 | Case 5 |
| ------------- | ------ | ------ | ------ | ------ | ------ |
| bumpTick      | -      | O      | -      | -      | -      |
| mutateOneItem | O      | O      | O      | O      | O      |
| 필터 토글    | -      | O      | O      | O      | O      |

- **O** = 리렌더 발생
- **-** = 리렌더 스킵

---

## 각 Case 특징

1. **Case 1**: 기본 배열 반환 - items 참조 변경 시에만 리렌더
2. **Case 2**: 매번 새 배열 - 모든 액션에서 리렌더 (비효율)
3. **Case 3**: shallowEqual - 내용 같으면 스킵
4. **Case 4**: createSelector - 입력 동일시 캐시 반환
5. **Case 5**: createSelector + shallowEqual - 이중 보호
6. **Case 6**: 벤치마크 - 각 방식의 실행 시간 비교

---

## ActionType

```ts
type ActionType =
  | "none"
  | "setItemCount"
  | "setItemMode"
  | "bumpTick"
  | "mutateOneItem"
  | "toggleFilter";
```

---

## 핵심 코드 조각

### itemsSlice.ts - setItemMode

```ts
setItemMode: (state, action: { payload: ItemMode }) => {
  const newMode = action.payload;
  const count = state.items.length;
  state.itemMode = newMode;
  state.items = createItems(count, newMode);
  state.tick = 0;
  state.filterEvenOnly = false;
  state.lastAction = 'setItemMode';
}
```

### RenderReasonBadge.tsx

```tsx
export function RenderReasonBadge({ caseType }: { caseType: 1 | 2 | 3 | 4 | 5 }) {
  const lastAction = useSelector((state: RootState) => state.items.lastAction);
  const reason = getReason(caseType, lastAction);
  if (!reason) return null;
  return <div className="...">{reason}</div>;
}
```

### App.tsx - 모드 변경 시 리마운트

```tsx
<Case1 key={`case1-${itemMode}`} />
<Case2 key={`case2-${itemMode}`} />
// ...
```

---

## 다음 작업 가능 항목

- 더 상세한 벤치마크 결과 시각화
- 애니메이션 효과 추가
- 모바일 반응형 개선
- 실행시간 그래프/차트 추가
