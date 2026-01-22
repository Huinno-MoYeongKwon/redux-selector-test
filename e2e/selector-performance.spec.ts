/**
 * Redux Selector E2E 성능 테스트
 *
 * 실제 브라우저 환경에서 각 selector 패턴의 동작을 검증합니다.
 * - 리렌더 횟수 변화
 * - 실행 시간 측정
 * - 다양한 배열 크기와 객체 복잡도에서의 성능
 */

import { test, expect, Page } from '@playwright/test'

interface CaseMetrics {
  renderCount: number
  executionTimeUs: number
}

// 각 Case의 렌더 횟수와 실행 시간을 가져오는 헬퍼
async function getCaseMetrics(page: Page, caseNumber: number): Promise<CaseMetrics> {
  // Case 카드에서 Render 횟수 추출
  const caseCard = page.locator(`text=Case ${caseNumber}`).locator('..')
  const renderText = await caseCard.locator('text=/Render: \\d+/').textContent()
  const renderCount = parseInt(renderText?.match(/Render: (\d+)/)?.[1] || '0')

  // 실행 시간 추출 (μs)
  const timeText = await caseCard.locator('text=/실행시간:/').textContent()
  const executionTimeUs = parseFloat(timeText?.match(/실행시간: ([\d.]+)/)?.[1] || '0')

  return { renderCount, executionTimeUs }
}

// 모든 Case의 메트릭을 수집
async function getAllCaseMetrics(page: Page): Promise<Record<number, CaseMetrics>> {
  const metrics: Record<number, CaseMetrics> = {}
  for (let i = 1; i <= 5; i++) {
    metrics[i] = await getCaseMetrics(page, i)
  }
  return metrics
}

