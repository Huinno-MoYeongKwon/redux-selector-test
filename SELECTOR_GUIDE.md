# Redux Selector 최적화 완벽 가이드

> **언제, 어떤 형태의 selector와 동등성 비교 함수를 사용해야 할까?**

이 가이드는 **실제 테스트 코드로 검증된 실험 결과**를 바탕으로, Redux Toolkit의 `useSelector`를 효율적으로 사용하는 방법을 정리합니다.

> 📅 **마지막 테스트**: 2026. 1. 22. 오후 6:50:15
> ✅ **테스트 결과**: 8개 통과 (16.39s)

---

## 목차

1. [핵심 개념 deep dive](#1-핵심-개념-deep-dive)
2. [실험 환경](#2-실험-환경)
3. [실험 결과: 리렌더링 패턴](#3-실험-결과-리렌더링-패턴)
4. [실험 결과: 성능 측정](#4-실험-결과-성능-측정)
5. [시나리오별 권장 패턴](#5-시나리오별-권장-패턴)
6. [안티패턴과 주의사항](#6-안티패턴과-주의사항)
7. [디버깅과 테스트](#7-디버깅과-테스트)
8. [결론](#8-결론)

---

## 1. 핵심 개념 deep dive

### 1.1 useSelector의 동작 원리

```typescript
const value = useSelector(selector, equalityFn?)
```

useSelector는 Redux store의 상태를 React 컴포넌트에서 읽어오는 훅입니다.

**내부 동작 (의사 코드):**

```typescript
function useSelector(selector, equalityFn = (a, b) => a === b) {
  const store = useStore()
  const [, forceRender] = useReducer(c => c + 1, 0)

  useEffect(() => {
    return store.subscribe(() => {
      const newResult = selector(store.getState())
      if (!equalityFn(prevResult, newResult)) {
        forceRender()  // 다르면 리렌더
      }
      prevResult = newResult
    })
  }, [])

  return selector(store.getState())
}
```

**핵심 포인트:**
1. Store가 업데이트될 때마다 **selector 함수가 실행**됨
2. **equalityFn**으로 이전 결과와 비교
3. 다르면 리렌더, 같으면 스킵

---

### 1.2 equalityFn (동등성 비교 함수)

`equalityFn`은 이전 selector 결과와 새 결과를 비교하여 **리렌더 여부를 결정**합니다.

| 반환값 | 의미 | 결과 |
|--------|------|------|
| `true` | 이전과 같음 | 리렌더 **안 함** |
| `false` | 이전과 다름 | 리렌더 **함** |

**equalityFn을 생략하면?**

기본값은 `===` (strict equality, 참조 비교)입니다.

```typescript
// 이 두 코드는 동일
useSelector(selector)
useSelector(selector, (a, b) => a === b)
```

**문제 상황**: `filter()`, `map()` 등이 매번 새 배열을 생성하면 **항상 다른 참조** → 불필요한 리렌더

```typescript
// ❌ 매번 새 배열 = 매번 다른 참조 = 매번 리렌더
const items = useSelector(state => state.items.filter(i => i.active))
```

---

### 1.3 동등성 비교 방식 비교

| 비교 방식 | 동작 | 비용 | 특징 |
|-----------|------|------|------|
| **기본 비교 (===)** | 참조 비교 | O(1) | 가장 빠름, 새 객체/배열은 항상 다름 |
| **shallowEqual** | 1단계 깊이까지 값 비교 | O(n) | 리렌더 방지, selector는 매번 실행 |
| **createSelector** | 입력 변경 시에만 재계산 | O(1)/O(n) | selector 실행 자체를 방지 |

---

### 1.4 createSelector 심층 분석

Redux Toolkit이 **Reselect** 라이브러리를 re-export한 것입니다.

```typescript
import { createSelector } from '@reduxjs/toolkit'
// 또는
import { createSelector } from 'reselect'
```

**핵심 특징:**
- 입력(dependencies)이 변경되지 않으면 **이전 결과를 즉시 반환**
- **selector 함수 자체가 실행되지 않음** (shallowEqual과의 핵심 차이!)
- 기본적으로 **1개의 캐시 슬롯**만 유지

```typescript
const selectActiveItems = createSelector(
  // 입력 selectors (dependencies)
  [state => state.items],
  // 결과 함수 (입력이 변경될 때만 실행)
  items => {
    console.log('실행됨!')  // 입력 변경 시에만 출력
    return items.filter(i => i.active)
  }
)
```

**shallowEqual과의 차이:**

```typescript
// shallowEqual: selector는 매번 실행, 결과만 비교
useSelector(state => {
  console.log('매번 실행!')  // Store 업데이트마다 출력
  return state.items.filter(i => i.active)
}, shallowEqual)

// createSelector: 입력 불변 시 selector 자체가 실행 안 됨
useSelector(selectActiveItems)  // 입력 변경 시에만 내부 함수 실행
```

---

### 1.5 캐시 저장 위치

createSelector의 캐시는 **selector 함수 인스턴스 내부 (클로저)**에 저장됩니다.

```typescript
const selectFiltered = createSelector(
  [state => state.items],
  items => items.filter(...)
)

// selectFiltered 함수 객체 내부에 저장:
// - lastArgs: 마지막 입력값들
// - lastResult: 마지막 결과값
```

**중요한 특징:**

| 특징 | 설명 |
|------|------|
| **인스턴스별 독립 캐시** | 각 selector 인스턴스마다 별도의 캐시 |
| **1개 슬롯 캐시** | 가장 최근 결과만 저장 (LRU 아님) |
| **컴포넌트 외부 정의 필수** | 내부 정의 시 매 렌더마다 새 인스턴스 생성 |

```typescript
// ❌ 컴포넌트 내부 - 매번 새 selector = 캐시 무효화
function Component() {
  const selector = createSelector(...)  // 매 렌더마다 새 인스턴스!
  const items = useSelector(selector)
}

// ✅ 컴포넌트 외부 - 캐시 유지
const selector = createSelector(...)

function Component() {
  const items = useSelector(selector)  // 동일 인스턴스 사용
}
```

---

## 2. 실험 환경

### 테스트 스택

| 항목 | 버전/도구 |
|------|-----------|
| React | 19.2.0 |
| Redux Toolkit | 2.11.2 |
| react-redux | 9.2.0 |
| 테스트 도구 | Vitest + React Testing Library |

### 테스트 구성

| 항목 | 값 |
|------|-----|
| 리렌더 테스트 반복 | **1,000회** |
| 성능 측정 반복 | **10,000회** |
| 테스트 배열 크기 | 100, 500, 1,000, 2,000, 5,000, 10,000개 |
| 객체 복잡도 | simple, medium, deep |

### 테스트한 Selector 패턴

| Case | 패턴 | 설명 |
|------|------|------|
| Case 1 | `state => state.items.items` | Store 직접 반환 + 기본 비교 |
| Case 2 | `state => state.items.items.filter(...)` | 가공 배열 + 기본 비교 (===) |
| Case 3 | `filter(...) + shallowEqual` | 가공 배열 + 얕은 비교 |
| Case 4 | `createSelector([...], ...)` | 메모이즈된 selector |
| Case 5 | `createSelector + shallowEqual` | 이중 보호 (불필요) |

---

## 3. 실험 결과: 리렌더링 패턴

### 실험: bumpTick 1,000회 연속 호출

`bumpTick`은 `state.items.tick`만 변경하고 `items` 배열은 건드리지 않습니다.
**최적화된 selector는 이 액션에 리렌더되지 않아야 합니다.**

| Case | 패턴 | 추가 리렌더 | 결과 |
|------|------|-------------|------|
| Case 1 | 기본 비교 | **0회** | ✅ 정상 |
| Case 2 | filter + === | **1000회** | ❌ 문제! |
| Case 3 | filter + shallowEqual | **0회** | ✅ 정상 |
| Case 4 | createSelector | **0회** | ✅ 정상 |

**핵심 발견**: Case 2는 `filter()`가 매번 새 배열을 생성하여 **1,000회 불필요한 리렌더** 발생

### 리렌더 패턴 요약

```
┌─────────────────────────────────────────────────────────────┐
│ 패턴                    │ bumpTick │ mutateOne │ 권장도    │
├─────────────────────────────────────────────────────────────┤
│ Case 1: 기본 비교       │ ❌ 안됨   │ ✅ 됨     │ ⭐⭐⭐   │
│ Case 2: filter + ===    │ ✅ 됨    │ ✅ 됨     │ ❌ 금지   │
│ Case 3: filter + shallow│ ❌ 안됨   │ ✅ 됨     │ ⭐⭐     │
│ Case 4: createSelector  │ ❌ 안됨   │ ✅ 됨     │ ⭐⭐⭐⭐⭐ │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 실험 결과: 성능 측정

### filter vs createSelector 성능 비교 (10,000회 호출)

| 배열 크기 | filter() | createSelector | 성능 개선 |
|-----------|----------|----------------|-----------|
| 100개 | 41.77ms | 1.08ms | **97.40% 절감** |
| 500개 | 198.94ms | 0.67ms | **99.66% 절감** |
| 1,000개 | 394.24ms | 0.62ms | **99.84% 절감** |
| 2,000개 | 816.20ms | 0.52ms | **99.94% 절감** |
| 5,000개 | 1978.44ms | 0.57ms | **99.97% 절감** |
| 10,000개 | 4048.91ms | 0.55ms | **99.99% 절감** |

**핵심 발견**: createSelector는 배열 크기와 무관하게 일정한 성능 (캐시 히트 시)

### 성능 시각화

```
filter() 실행 시간 (10,000회, 배열 크기별)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   100개 █ 41.77ms
   500개 ██ 198.94ms
  1000개 █████ 394.24ms
  2000개 ██████████ 816.20ms
  5000개 ████████████████████████ 1978.44ms
 10000개 ██████████████████████████████████████████████████ 4048.91ms

createSelector 실행 시간 (캐시 히트)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
모든 크기 █ ~0.5ms (캐시 히트)
```

---

## 5. 시나리오별 권장 패턴

### 시나리오 1: Store에서 직접 값 가져오기

**상황**: `state.user.name`처럼 Store의 값을 그대로 가져올 때

```typescript
// ✅ 권장: 기본 비교로 충분
const userName = useSelector(state => state.user.name)
const items = useSelector(state => state.items.items)
```

---

### 시나리오 2: 배열 필터링/변환

**상황**: 배열에서 조건에 맞는 항목만 가져올 때

```typescript
// ❌ 최악의 패턴: 매번 새 배열 생성, 매번 리렌더
const activeItems = useSelector(
  state => state.items.filter(item => item.active)
)

// ✅ 권장: createSelector로 완전한 메모이제이션
const selectActiveItems = createSelector(
  [state => state.items],
  items => items.filter(item => item.active)
)
const activeItems = useSelector(selectActiveItems)
```

---

### 시나리오 3: 여러 값을 객체로 묶어서 가져오기

```typescript
// ❌ 안티패턴: 매번 새 객체 생성
const user = useSelector(state => ({
  name: state.user.name,
  email: state.user.email
}))

// ✅ 해결책 1: 개별 useSelector (권장)
const name = useSelector(state => state.user.name)
const email = useSelector(state => state.user.email)

// ✅ 해결책 2: createSelector
const selectUserInfo = createSelector(
  [state => state.user.name, state => state.user.email],
  (name, email) => ({ name, email })
)
```

---

### 시나리오 4: shallowEqual 사용 시점

**react-redux**에서 제공하는 `shallowEqual`은 **임시 방편**으로만 사용하세요.

```typescript
import { shallowEqual, useSelector } from 'react-redux'

// ⚠️ 차선책: 리렌더는 방지하지만 filter는 매번 실행
const items = useSelector(
  state => state.items.filter(i => i.active),
  shallowEqual
)
```

**적절한 사용 시점:**

| 상황 | 권장 |
|------|------|
| 외부 라이브러리의 selector를 최적화할 수 없을 때 | ⚠️ 임시 방편 |
| createSelector를 도입하기 어려운 레거시 코드 | ⚠️ 임시 방편 |
| 새로운 코드 작성 | ❌ createSelector 권장 |

---

### 시나리오 5: 파라미터가 있는 selector

```typescript
function ItemDetail({ itemId }: { itemId: number }) {
  // ✅ useMemo로 selector 인스턴스 메모이즈
  const selectItemById = useMemo(
    () => createSelector(
      [state => state.items],
      items => items.find(item => item.id === itemId)
    ),
    [itemId]  // itemId가 변경될 때만 새 selector 생성
  )

  const item = useSelector(selectItemById)
  return <div>{item?.name}</div>
}
```

**주의**: useMemo 없이 사용하면 매 렌더마다 새 selector가 생성되어 캐시가 무효화됩니다.

---

## 6. 안티패턴과 주의사항

### ❌ 안티패턴 1: 인라인 객체/배열 생성

```typescript
// 매번 새 배열 생성 → 매번 리렌더
const items = useSelector(state =>
  state.items.filter(i => i.active)
  // 1000회 bumpTick = 1000회 불필요한 리렌더!
)
```

---

### ❌ 안티패턴 2: createSelector + shallowEqual 이중 사용

```typescript
// ❌ 불필요한 중복 - createSelector만으로 충분
const items = useSelector(memoizedSelector, shallowEqual)

// ✅ 이것만으로 충분
const items = useSelector(memoizedSelector)
```

**이유**: createSelector는 입력이 같으면 **동일한 참조**를 반환하므로 `===`로 충분합니다.

---

### ❌ 안티패턴 3: 컴포넌트 내부에서 selector 정의

```typescript
function Component() {
  // ❌ 매 렌더마다 새 selector 생성 → 캐시 무효화
  const selectItems = createSelector(
    [state => state.items],
    items => items.filter(i => i.active)
  )
  const items = useSelector(selectItems)
}

// ✅ 컴포넌트 외부에 정의
const selectActiveItems = createSelector([...], ...)

function Component() {
  const items = useSelector(selectActiveItems)
}
```

---

### ❌ 안티패턴 4: selector 내 무거운 연산

Selector는 **동기적으로 메인 스레드**에서 실행됩니다.

```typescript
// ❌ 위험: 캐시 미스 시 UI 블로킹
const selectExpensive = createSelector(
  [state => state.items],
  items => items.map(item => veryHeavyComputation(item))
)
```

**해결책:**

| 방법 | 설명 |
|------|------|
| **서버에서 사전 계산** | API 응답에 계산된 값 포함 |
| **Web Worker** | 별도 스레드에서 계산 |
| **useDeferredValue** | React 18+에서 낮은 우선순위로 처리 |
| **가상화** | 화면에 보이는 항목만 계산 |

---

## 7. 디버깅과 테스트

createSelector가 반환하는 selector 함수에는 **디버깅용 메서드**가 포함되어 있습니다.

### 사용 가능한 메서드

```typescript
const selectFiltered = createSelector(
  [state => state.items],
  items => items.filter(i => i.active)
)

selectFiltered.recomputations()        // resultFunc 재계산 횟수
selectFiltered.resetRecomputations()   // 카운터 리셋
selectFiltered.lastResult()            // 마지막 캐시된 결과
selectFiltered.resultFunc              // 원본 결과 함수
selectFiltered.dependencies            // 입력 selector 배열
```

### 활용 예시 1: 테스트에서 메모이제이션 검증

```typescript
it('입력이 같으면 재계산하지 않는다', () => {
  const state = { items: [{ id: 1, active: true }] }

  selectFiltered.resetRecomputations()

  selectFiltered(state)
  selectFiltered(state)
  selectFiltered(state)

  // 3번 호출했지만 1번만 계산됨
  expect(selectFiltered.recomputations()).toBe(1)
})
```

### 활용 예시 2: 개발 환경에서 성능 모니터링

```typescript
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const count = selectFiltered.recomputations()
    if (count > 100) {
      console.warn(`⚠️ selectFiltered ${count}번 재계산됨!`)
    }
  }, 5000)
}
```

### 활용 예시 3: resultFunc으로 순수 로직 테스트

```typescript
it('active 항목만 필터링한다', () => {
  const items = [
    { id: 1, active: true },
    { id: 2, active: false },
  ]

  // selector가 아닌 순수 함수로 테스트
  const result = selectFiltered.resultFunc(items)

  expect(result).toHaveLength(1)
  expect(result[0].id).toBe(1)
})
```

### 고급: 캐시 크기 늘리기

기본적으로 1개 슬롯만 캐시하지만, **Reselect v5+**에서 확장 가능합니다.

```typescript
import { createSelectorCreator, lruMemoize } from 'reselect'

const createLruSelector = createSelectorCreator({
  memoize: lruMemoize,
  memoizeOptions: { maxSize: 10 },  // 최대 10개 결과 캐시
})

const selectItemById = createLruSelector(
  [state => state.items, (_, id: number) => id],
  (items, id) => items.find(item => item.id === id)
)
```

---

## 8. 결론

### 의사결정 플로우차트

```
selector 선택 가이드
       │
       ▼
┌─────────────────────────────────────┐
│ Store에서 값을 직접 가져오나요?      │
└─────────────────────────────────────┘
       │
       ├─ Yes ──▶ ✅ 기본 비교 (===)
       │
       ▼ No
┌─────────────────────────────────────┐
│ 새로운 배열/객체를 생성하나요?       │
│ (filter, map, reduce, spread 등)   │
└─────────────────────────────────────┘
       │
       ├─ No ──▶ ✅ 기본 비교 (===)
       │
       ▼ Yes
       │
       ▶ ✅ createSelector 사용
```

### 한 줄 요약

| 상황 | 권장 방법 | 실험 근거 |
|------|----------|-----------|
| Store 직접 반환 | 기본 비교 | 1,000회 중 리렌더 0회 |
| 파생 데이터 | **createSelector** | 99%+ 성능 개선 |
| 레거시 최적화 | shallowEqual | 리렌더 방지, 비용 발생 |
| filter + === | **절대 금지** | 1,000회 불필요한 리렌더 |

### 핵심 3줄 요약

1. **파생 데이터는 반드시 createSelector** - 99%+ 성능 개선
2. **shallowEqual은 임시 방편** - createSelector가 더 효율적
3. **selector는 컴포넌트 외부에 정의** - 캐시 유지를 위해 필수

---

## 테스트 실행 방법

```bash
# 테스트 실행 및 문서 자동 생성
pnpm generate-docs

# Vitest 단위 테스트만 실행
pnpm test:run

# 개발 서버 실행 후 직접 테스트
pnpm dev
```

---

*이 가이드는 Vitest + React Testing Library로 검증된 실험 결과를 바탕으로 작성되었습니다.*
*테스트 코드: `src/test/selector-patterns.test.tsx`*
*자동 생성: `pnpm generate-docs`*
