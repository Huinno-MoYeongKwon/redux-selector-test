import { useSelector, useStore } from 'react-redux';
import { useRef } from 'react';
import type { RootState } from '../app/store';

type EqualityFn<T> = (a: T, b: T) => boolean;

/**
 * 타이밍 측정이 포함된 useSelector
 *
 * 주의: useSelector 내부에서 selector가 여러 번 호출될 수 있으므로,
 * store에서 직접 state를 가져와 별도로 시간을 측정합니다.
 */
export function useTimedSelector<T>(
  selector: (state: RootState) => T,
  equalityFn?: EqualityFn<T>
): { value: T; selectorTimeUs: number } {
  const store = useStore<RootState>();
  const timeRef = useRef(0);

  // 실제 선택된 값 (리렌더 트리거용)
  const value = useSelector(selector, equalityFn);

  // 별도로 시간 측정 (store.getState()로 현재 상태 직접 접근)
  // 이 측정은 렌더링 중에 수행되지만, useSelector와 별개로 측정
  const state = store.getState();
  const start = performance.now();
  selector(state); // 순수하게 selector만 실행
  const end = performance.now();
  timeRef.current = (end - start) * 1000; // microseconds

  return { value, selectorTimeUs: timeRef.current };
}

/**
 * selector 실행 시간만 측정하는 유틸리티 함수
 * (벤치마크용)
 */
export function measureSelectorTime<T>(
  selector: (state: RootState) => T,
  state: RootState,
  iterations: number = 1
): { result: T; avgTimeUs: number; totalTimeMs: number } {
  const start = performance.now();
  let result: T;
  for (let i = 0; i < iterations; i++) {
    result = selector(state);
  }
  const end = performance.now();
  const totalTimeMs = end - start;

  return {
    result: result!,
    avgTimeUs: (totalTimeMs / iterations) * 1000,
    totalTimeMs,
  };
}