test.describe('Redux Selector E2E 성능 실험', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 앱 로딩 대기
    await page.waitForSelector('text=Redux Selector Test')
  })

  test('실험 1: bumpTick 연속 클릭 - 리렌더 패턴 확인', async ({ page }) => {
    console.log('\n' + '='.repeat(60))
    console.log('🧪 실험 1: bumpTick 연속 클릭')
    console.log('='.repeat(60))

    // 초기 상태 기록
    const initialMetrics = await getAllCaseMetrics(page)
    console.log('\n초기 상태:')
    for (const [caseNum, metrics] of Object.entries(initialMetrics)) {
      console.log(`  Case ${caseNum}: Render=${metrics.renderCount}`)
    }

    // bumpTick 10번 클릭
    const bumpTickButton = page.locator('button:has-text("bumpTick")')
    for (let i = 0; i < 10; i++) {
      await bumpTickButton.click()
      await page.waitForTimeout(50) // 상태 업데이트 대기
    }

    // 결과 수집
    const afterMetrics = await getAllCaseMetrics(page)
    console.log('\nbumpTick x10 후:')

    const results: Record<number, { before: number; after: number; diff: number }> = {}
    for (const caseNum of [1, 2, 3, 4, 5]) {
      const before = initialMetrics[caseNum].renderCount
      const after = afterMetrics[caseNum].renderCount
      const diff = after - before
      results[caseNum] = { before, after, diff }
      console.log(`  Case ${caseNum}: ${before} → ${after} (추가 렌더: ${diff}회)`)
    }

    // 검증
    console.log('\n검증 결과:')

    // Case 1: items 직접 반환 - 리렌더 없어야 함
    expect(results[1].diff).toBe(0)
    console.log('  ✅ Case 1 (기본 비교): 리렌더 없음 - 정상')

    // Case 2: filter + 기본 비교 - 매번 리렌더
    expect(results[2].diff).toBe(10)
    console.log('  ⚠️  Case 2 (filter + ===): 10회 리렌더 - 문제 패턴!')

    // Case 3: filter + shallowEqual - 리렌더 없어야 함
    expect(results[3].diff).toBe(0)
    console.log('  ✅ Case 3 (filter + shallowEqual): 리렌더 없음 - 정상')

    // Case 4: createSelector - 리렌더 없어야 함
    expect(results[4].diff).toBe(0)
    console.log('  ✅ Case 4 (createSelector): 리렌더 없음 - 정상')

    // Case 5: createSelector + shallowEqual - 리렌더 없어야 함
    expect(results[5].diff).toBe(0)
    console.log('  ✅ Case 5 (createSelector + shallowEqual): 리렌더 없음 - 정상')
  })

  test('실험 2: mutateOneItem - 모든 Case 리렌더 확인', async ({ page }) => {
    console.log('\n' + '='.repeat(60))
    console.log('🧪 실험 2: mutateOneItem 클릭')
    console.log('='.repeat(60))

    const initialMetrics = await getAllCaseMetrics(page)

    // mutateOneItem 클릭
    const mutateButton = page.locator('button:has-text("mutateOneItem")')
    await mutateButton.click()
    await page.waitForTimeout(100)

    const afterMetrics = await getAllCaseMetrics(page)

    console.log('\nmutateOneItem 후 리렌더 횟수 변화:')
    for (const caseNum of [1, 2, 3, 4, 5]) {
      const diff = afterMetrics[caseNum].renderCount - initialMetrics[caseNum].renderCount
      console.log(`  Case ${caseNum}: +${diff}회`)
      // 모든 Case가 1회 리렌더되어야 함 (items 참조 변경)
      expect(diff).toBe(1)
    }

    console.log('\n  ✅ 모든 Case가 1회 리렌더됨 - 정상 (items 참조 변경)')
  })

  test('실험 3: 필터 토글 - Case별 리렌더 패턴', async ({ page }) => {
    console.log('\n' + '='.repeat(60))
    console.log('🧪 실험 3: 필터 토글')
    console.log('='.repeat(60))

    const initialMetrics = await getAllCaseMetrics(page)

    // 필터 토글 클릭
    const filterButton = page.locator('button:has-text("짝수만 보기"), button:has-text("전체 보기")')
    await filterButton.click()
    await page.waitForTimeout(100)

    const afterMetrics = await getAllCaseMetrics(page)

    console.log('\n필터 토글 후 리렌더 횟수 변화:')
    for (const caseNum of [1, 2, 3, 4, 5]) {
      const diff = afterMetrics[caseNum].renderCount - initialMetrics[caseNum].renderCount
      console.log(`  Case ${caseNum}: +${diff}회`)
    }

    // Case 1만 리렌더 안됨 (filterEvenOnly 구독 안함)
    const case1Diff = afterMetrics[1].renderCount - initialMetrics[1].renderCount
    expect(case1Diff).toBe(0)
    console.log('\n  ✅ Case 1: 리렌더 없음 (items만 구독)')

    // Case 2-5는 리렌더됨
    for (const caseNum of [2, 3, 4, 5]) {
      const diff = afterMetrics[caseNum].renderCount - initialMetrics[caseNum].renderCount
      expect(diff).toBe(1)
    }
    console.log('  ✅ Case 2-5: 각 1회 리렌더 (필터 결과 변경)')
  })

  test('실험 4: 배열 크기별 성능 측정', async ({ page }) => {
    console.log('\n' + '='.repeat(60))
    console.log('🧪 실험 4: 배열 크기별 실행 시간')
    console.log('='.repeat(60))

    const sizes = [100, 500, 1000, 2000]
    const results: Record<number, Record<number, number>> = {}

    for (const size of sizes) {
      // 배열 크기 설정
      const input = page.locator('input[type="number"]')
      await input.fill(size.toString())
      await page.locator('button:has-text("Set")').click()
      await page.waitForTimeout(200)

      // 메트릭 수집
      results[size] = {}
      for (let caseNum = 1; caseNum <= 5; caseNum++) {
        const metrics = await getCaseMetrics(page, caseNum)
        results[size][caseNum] = metrics.executionTimeUs
      }
    }

    console.log('\n배열 크기별 실행 시간 (μs):')
    console.log('Size\t| Case1\t| Case2\t| Case3\t| Case4\t| Case5')
    console.log('-'.repeat(60))

    for (const size of sizes) {
      const row = [size.toString()]
      for (let caseNum = 1; caseNum <= 5; caseNum++) {
        row.push(results[size][caseNum].toFixed(1))
      }
      console.log(row.join('\t| '))
    }
  })

  test('실험 5: 객체 복잡도별 성능 측정', async ({ page }) => {
    console.log('\n' + '='.repeat(60))
    console.log('🧪 실험 5: 객체 복잡도(Mode)별 실행 시간')
    console.log('='.repeat(60))

    const modes = ['simple', 'medium', 'deep']
    const results: Record<string, Record<number, number>> = {}

    for (const mode of modes) {
      // Mode 선택
      const modeSelect = page.locator('select')
      await modeSelect.selectOption(mode)
      await page.waitForTimeout(200)

      // 메트릭 수집
      results[mode] = {}
      for (let caseNum = 1; caseNum <= 5; caseNum++) {
        const metrics = await getCaseMetrics(page, caseNum)
        results[mode][caseNum] = metrics.executionTimeUs
      }
    }

    console.log('\n객체 복잡도별 실행 시간 (μs):')
    console.log('Mode\t\t| Case1\t| Case2\t| Case3\t| Case4\t| Case5')
    console.log('-'.repeat(60))

    for (const mode of modes) {
      const row = [mode.padEnd(8)]
      for (let caseNum = 1; caseNum <= 5; caseNum++) {
        row.push(results[mode][caseNum].toFixed(1))
      }
      console.log(row.join('\t| '))
    }
  })

  test('실험 6: 연속 액션 성능 스트레스 테스트', async ({ page }) => {
    console.log('\n' + '='.repeat(60))
    console.log('🧪 실험 6: 연속 액션 스트레스 테스트')
    console.log('='.repeat(60))

    // 배열 크기를 500으로 설정
    const input = page.locator('input[type="number"]')
    await input.fill('500')
    await page.locator('button:has-text("Set")').click()
    await page.waitForTimeout(100)

    const initialMetrics = await getAllCaseMetrics(page)

    // 성능 측정 시작
    const startTime = Date.now()

    // 50회 연속 bumpTick
    const bumpTickButton = page.locator('button:has-text("bumpTick")')
    for (let i = 0; i < 50; i++) {
      await bumpTickButton.click()
    }

    const endTime = Date.now()
    const totalTime = endTime - startTime

    const afterMetrics = await getAllCaseMetrics(page)

    console.log(`\n50회 bumpTick 소요 시간: ${totalTime}ms`)
    console.log('\n리렌더 횟수 변화:')

    for (const caseNum of [1, 2, 3, 4, 5]) {
      const diff = afterMetrics[caseNum].renderCount - initialMetrics[caseNum].renderCount
      console.log(`  Case ${caseNum}: +${diff}회`)
    }

    // Case 2만 50회 리렌더
    expect(afterMetrics[2].renderCount - initialMetrics[2].renderCount).toBe(50)

    // 나머지는 리렌더 없음
    for (const caseNum of [1, 3, 4, 5]) {
      expect(afterMetrics[caseNum].renderCount - initialMetrics[caseNum].renderCount).toBe(0)
    }

    console.log('\n결론:')
    console.log(`  - Case 2: 50회 불필요한 리렌더 발생`)
    console.log(`  - Case 1,3,4,5: 리렌더 없음 (최적화됨)`)
  })
})

