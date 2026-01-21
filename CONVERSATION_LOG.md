# Redux Selector Test Project - 대화 기록

## 프로젝트 개요

**목적**: React + Redux Toolkit의 useSelector 동작을 실험하는 테스트용 프로젝트
- createSelector(메모이즈) vs shallowEqual(얕은 비교) vs 기본(===) 비교의 차이 재현
- createDraftSafeSelector가 immer draft(proxy)에서 어떤 차이를 만드는지 실험

**기술 스택**: Vite + React + TypeScript + Redux Toolkit + react-redux + pnpm

---

## 프로젝트 구조

```
src/
├── app/
│   └── store.ts                    # Redux store 설정
├── features/
│   └── items/
│       ├── itemsSlice.ts           # Redux slice (state, actions, reducers)
│       └── selectors.ts            # 다양한 selector 정의
├── components/
│   ├── Case1.tsx                   # 기본 배열 반환
│   ├── Case2.tsx                   # 가공 배열 (메모이즈 없음)
│   ├── Case3.tsx                   # 가공 배열 + shallowEqual
│   ├── Case4.tsx                   # createSelector 메모이즈
│   ├── Case5.tsx                   # createSelector + shallowEqual
│   ├── Case6.tsx                   # createDraftSafeSelector 실험
│   └── Case7.tsx                   # 벤치마크 컴포넌트
├── hooks/
│   └── useTimedSelector.ts         # 시간 측정 포함 useSelector
├── App.tsx
├── App.css
└── main.tsx
```

---

## State 설계

```typescript
interface ItemsState {
  items: { id: number; value: number }[];  // 초기 200개
  tick: number;                             // store 업데이트 트리거용
  filterEvenOnly: boolean;                  // 필터 토글
  draftProbeLog: {                          // Case 6 실험 결과
    lastRunAt: number;
    notes: string[];
  };
}
```

---

## Actions

| Action | 설명 |
|--------|------|
| `setItemCount(n)` | 배열 크기 변경 (1~10000) |
| `bumpTick()` | tick += 1 (items 불변) |
| `mutateOneItem()` | items[0].value += 1 |
| `toggleFilter()` | filterEvenOnly 토글 |
| `runDraftProbe()` | draft 상태에서 selector 실험 |

---

## Case별 테스트 설명

### Case 1: 기본 배열 반환
- **selector**: `(s) => s.items.items`
- **equalityFn**: 없음 (기본 ===)
- **예상**: bumpTick 시 리렌더 안됨 (참조 동일)

### Case 2: 가공 배열 (메모이즈 없음)
- **selector**: `items.filter(() => true)` - 매번 새 배열
- **equalityFn**: 없음
- **예상**: 모든 store 변경에 리렌더 (항상 새 참조)

### Case 3: 가공 배열 + shallowEqual
- **selector**: Case 2와 동일
- **equalityFn**: shallowEqual
- **예상**: bumpTick 시 리렌더 안됨 (내용 동일하면 방지)

### Case 4: createSelector 메모이즈
- **selector**: `createSelector([items, flag], ...filter)`
- **equalityFn**: 없음
- **예상**: 입력 동일하면 캐시 반환, bumpTick 시 리렌더 안됨

### Case 5: createSelector + shallowEqual
- **selector**: Case 4와 동일
- **equalityFn**: shallowEqual
- **예상**: 이중 보호 (메모이즈가 있으면 shallowEqual은 중복)

### Case 6: createDraftSafeSelector 실험
- reducer 내부에서 draft 상태로 selector 호출
- createSelector vs createDraftSafeSelector 캐시 동작 비교
- 테스트 항목:
  1. 동일 wrapper 객체로 반복 호출
  2. 매번 새 wrapper 객체 생성
  3. current()로 plain object 변환
  4. draft.items 참조 동일성 확인

### Case 7: 벤치마크
- 각 방식을 N번 반복 실행하여 평균 시간 측정
- 측정 항목:
  - 기본 selector (baseline)
  - filter selector (매번 새 배열)
  - createSelector 캐시 히트
  - createSelector 캐시 미스 (입력 변경)
  - shallowEqual (다른 참조)
  - shallowEqual (동일 참조)
  - === 참조 비교

---

## 예상 동작 표

