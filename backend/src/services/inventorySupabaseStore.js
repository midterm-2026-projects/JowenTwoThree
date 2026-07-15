let supabaseClientGetter = () => require('./supabaseClient').getSupabase()

function __setSupabaseClient(getterFn) {
  // getterFn must return a Supabase-like client with `.from()`.
  supabaseClientGetter = getterFn
}

async function getAllInventory() {
  const supabase = supabaseClientGetter()

  // Join inventory_items -> inventory_categories and normalize field names.
  const { data, error } = await supabase
    .from('inventory_items')
    .select(
      'id, item_name, current_stock, inventory_categories(name)'
    )

  if (error) {
    const err = new Error(error.message || 'Failed to fetch inventory')
    err.statusCode = error.statusCode || 500
    throw err
  }

  // Supabase nested join returns `inventory_categories: { name }` (or array depending on relationship).
  return (data || []).map((row) => ({
    ...row,
    category_name:
      row?.inventory_categories?.name ??
      row?.inventory_categories?.[0]?.name ??
      null,
  }))
}

async function getInventoryById(id) {
  const supabase = supabaseClientGetter()

  const { data, error } = await supabase
    .from('inventory_items')
    .select(
      'id, item_name, current_stock, inventory_categories(name)'
    )
    .eq('id', id)
    .single()

  if (error) {
    const err = new Error(error.message || 'Failed to fetch inventory item')
    err.statusCode = error.statusCode || 500
    throw err
  }

  return {
    ...data,
    category_name:
      data?.inventory_categories?.name ??
      data?.inventory_categories?.[0]?.name ??
      null,
  }

}

module.exports = {
  getAllInventory,
  getInventoryById,
  __setSupabaseClient,
}