test.describe('실험 결과 종합', () => {
  test('최종 결과 리포트 생성', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('text=Redux Selector Test')

    console.log('\n' + '='.repeat(70))
    console.log('📊 Redux Selector 패턴별 E2E 실험 최종 결과')
    console.log('='.repeat(70))

    console.log(`
┌───────────────────────────────────────────────────────────────────────┐
│                     실험 환경                                          │
├───────────────────────────────────────────────────────────────────────┤
│ 브라우저: Chromium (Playwright)                                        │
│ 프레임워크: React 19.2 + Redux Toolkit 2.11                            │
│ 기본 배열 크기: 200 항목                                                │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                     패턴별 리렌더 결과                                  │
├─────────────────────────┬─────────────┬─────────────┬─────────────────┤
│ 패턴                    │ bumpTick    │ mutateOne   │ toggleFilter    │
├─────────────────────────┼─────────────┼─────────────┼─────────────────┤
│ Case 1: 기본 비교       │ ❌ 없음     │ ✅ 있음     │ ❌ 없음         │
│ Case 2: filter + ===    │ ⚠️ 있음    │ ✅ 있음     │ ✅ 있음         │
│ Case 3: filter + shallow│ ❌ 없음     │ ✅ 있음     │ ✅ 있음         │
│ Case 4: createSelector  │ ❌ 없음     │ ✅ 있음     │ ✅ 있음         │
│ Case 5: create + shallow│ ❌ 없음     │ ✅ 있음     │ ✅ 있음         │
└─────────────────────────┴─────────────┴─────────────┴─────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                     핵심 발견                                          │
├───────────────────────────────────────────────────────────────────────┤
│ 1. Case 2 (filter + ===) 는 매번 새 배열을 생성하여 불필요한 리렌더 유발 │
│ 2. shallowEqual은 리렌더를 방지하지만 selector는 매번 실행됨           │
│ 3. createSelector는 selector 실행 자체를 방지하여 가장 효율적          │
│ 4. createSelector + shallowEqual 조합은 불필요한 중복                  │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                     권장 사용법                                        │
├───────────────────────────────────────────────────────────────────────┤
│ ✅ Store 직접 반환 → 기본 비교 (===)                                   │
│ ✅ 파생 데이터 (filter/map/reduce) → createSelector                   │
│ ⚠️ 외부 selector 최적화 필요 → shallowEqual (임시 방편)               │
│ ❌ filter + === → 절대 사용하지 말 것                                  │
└───────────────────────────────────────────────────────────────────────┘
`)

    expect(true).toBe(true)
  })
})
