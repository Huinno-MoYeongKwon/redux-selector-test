import { createSlice } from '@reduxjs/toolkit';

// 객체 복잡도 모드
export type ItemMode = 'simple' | 'medium' | 'deep';

export interface Item {
  // 기본 필드 (Simple)
  id: number;
  value: number;

  // Medium 필드
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'pending';
  priority?: number;
  metadata?: {
    created: number;
    updated: number;
    version: number;
    author: string;
    tags: string[];
    categories: string[];
    permissions: {
      read: boolean;
      write: boolean;
      delete: boolean;
      admin: boolean;
    };
  };

  // Deep 필드
  analytics?: {
    views: number;
    clicks: number;
    shares: number;
    rating: number;
    engagement: {
      likes: number;
      comments: number;
      bookmarks: number;
    };
    history: Array<{ date: number; action: string; userId: number }>;
  };
  config?: {
    settings: {
      theme: string;
      language: string;
      timezone: string;
      notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
        frequency: 'realtime' | 'daily' | 'weekly';
      };
      privacy: {
        public: boolean;
        searchable: boolean;
        showActivity: boolean;
      };
    };
    features: string[];
    limits: {
      maxStorage: number;
      maxRequests: number;
      rateLimit: number;
    };
  };
  nested?: {
    level1: {
      data1: string;
      count1: number;
      level2: {
        data2: string;
        count2: number;
        items2: string[];
        level3: {
          data3: string;
          count3: number;
          level4: {
            data4: string;
            count4: number;
            level5: {
              data5: string;
              count5: number;
              level6: {
                data6: string;
                deepestValue: number;
                finalPayload: {
                  secret: string;
                  timestamp: number;
                  checksum: string;
                };
              };
            };
          };
        };
      };
    };
  };
  relationships?: {
    parent: { id: number; type: string } | null;
    children: Array<{ id: number; type: string; order: number }>;
    siblings: Array<{ id: number; type: string }>;
    references: Array<{
      targetId: number;
      targetType: string;
      relation: string;
      metadata: { createdAt: number; strength: number };
    }>;
  };
}

export type ActionType = 'none' | 'setItemCount' | 'setItemMode' | 'bumpTick' | 'mutateOneItem' | 'toggleFilter';

export interface ItemsState {
  items: Item[];
  itemMode: ItemMode;
  tick: number;
  filterEvenOnly: boolean;
  lastAction: ActionType;
}