| 버튼 | Case 1 | Case 2 | Case 3 | Case 4 | Case 5 |
|------|--------|--------|--------|--------|--------|
| bumpTick | 안됨 | **됨** | 안됨 | 안됨 | 안됨 |
| mutateOneItem | 됨 | 됨 | 됨 | 됨 | 됨 |
| toggleFilter | 됨 | 됨 | 됨 | 됨 | 됨 |

---

## UI 수치 의미

### Case 1-5 수치
| 수치 | 의미 |
|------|------|
| **Render** | 컴포넌트 렌더링 횟수 |
| **Time (μs)** | selector 함수 실행 시간 |
| **Length** | 선택된 배열의 요소 개수 |
| **[0].value** | 첫 번째 요소의 value 값 |

### Case 7 벤치마크 수치
| 항목 | 의미 |
|------|------|
| 기본 selector | 단순 참조 반환 (baseline) |
| filter selector | 매번 새 배열 생성 비용 |
| 캐시 히트 | 입력 동일 시 캐시 반환 (거의 0) |
| 캐시 미스 | 입력 변경 시 재계산 비용 |
| shallowEqual | 배열 크기에 비례하는 비교 비용 |

---

## 수정 이력

### 1. StrictMode 제거
- 문제: StrictMode가 개발 모드에서 컴포넌트를 2번씩 렌더링
- 해결: main.tsx에서 StrictMode 제거

### 2. React.memo 추가
- 문제: App 컴포넌트가 tick을 구독하여 자식 컴포넌트 전체 리렌더
- 해결: 모든 Case 컴포넌트를 memo()로 감싸기

### 3. 테스트 유효성 검증 및 수정

#### useTimedSelector 버그 수정
- **문제**: useSelector 내부에서 selector가 여러 번 호출될 수 있어 시간 측정 부정확
- **해결**: store.getState()로 직접 state 접근하여 별도로 시간 측정

#### Case 2/3 selector 외부로 이동
- **문제**: 컴포넌트 내부에서 selector 정의 시 매번 새 함수 생성
- **해결**: selectors.ts에 `unmemoizedFilteredItems` 정의

#### Case 7 벤치마크 수정
- **문제**: 캐시 미스 측정 시 selector를 매번 재생성 (잘못된 측정)
- **해결**: 입력을 실제로 변경하여 캐시 미스 발생시킴

#### Case 6 draft 실험 수정
- **문제**: fakeRootState를 한 번만 생성하고 재사용하여 캐시 차이 감지 어려움
- **해결**: 4가지 테스트로 분리
  1. 동일 wrapper 객체 반복 호출
  2. 매번 새 wrapper 객체 생성
  3. current()로 plain object 변환
  4. draft.items 참조 동일성 확인

### 4. 배열 크기 조절 기능 추가
- `setItemCount` action 추가
- UI에 배열 크기 입력 컨트롤 추가 (1~10000)

### 5. UI 시인성 개선
- 폰트 크기 증가 (제목 36px, 본문 16px, 수치 20px)
- 컨테이너 너비 1400px
- 패딩/간격 50% 증가
- 테두리 굵기 증가 (2~3px)
- stat-item 카드 형태로 변경

---

## 실행 방법

```bash
pnpm install
pnpm dev
# http://localhost:5173/ 에서 확인
```

---

## 핵심 관찰 포인트

1. **bumpTick 연타**: Case 2만 Render 증가 (다른 케이스는 최적화됨)
2. **배열 크기 변경**: Time 값 변화 관찰 (크기↑ → 비용↑)
3. **Case 4 vs Case 2**: 캐시 히트의 효과 (Time 차이)
4. **runDraftProbe**: createSelector vs createDraftSafeSelector 캐시 동작 비교

---

## 파일 요약

| 파일 | 역할 |
|------|------|
| `store.ts` | Redux store 설정, RootState/AppDispatch 타입 export |
| `itemsSlice.ts` | state, actions, reducers 정의, runDraftProbe 실험 로직 |
| `selectors.ts` | 다양한 selector 정의 (unmemoized, memoized, draftSafe) |
| `useTimedSelector.ts` | 시간 측정이 포함된 커스텀 useSelector |
| `Case1-5.tsx` | 리렌더 테스트 컴포넌트 |
| `Case6.tsx` | draftSafeSelector 실험 결과 표시 |
| `Case7.tsx` | 벤치마크 컴포넌트 |
| `App.tsx` | 메인 레이아웃, 컨트롤 버튼, 상태 표시 |
| `App.css` | 전체 스타일링 |

---

*마지막 업데이트: 2026-01-21*
