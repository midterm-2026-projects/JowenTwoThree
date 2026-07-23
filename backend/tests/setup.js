import { vi } from "vitest";

const chain = {
  insert: vi.fn().mockResolvedValue({
    data: [],
    error: null,
  }),

  select: vi.fn().mockReturnThis(),

  update: vi.fn().mockResolvedValue({
    data: [],
    error: null,
  }),

  delete: vi.fn().mockResolvedValue({
    data: [],
    error: null,
  }),

  eq: vi.fn().mockReturnThis(),

  single: vi.fn().mockResolvedValue({
    data: {},
    error: null,
  }),
};

vi.mock("../src/config/supabaseClient", () => ({
  supabase: {
    from: vi.fn(() => chain),
  },
}));