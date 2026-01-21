import { createSelector, createDraftSafeSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

// 기본 selectors
export const selectItems = (state: RootState) => state.items.items;
export const selectFilterEvenOnly = (state: RootState) => state.items.filterEvenOnly;
export const selectTick = (state: RootState) => state.items.tick;
export const selectDraftProbeLog = (state: RootState) => state.items.draftProbeLog;

// Case 2/3용: 가공 배열 반환 (메모이즈 없음)
// 매번 새 배열을 생성하여 === 비교 시 항상 다르게 됨
export const unmemoizedFilteredItems = (state: RootState) => {
  const { items, filterEvenOnly } = state.items;
  // filterEvenOnly가 false여도 filter()로 새 배열 생성
  if (!filterEvenOnly) {
    return items.filter(() => true); // 항상 새 배열
  }
  return items.filter((item) => item.value % 2 === 0);
};

// Case 4/5용: createSelector로 메모이즈된 가공 배열
export const memoizedFilteredItems = createSelector(
  [selectItems, selectFilterEvenOnly],
  (items, filterEvenOnly) => {
    console.log('[memoizedFilteredItems] selector 실행됨');
    if (!filterEvenOnly) return items;
    return items.filter((item) => item.value % 2 === 0);
  }
);

// Case 6용: createSelector vs createDraftSafeSelector 비교
// 둘 다 동일한 파생 결과를 만드는 selector

// createSelector 버전 (draft-unsafe)
export const memoizedViaCreateSelector = createSelector(
  [(state: RootState) => state.items.items, (state: RootState) => state.items.filterEvenOnly],
  (items, filterEvenOnly) => {
    console.log('[memoizedViaCreateSelector] selector 실행됨');
    if (!filterEvenOnly) return items;
    return items.filter((item) => item.value % 2 === 0);
  }
);

// createDraftSafeSelector 버전 (draft-safe)
export const memoizedViaDraftSafeSelector = createDraftSafeSelector(
  [(state: RootState) => state.items.items, (state: RootState) => state.items.filterEvenOnly],
  (items, filterEvenOnly) => {
    console.log('[memoizedViaDraftSafeSelector] selector 실행됨');
    if (!filterEvenOnly) return items;
    return items.filter((item) => item.value % 2 === 0);
  }
);
