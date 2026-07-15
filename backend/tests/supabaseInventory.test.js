import { describe, test, expect, vi } from 'vitest'

const inventoryStore = require('../src/services/inventorySupabaseStore')
const { __setSupabaseClient, getAllInventory, getInventoryById } = inventoryStore

describe('Supabase Inventory Store', () => {
  test('calls supabase and returns all inventory rows', async () => {
    const mockData = [
      {
        id: 'I-001',
        item_name: 'Coffee Beans',
        current_stock: 25,
        category_id: 'CAT-1',
        inventory_categories: { name: 'Beverage' },
      },
      {
        id: 'I-002',
        item_name: 'Milk',
        current_stock: 10,
        category_id: 'CAT-2',
        inventory_categories: { name: 'Dairy' },
      },
    ]

    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    })

    __setSupabaseClient(() => ({ from: fromMock }))

    const data = await getAllInventory()

    expect(fromMock).toHaveBeenCalledWith('inventory_items')
    expect(data).toEqual([
      {
        ...mockData[0],
        category_name: 'Beverage',
      },
      {
        ...mockData[1],
        category_name: 'Dairy',
      },
    ])
  })

  test('returns specific inventory row by id using eq + single', async () => {
    const mockRow = {
      id: 'I-001',
      item_name: 'Coffee Beans',
      current_stock: 25,
      inventory_categories: { name: 'Beverage' },
    }

    const singleChain = vi.fn().mockResolvedValue({ data: mockRow, error: null })

    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: singleChain }),
      }),
    })

    __setSupabaseClient(() => ({ from: fromMock }))

    const data = await getInventoryById('I-001')

    expect(fromMock).toHaveBeenCalledWith('inventory_items')
    expect(data).toEqual({
      ...mockRow,
      category_name: 'Beverage',
    })
  })

  test('throws an error when supabase returns an error for list', async () => {
    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'RLS blocked', statusCode: 401 },
      }),
    })

    __setSupabaseClient(() => ({ from: fromMock }))

    await expect(getAllInventory()).rejects.toThrow('RLS blocked')
  })
})

