// Base de données de transactions (Mock Data)
// Format: { id, date (YYYY-MM-DD), type, amount }
// Types possibles: 'commission', 'refund', 'revenue', 'referral'

export const transactionsData = [
  // Janvier 2026
  { id: 1, date: "2026-01-28", type: "commission", amount: 97 },
  { id: 2, date: "2026-01-29", type: "commission", amount: 97 },
  { id: 3, date: "2026-01-30", type: "commission", amount: 97 },
  { id: 4, date: "2026-02-02", type: "commission", amount: 97 },
  { id: 13, date: "2026-02-03", type: "commission", amount: 97 },
  { id: 14, date: "2026-02-04", type: "commission", amount: 97 },
  { id: 15, date: "2026-02-06", type: "commission", amount: 97 },
  { id: 5, date: "2026-01-28", type: "revenue", amount: 97 },
  { id: 6, date: "2026-01-29", type: "revenue", amount: 97 },
  { id: 7, date: "2026-01-30", type: "revenue", amount: 97 },
  { id: 8, date: "2026-02-02", type: "revenue", amount: 97 },
  { id: 16, date: "2026-02-03", type: "revenue", amount: 97 },
  { id: 17, date: "2026-02-04", type: "revenue", amount: 97 },
  { id: 18, date: "2026-02-06", type: "revenue", amount: 97 },
  { id: 9, date: "2026-01-28", type: "referral", amount: 1 },
  { id: 10, date: "2026-01-29", type: "referral", amount: 1 },
  { id: 11, date: "2026-01-30", type: "referral", amount: 1 },
  { id: 12, date: "2026-02-02", type: "referral", amount: 1 },
  { id: 19, date: "2026-02-03", type: "referral", amount: 1 },
  { id: 20, date: "2026-02-04", type: "referral", amount: 1 },
  { id: 21, date: "2026-02-06", type: "referral", amount: 1 },
//  // { id: 5, date: "2026-01-28", type: "refund", amount: 35.00 },
//   { id: 6, date: "2026-01-27", type: "revenue", amount: 320.00 },
//   { id: 7, date: "2026-01-26", type: "commission", amount: 67.25 },
//   { id: 8, date: "2026-01-25", type: "referral", amount: 1 },
// //{ id: 9, date: "2026-01-25", type: "refund", amount: 15.50 },
//   { id: 10, date: "2026-01-24", type: "revenue", amount: 580.00 },
//   { id: 11, date: "2026-01-20", type: "commission", amount: 210.00 },
//   { id: 12, date: "2026-01-18", type: "referral", amount: 1 },
//   { id: 13, date: "2026-01-15", type: "revenue", amount: 890.00 },
//   //{ id: 14, date: "2026-01-12", type: "refund", amount: 42.00 },
//   { id: 15, date: "2026-01-10", type: "commission", amount: 156.75 },
//   { id: 16, date: "2026-01-05", type: "referral", amount: 1 },
//   { id: 17, date: "2026-01-02", type: "revenue", amount: 275.00 },
  
//   // Décembre 2025
//   { id: 18, date: "2025-12-28", type: "commission", amount: 340.00 },
//   { id: 19, date: "2025-12-25", type: "refund", amount: 28.00 },
//   { id: 20, date: "2025-12-20", type: "revenue", amount: 720.00 },
//   { id: 21, date: "2025-12-18", type: "referral", amount: 1 },
//   { id: 22, date: "2025-12-15", type: "commission", amount: 95.50 },
//   { id: 23, date: "2025-12-10", type: "revenue", amount: 430.00 },
//   { id: 24, date: "2025-12-05", type: "refund", amount: 55.00 },
//   { id: 25, date: "2025-12-01", type: "referral", amount: 1 },
  
//   // Novembre 2025
//   { id: 26, date: "2025-11-28", type: "commission", amount: 178.00 },
//   { id: 27, date: "2025-11-25", type: "revenue", amount: 650.00 },
//   { id: 28, date: "2025-11-20", type: "refund", amount: 22.50 },
//   { id: 29, date: "2025-11-15", type: "referral", amount: 1 },
//   { id: 30, date: "2025-11-10", type: "commission", amount: 112.25 },
//   { id: 31, date: "2025-11-05", type: "revenue", amount: 385.00 },
//   { id: 32, date: "2025-11-01", type: "refund", amount: 18.00 },
]

// Fonction utilitaire pour calculer les statistiques totales
export const calculateStats = (startDate, endDate, transactions = transactionsData) => {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    return transactionDate >= start && transactionDate <= end
  })

  const stats = {
    commission: 0,
    refundsBrut: 0,
    refundsCount: 0,
    users: 0,
    revenue: 0
  }

  filteredTransactions.forEach(transaction => {
    switch (transaction.type) {
      case 'commission':
        stats.commission += transaction.amount
        break
      case 'refund':
        stats.refundsBrut += transaction.amount
        stats.refundsCount += 1
        break
      case 'revenue':
        stats.revenue += transaction.amount
        break
      case 'referral':
        stats.users += transaction.amount
        break
    }
  })

  return stats
}

// Fonction pour générer toutes les dates entre deux dates
const getDateRange = (startDate, endDate) => {
  const dates = []
  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

// Fonction pour obtenir les données journalières pour les graphiques
export const getDailyChartData = (startDate, endDate, transactionType, transactions = transactionsData) => {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  // Filtrer les transactions par période et type
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    return transactionDate >= start && transactionDate <= end && transaction.type === transactionType
  })

  // Créer un objet avec les sommes par date
  const dailyTotals = {}
  filteredTransactions.forEach(transaction => {
    const dateKey = transaction.date
    if (!dailyTotals[dateKey]) {
      dailyTotals[dateKey] = 0
    }
    dailyTotals[dateKey] += transaction.amount
  })

  // Générer toutes les dates de la période avec valeur 0 par défaut
  const allDates = getDateRange(startDate, endDate)
  
  return allDates.map(date => ({
    date,
    value: dailyTotals[date] || 0
  }))
}

// Fonction spéciale pour les remboursements (compte le nombre)
export const getDailyRefundCountData = (startDate, endDate, transactions = transactionsData) => {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    return transactionDate >= start && transactionDate <= end && transaction.type === 'refund'
  })

  const dailyCounts = {}
  filteredTransactions.forEach(transaction => {
    const dateKey = transaction.date
    if (!dailyCounts[dateKey]) {
      dailyCounts[dateKey] = 0
    }
    dailyCounts[dateKey] += 1
  })

  const allDates = getDateRange(startDate, endDate)
  
  return allDates.map(date => ({
    date,
    value: dailyCounts[date] || 0
  }))
}
