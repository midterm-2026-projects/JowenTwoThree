import { describe, test, expect, vi, beforeEach } from 'vitest'


function freshModules() {
  vi.resetModules()
  return {
    inventoryService: require('../../src/services/inventoryService'),
    inventoryStore: require('../../src/services/inventoryStore'),
    inventorySupabaseStore: require('../../src/services/inventorySupabaseStore'),
  }
}

describe('inventoryService (unit)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('computeStatus', () => {
    test('returns OutOfStock when inStock is 0', () => {
      const { inventoryService } = freshModules()
      expect(inventoryService.computeStatus(0)).toBe('OutOfStock')
    })

    test('returns Low when inStock is <= 5', () => {
      const { inventoryService } = freshModules()
      expect(inventoryService.computeStatus(5)).toBe('Low')
      expect(inventoryService.computeStatus(1)).toBe('Low')
    })

    test('returns NearingExpiration when inStock is <= 10', () => {
      const { inventoryService } = freshModules()
      expect(inventoryService.computeStatus(10)).toBe('NearingExpiration')
      expect(inventoryService.computeStatus(6)).toBe('NearingExpiration')
    })

    test('returns Good when inStock is > 10', () => {
      const { inventoryService } = freshModules()
      expect(inventoryService.computeStatus(11)).toBe('Good')
    })
  })

  describe('listInventory', () => {
    test('maps supabase rows to API shape and computes status', async () => {
      const { inventoryService, inventorySupabaseStore } = freshModules()

      inventorySupabaseStore.__setSupabaseClient(() => ({
        from: () => ({
          select: async () => {
            return {
              data: [
                {
                  id: 'I-001',
                  item_name: 'Coffee Beans',
                  current_stock: 25,
                  inventory_categories: { name: 'Beverage' },
                },
              ],
              error: null,
            }
          },
        }),
      }))

      const result = await inventoryService.listInventory({})

      expect(result).toEqual([
        {
          id: 'I-001',
          name: 'Coffee Beans',
          category: 'Beverage',
          inStock: 25,
          status: 'Good',
        },
      ])
    })

    test('filters by category (case-sensitive after trim)', async () => {
      const { inventoryService, inventorySupabaseStore } = freshModules()

      inventorySupabaseStore.__setSupabaseClient(() => ({
        from: () => ({
          select: async () => {
            return {
              data: [
                {
                  id: 'I-001',
                  item_name: 'Coffee Beans',
                  current_stock: 25,
                  inventory_categories: { name: 'Beverage' },
                },
                {
                  id: 'I-002',
                  item_name: 'Milk',
                  current_stock: 10,
                  inventory_categories: { name: 'Dairy' },
                },
              ],
              error: null,
            }
          },
        }),
      }))

      const result = await inventoryService.listInventory({ category: 'Dairy' })
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ id: 'I-002', category: 'Dairy' })
    })

    test('filters by keyword q (case-insensitive) over name and id', async () => {
      const { inventoryService, inventorySupabaseStore } = freshModules()

      inventorySupabaseStore.__setSupabaseClient(() => ({
        from: () => ({
          select: async () => {
            return {
              data: [
                {
                  id: 'I-001',
                  item_name: 'Coffee Beans',
                  current_stock: 25,
                  inventory_categories: { name: 'Beverage' },
                },
                {
                  id: 'I-ABC',
                  item_name: 'Milk Powder',
                  current_stock: 2,
                  inventory_categories: { name: 'Dairy' },
                },
              ],
              error: null,
            }
          },
        }),
      }))

      const resultByName = await inventoryService.listInventory({ q: 'milk' })
      expect(resultByName).toHaveLength(1)
      expect(resultByName[0].id).toBe('I-ABC')
      expect(resultByName[0].status).toBe('Low')

      const resultById = await inventoryService.listInventory({ q: 'i-001' })
      expect(resultById).toHaveLength(1)
      expect(resultById[0].id).toBe('I-001')
    })

    test('falls back to in-memory inventory when supabase throws', async () => {
      const { inventoryService, inventorySupabaseStore, inventoryStore } = freshModules()

      inventorySupabaseStore.__setSupabaseClient(() => {
        return {
          from: () => ({
            select: async () => {
              return {
                data: null,
                error: { message: 'RLS blocked', statusCode: 401 },
              }
            },
          }),
        }
      })

      const result = await inventoryService.listInventory({})

      // Should be the raw in-memory store as returned by inventoryService.
      expect(result).toEqual(inventoryStore.inventory)
    })
  })

  describe('updateInventoryById', () => {
    test('updates inStock and recomputes status on success', () => {
      const { inventoryService, inventoryStore } = freshModules()

      const before = inventoryStore.inventory.find((i) => i.id === 'I-002')
      expect(before.inStock).toBe(10)

      const updated = inventoryService.updateInventoryById('I-002', {
        quantity: 1,
        reason: 'restock',
        notes: 'optional',
      })

      expect(updated.inStock).toBe(11)
      expect(updated.status).toBe('Good')
    })

    test('throws 404 when id not found', () => {
      const { inventoryService } = freshModules()

      const err = () =>
        inventoryService.updateInventoryById('NOPE', { quantity: 1, reason: 'x' })

      expect(err).toThrow('Inventory item not found')
      try {
        err()
      } catch (e) {
        expect(e.statusCode).toBe(404)
      }
    })

    test('throws 400 when quantity is not a number', () => {
      const { inventoryService } = freshModules()

      expect(() =>
        inventoryService.updateInventoryById('I-001', { quantity: NaN, reason: 'x' })
      ).toThrow('`quantity` must be a number')

      try {
        inventoryService.updateInventoryById('I-001', { quantity: NaN, reason: 'x' })
      } catch (e) {
        expect(e.statusCode).toBe(400)
      }
    })

    test('throws 400 when reason missing/empty', () => {
      const { inventoryService } = freshModules()

      try {
        inventoryService.updateInventoryById('I-001', { quantity: 1, reason: '   ' })
      } catch (e) {
        expect(e.message).toBe('`reason` must be provided')
        expect(e.statusCode).toBe(400)
      }
    })
  })
})

