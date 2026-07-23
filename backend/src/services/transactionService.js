const crypto = require("crypto");
const { supabase } = require("../config/supabaseClient");

const {
  calculateSubtotal,
  calculateDiscount,
} = require("./calculationService");

let transactionHistory = [];

async function saveTransaction(data) {
  if (!data.cart || !Array.isArray(data.cart) || data.cart.length === 0) {
    throw new Error("Cannot save transaction: Cart is invalid.");
  }

  const subtotal = calculateSubtotal(data.cart);

  const discount = calculateDiscount(
    subtotal,
    data.discountType,
    data.discountValue
  );

  const transaction = {
    transaction_number: `TXN-${Date.now()}`,
    idempotency_key: crypto.randomUUID(),
    customer_count: data.customerCount || 1,
    cart: data.cart.map((item) => ({
      ...item,
      price: Number(item.price),
      quantity: Number(item.quantity),
    })),
    subtotal: Number(subtotal),
    discount: Number(discount),
    total: Number(subtotal - discount),
    discount_type: data.discountType || "none",
    discount_value: Number(data.discountValue || 0),
    special_instructions: data.specialInstructions || null,
    payment_method: data.paymentMethod || "CASH",
    cash_received: Number(data.cashReceived || 0),
    change_amount: Number(data.changeAmount || 0),
    created_at: new Date().toISOString(),
  };

  if (supabase && typeof supabase.from === "function") {
    const { data: saved, error } = await supabase
      .from("transactions")
      .insert(transaction)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      ...transaction,
      ...(saved || {}),
    };
  }

  transactionHistory.push(transaction);

  return transaction;
}

async function getTransactionHistory() {
  if (supabase && typeof supabase.from === "function") {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return data;
  }

  return transactionHistory.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

async function getTransactionById(id) {
  if (supabase && typeof supabase.from === "function") {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("transaction_number", id)
      .single();

    if (error) {
      return undefined;
    }

    return data;
  }

  return transactionHistory.find(
    (transaction) => transaction.transaction_number === id
  );
}

function formatReceipt(transaction) {
  return {
    receiptId: transaction.transaction_number,
    createdAt: transaction.created_at,
    customerCount: transaction.customer_count,
    items: transaction.cart,
    subtotal: transaction.subtotal,
    discountType: transaction.discount_type,
    discountValue: transaction.discount_value,
    discountAmount: transaction.discount,
    totalAmount: transaction.total,
    specialInstructions: transaction.special_instructions,
  };
}

function clearHistory() {
  transactionHistory = [];
}

module.exports = {
  saveTransaction,
  getTransactionHistory,
  getTransactionById,
  formatReceipt,
  clearHistory,
};