// 모드별 아이템 생성 함수
function createItems(count: number, mode: ItemMode): Item[] {
  const statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending'];
  const themes = ['light', 'dark', 'system', 'auto'];
  const languages = ['ko', 'en', 'ja', 'zh'];
  const timezones = ['Asia/Seoul', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
  const frequencies: Array<'realtime' | 'daily' | 'weekly'> = ['realtime', 'daily', 'weekly'];
  const actions = ['view', 'click', 'share', 'bookmark', 'comment', 'like'];
  const relations = ['related', 'similar', 'parent', 'child', 'reference'];

  return Array.from({ length: count }, (_, i) => {
    // Simple: 기본 필드만
    const base: Item = { id: i, value: i };

    // Medium: 기본 + 메타데이터 + 몇 가지 필드
    if (mode === 'medium' || mode === 'deep') {
      base.name = `Item-${i}-${Math.random().toString(36).substring(7)}`;
      base.description = `This is a detailed description for item ${i}. It contains various information about the item's purpose, origin, and characteristics.`;
      base.status = statuses[i % 3];
      base.priority = (i % 10) + 1;
      base.metadata = {
        created: Date.now() - i * 86400000, // i일 전
        updated: Date.now() - i * 3600000,  // i시간 전
        version: Math.floor(i / 10) + 1,
        author: `user-${i % 100}`,
        tags: [`tag-${i % 5}`, `category-${i % 3}`, `type-${i % 2}`, `group-${i % 7}`],
        categories: [`cat-${i % 4}`, `subcat-${i % 6}`, `region-${i % 3}`],
        permissions: {
          read: true,
          write: i % 2 === 0,
          delete: i % 3 === 0,
          admin: i % 10 === 0,
        },
      };
    }

    // Deep: 모든 필드 + 깊은 중첩 + 배열들
    if (mode === 'deep') {
      base.analytics = {
        views: i * 100 + Math.floor(Math.random() * 1000),
        clicks: i * 10 + Math.floor(Math.random() * 100),
        shares: i + Math.floor(Math.random() * 50),
        rating: 3 + (Math.random() * 2),
        engagement: {
          likes: i * 5 + Math.floor(Math.random() * 200),
          comments: Math.floor(Math.random() * 50),
          bookmarks: Math.floor(Math.random() * 30),
        },
        history: Array.from({ length: 5 }, (_, j) => ({
          date: Date.now() - j * 86400000,
          action: actions[j % actions.length],
          userId: (i * 10 + j) % 1000,
        })),
      };

      base.config = {
        settings: {
          theme: themes[i % themes.length],
          language: languages[i % languages.length],
          timezone: timezones[i % timezones.length],
          notifications: {
            email: i % 2 === 0,
            push: i % 3 === 0,
            sms: i % 5 === 0,
            frequency: frequencies[i % frequencies.length],
          },
          privacy: {
            public: i % 2 === 0,
            searchable: i % 3 !== 0,
            showActivity: i % 4 === 0,
          },
        },
        features: [`feature-${i % 3}`, `addon-${i % 5}`, `plugin-${i % 7}`, `module-${i % 4}`],
        limits: {
          maxStorage: 1024 * (i + 1),
          maxRequests: 1000 * (i + 1),
          rateLimit: 100 + i,
        },
      };

      base.nested = {
        level1: {
          data1: `L1-data-${i}-${'a'.repeat(20)}`,
          count1: i * 1,
          level2: {
            data2: `L2-data-${i}-${'b'.repeat(20)}`,
            count2: i * 2,
            items2: [`item2-${i}-a`, `item2-${i}-b`, `item2-${i}-c`],
            level3: {
              data3: `L3-data-${i}-${'c'.repeat(20)}`,
              count3: i * 3,
              level4: {
                data4: `L4-data-${i}-${'d'.repeat(20)}`,
                count4: i * 4,
                level5: {
                  data5: `L5-data-${i}-${'e'.repeat(20)}`,
                  count5: i * 5,
                  level6: {
                    data6: `L6-data-${i}-${'f'.repeat(20)}`,
                    deepestValue: i * 1000 + Math.random() * 1000,
                    finalPayload: {
                      secret: `secret-${i}-${Math.random().toString(36).substring(2, 15)}`,
                      timestamp: Date.now() + i,
                      checksum: `checksum-${i}-${Math.random().toString(16).substring(2, 10)}`,
                    },
                  },
                },
              },
            },
          },
        },
      };

      base.relationships = {
        parent: i > 0 ? { id: Math.floor(i / 2), type: 'parent' } : null,
        children: Array.from({ length: Math.min(3, i % 5) }, (_, j) => ({
          id: i * 10 + j,
          type: 'child',
          order: j,
        })),
        siblings: Array.from({ length: 2 }, (_, j) => ({
          id: i + j + 1,
          type: 'sibling',
        })),
        references: Array.from({ length: Math.min(4, i % 6) }, (_, j) => ({
          targetId: (i + j * 7) % count,
          targetType: ['document', 'image', 'video', 'link'][j % 4],
          relation: relations[j % relations.length],
          metadata: {
            createdAt: Date.now() - j * 3600000,
            strength: 0.5 + Math.random() * 0.5,
          },
        })),
      };
    }

    return base;
  });
}

const initialState: ItemsState = {
  items: createItems(200, 'simple'),
  itemMode: 'simple',
  tick: 0,
  filterEvenOnly: false,
  lastAction: 'none',
};

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    // 배열 크기 변경
    setItemCount: (state, action: { payload: number }) => {
      const count = Math.max(1, Math.min(10000, action.payload));
      state.items = createItems(count, state.itemMode);
      state.lastAction = 'setItemCount';
      console.log(`[setItemCount] items.length: ${state.items.length}, mode: ${state.itemMode}`);
    },

    // 객체 모드 변경 (모든 상태 리셋)
    setItemMode: (state, action: { payload: ItemMode }) => {
      const newMode = action.payload;
      const count = state.items.length;
      state.itemMode = newMode;
      state.items = createItems(count, newMode);
      state.tick = 0;
      state.filterEvenOnly = false;
      state.lastAction = 'setItemMode';
      console.log(`[setItemMode] mode: ${newMode}, items recreated with ${count} items`);
    },

    // tick += 1 (items는 변경하지 않음)
    bumpTick: (state) => {
      state.tick += 1;
      state.lastAction = 'bumpTick';
      console.log(`[bumpTick] tick: ${state.tick}`);
    },

    // items[0].value += 1 (immer로 일부만 변경)
    mutateOneItem: (state) => {
      state.items[0].value += 1;
      state.lastAction = 'mutateOneItem';
      console.log(`[mutateOneItem] items[0].value: ${state.items[0].value}`);
    },

    // filterEvenOnly 토글
    toggleFilter: (state) => {
      state.filterEvenOnly = !state.filterEvenOnly;
      state.lastAction = 'toggleFilter';
      console.log(`[toggleFilter] filterEvenOnly: ${state.filterEvenOnly}`);
    },
  },
});

export const { setItemCount, setItemMode, bumpTick, mutateOneItem, toggleFilter } = itemsSlice.actions;
export default itemsSlice.reducer;
