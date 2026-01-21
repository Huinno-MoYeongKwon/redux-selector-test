import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import type { ActionType } from "../features/items/itemsSlice";

type CaseType = 1 | 2 | 3 | 4 | 5;

interface RenderReasonBadgeProps {
  caseType: CaseType;
}

function getReasonForCase1(action: ActionType): string {
  switch (action) {
    case "bumpTick":
      return "❌ tick만 변경 → items 참조 불변 → 리렌더 스킵";
    case "mutateOneItem":
      return "🔄 items[0] 변경 → Immer가 items 배열 새로 생성 → 참조 변경 → 리렌더";
    case "toggleFilter":
      return "❌ filterEvenOnly만 변경 → items 참조 불변 → 리렌더 스킵";
    case "setItemCount":
      return "🔄 배열 크기 변경 → 새 배열 생성 → 리렌더";
    case "setItemMode":
      return "🔄 객체 모드 변경 → 전체 리셋 → 리렌더";
    default:
      return "";
  }
}

function getReasonForCase2(action: ActionType): string {
  switch (action) {
    case "bumpTick":
      return "⚠️ tick만 변경 → 하지만 filter()가 매번 새 배열 생성 → 불필요한 리렌더";
    case "mutateOneItem":
      return "🔄 items[0] 변경 + filter()가 새 배열 생성 → 리렌더";
    case "toggleFilter":
      return "🔄 filterEvenOnly 변경 → filter 결과 달라짐 + 새 배열 → 리렌더";
    case "setItemCount":
      return "🔄 배열 크기 변경 → 새 배열 생성 → 리렌더";
    case "setItemMode":
      return "🔄 객체 모드 변경 → 전체 리셋 → 리렌더";
    default:
      return "";
  }
}

function getReasonForCase3(action: ActionType): string {
  switch (action) {
    case "bumpTick":
      return "❌ tick만 변경 → 새 배열이지만 shallowEqual로 내용 비교 → 같으면 스킵";
    case "mutateOneItem":
      return "🔄 items[0] 변경 → shallowEqual 비교 시 내용 다름 → 리렌더";
    case "toggleFilter":
      return "🔄 filterEvenOnly 변경 → 필터 결과 달라짐 → 리렌더";
    case "setItemCount":
      return "🔄 배열 크기 변경 → shallowEqual 비교 시 길이 다름 → 리렌더";
    case "setItemMode":
      return "🔄 객체 모드 변경 → 전체 리셋 → 리렌더";
    default:
      return "";
  }
}

function getReasonForCase4(action: ActionType): string {
  switch (action) {
    case "bumpTick":
      return "❌ tick만 변경 → createSelector 입력(items, filterEvenOnly) 불변 → 캐시 반환 → 스킵";
    case "mutateOneItem":
      return "🔄 items 참조 변경 → createSelector 입력 변경 → 재계산 → 리렌더";
    case "toggleFilter":
      return "🔄 filterEvenOnly 변경 → createSelector 입력 변경 → 재계산 → 리렌더";
    case "setItemCount":
      return "🔄 items 참조 변경 → createSelector 입력 변경 → 재계산 → 리렌더";
    case "setItemMode":
      return "🔄 객체 모드 변경 → 전체 리셋 → 리렌더";
    default:
      return "";
  }
}

function getReasonForCase5(action: ActionType): string {
  switch (action) {
    case "bumpTick":
      return "❌ tick만 변경 → createSelector 캐시 + shallowEqual 이중 보호 → 스킵";
    case "mutateOneItem":
      return "🔄 items 변경 → createSelector 재계산 → 새 결과 → 리렌더";
    case "toggleFilter":
      return "🔄 filterEvenOnly 변경 → createSelector 재계산 → 리렌더";
    case "setItemCount":
      return "🔄 items 변경 → createSelector 재계산 → 새 결과 → 리렌더";
    case "setItemMode":
      return "🔄 객체 모드 변경 → 전체 리셋 → 리렌더";
    default:
      return "";
  }
}

function getReason(caseType: CaseType, action: ActionType): string {
  switch (caseType) {
    case 1:
      return getReasonForCase1(action);
    case 2:
      return getReasonForCase2(action);
    case 3:
      return getReasonForCase3(action);
    case 4:
      return getReasonForCase4(action);
    case 5:
      return getReasonForCase5(action);
    default:
      return "";
  }
}

export function RenderReasonBadge({ caseType }: RenderReasonBadgeProps) {
  const lastAction = useSelector((state: RootState) => state.items.lastAction);

  const reason = getReason(caseType, lastAction);

  if (!reason) return null;

  return (
    <div className="text-base text-muted-foreground bg-muted/30 rounded px-3 py-2">
      {reason}
    </div>
  );
}
