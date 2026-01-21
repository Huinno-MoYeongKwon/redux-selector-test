import { createSlice, current } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { memoizedViaCreateSelector, memoizedViaDraftSafeSelector } from './selectors';

export interface Item {
  id: number;
  value: number;
}

export interface DraftProbeLog {
  lastRunAt: number;
  notes: string[];
}

export interface ItemsState {
  items: Item[];
  tick: number;
  filterEvenOnly: boolean;
  draftProbeLog: DraftProbeLog;
}

// 초기 200개 아이템 생성
const initialItems: Item[] = Array.from({ length: 200 }, (_, i) => ({
  id: i,
  value: i,
}));

const initialState: ItemsState = {
  items: initialItems,
  tick: 0,
  filterEvenOnly: false,
  draftProbeLog: {
    lastRunAt: 0,
    notes: [],
  },
};

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    // 배열 크기 변경
    setItemCount: (state, action: { payload: number }) => {
      const count = Math.max(1, Math.min(10000, action.payload)); // 1 ~ 10000 제한
      state.items = Array.from({ length: count }, (_, i) => ({
        id: i,
        value: i,
      }));
      console.log(`[setItemCount] items.length: ${state.items.length}`);
    },

    // tick += 1 (items는 변경하지 않음)
    bumpTick: (state) => {
      state.tick += 1;
      console.log(`[bumpTick] tick: ${state.tick}`);
    },

    // items[0].value += 1 (immer로 일부만 변경)
    mutateOneItem: (state) => {
      state.items[0].value += 1;
      console.log(`[mutateOneItem] items[0].value: ${state.items[0].value}`);
    },

    // filterEvenOnly 토글
    toggleFilter: (state) => {
      state.filterEvenOnly = !state.filterEvenOnly;
      console.log(`[toggleFilter] filterEvenOnly: ${state.filterEvenOnly}`);
    },

    // reducer 내부에서 selector를 "draft 상태를 대상으로" 호출해보고 결과를 기록
    runDraftProbe: (state) => {
      const notes: string[] = [];
      const now = Date.now();

      console.log('\n========== [runDraftProbe] 시작 ==========');
      console.log('Draft(Proxy) vs Plain Object에서 selector 캐시 동작 비교');

      // 테스트 1: 동일한 fakeRootState 객체로 반복 호출
      // (이 경우 둘 다 캐시 히트 가능)
      notes.push(`[${new Date(now).toLocaleTimeString()}] Draft Probe 실행`);
      notes.push('');
      notes.push('=== 테스트 1: 동일한 wrapper 객체로 반복 호출 ===');

      const fakeRootState1 = { items: state } as unknown as RootState;

      const out1a = memoizedViaCreateSelector(fakeRootState1);
      const out1b = memoizedViaCreateSelector(fakeRootState1);
      const out2a = memoizedViaDraftSafeSelector(fakeRootState1);
      const out2b = memoizedViaDraftSafeSelector(fakeRootState1);

      notes.push(`createSelector: 캐시 재사용 = ${out1a === out1b ? 'YES' : 'NO'}`);
      notes.push(`draftSafeSelector: 캐시 재사용 = ${out2a === out2b ? 'YES' : 'NO'}`);

      console.log('테스트 1 - 동일 wrapper:');
      console.log(`  createSelector 캐시: ${out1a === out1b}`);
      console.log(`  draftSafeSelector 캐시: ${out2a === out2b}`);

      // 테스트 2: 매번 새로운 wrapper 객체 생성
      // createSelector는 입력 참조가 달라지므로 캐시 미스 발생 가능
      notes.push('');
      notes.push('=== 테스트 2: 매번 새 wrapper 객체 생성 ===');

      const out3a = memoizedViaCreateSelector({ items: state } as unknown as RootState);
      const out3b = memoizedViaCreateSelector({ items: state } as unknown as RootState);
      const out4a = memoizedViaDraftSafeSelector({ items: state } as unknown as RootState);
      const out4b = memoizedViaDraftSafeSelector({ items: state } as unknown as RootState);

      notes.push(`createSelector: 캐시 재사용 = ${out3a === out3b ? 'YES' : 'NO'}`);
      notes.push(`draftSafeSelector: 캐시 재사용 = ${out4a === out4b ? 'YES' : 'NO'}`);

      console.log('테스트 2 - 새 wrapper:');
      console.log(`  createSelector 캐시: ${out3a === out3b}`);
      console.log(`  draftSafeSelector 캐시: ${out4a === out4b}`);

      // 테스트 3: current()로 draft를 plain object로 변환 후 비교
      notes.push('');
      notes.push('=== 테스트 3: current()로 plain object 변환 ===');

      const plainState = current(state);
      const fakeRootStatePlain = { items: plainState } as unknown as RootState;

      const out5a = memoizedViaCreateSelector(fakeRootStatePlain);
      const out5b = memoizedViaCreateSelector(fakeRootStatePlain);

      notes.push(`current() 사용 시 createSelector 캐시: ${out5a === out5b ? 'YES' : 'NO'}`);
      notes.push(`(draft를 plain으로 변환하면 일반적인 캐시 동작)`);

      console.log('테스트 3 - current() 사용:');
      console.log(`  createSelector 캐시: ${out5a === out5b}`);

      // 테스트 4: draft.items 참조 비교
      notes.push('');
      notes.push('=== 테스트 4: 참조 동일성 확인 ===');

      const itemsRef1 = state.items;
      const itemsRef2 = state.items;
      void plainState.items; // Used in comparison below

      notes.push(`draft.items === draft.items: ${itemsRef1 === itemsRef2 ? 'YES' : 'NO'}`);
      notes.push(`current(draft).items === current(draft).items: ${plainState.items === current(state).items ? 'YES' : 'NO'}`);

      console.log('테스트 4 - 참조 비교:');
      console.log(`  draft.items === draft.items: ${itemsRef1 === itemsRef2}`);
      console.log(`  current(draft).items 매번 호출: ${plainState.items === current(state).items}`);

      // 결론
      notes.push('');
      notes.push('=== 결론 ===');
      if (out3a !== out3b && out4a === out4b) {
        notes.push('createDraftSafeSelector는 draft에서 캐시 유지');
        notes.push('createSelector는 새 wrapper마다 캐시 미스');
      } else if (out3a === out3b && out4a === out4b) {
        notes.push('둘 다 캐시 유지됨');
        notes.push('(selector 입력이 동일 참조로 평가됨)');
      } else {
        notes.push('예상과 다른 결과 - 콘솔 로그 확인 필요');
      }

      console.log('\n========== [runDraftProbe] 종료 ==========\n');

      state.draftProbeLog = {
        lastRunAt: now,
        notes,
      };
    },
  },
});

export const { setItemCount, bumpTick, mutateOneItem, toggleFilter, runDraftProbe } = itemsSlice.actions;
export default itemsSlice.reducer;
