// const Transaction = require('../models/Transaction');
// const Holding = require('../models/Holding');
// const Goal = require('../models/Goal');
// const Budget = require('../models/Budget');
// const Profile = require('../models/Profile');

// async function getDashboard(req, res) {
//     try {
//         const userId = req.user._id;

//         const [
//             transactions,
//             holdings,
//             recentTransactions,
//             goals,
//             budgets,
//             profile
//         ] = await Promise.all([
//             Transaction.find({ userId }),
//             Holding.find({ userId }),
//             Transaction.find({ userId }).sort({ date: -1 }).limit(5),
//             Goal.find({ userId }).sort({ targetDate: 1 }).limit(3),
//             Budget.find({ userId }).limit(3),
//             Profile.findOne({ userId })
//         ]);

//         // ---------- TRANSACTIONS ----------
//         let totalIncome = 0;
//         let totalExpense = 0;
//         const categoryExpense = {};

//         for (const t of transactions) {
//             if (t.type === "income") totalIncome += t.amount;
//             else if (t.type === "expense") {
//                 totalExpense += t.amount;
//                 const cat = t.category || "Other";
//                 categoryExpense[cat] = (categoryExpense[cat] || 0) + t.amount;
//             }
//         }

//         const balance = totalIncome - totalExpense;

//         // ---------- INCOME vs EXPENSE VISUAL ----------
//         const inflowOutflow = [
//             { type: "Income", amount: totalIncome },
//             { type: "Expense", amount: totalExpense },
//             { type: "Balance", amount: balance }
//         ];

//         // ---------- CATEGORY-WISE EXPENSE PIE CHART ----------
//         // ---------- CATEGORY-WISE EXPENSE PIE CHART (PERCENTAGE) ----------
//         const totalExpenseAmount = Object.values(categoryExpense).reduce((sum, amt) => sum + amt, 0);
//         const categoryPie = Object.keys(categoryExpense).map(cat => ({
//             category: cat,
//             percentage: totalExpenseAmount > 0 ? Number(((categoryExpense[cat] / totalExpenseAmount) * 100).toFixed(2)) : 0
//         }));

//         // ---------- HOLDINGS ----------
//         let totalValue = 0;
//         let totalInvestment = 0;
//         let allocation = { equity: 0, debt: 0, gold: 0, other: 0 };

//         for (const h of holdings) {
//             totalValue += h.currentValue;
//             totalInvestment += h.purchaseValue;

//             let category = null;
//             if (["stock", "mf", "crypto"].includes(h.type)) category = "equity";
//             else if (["fd", "rd"].includes(h.type)) category = "debt";
//             else if (h.type === "gold") category = "gold";
//             else if (h.type === "other") category = "other";

//             if (category) allocation[category] += h.currentValue;
//         }

//         const totalGain = totalValue - totalInvestment;
//         const totalPercentage = totalInvestment > 0 ? Number(((totalGain / totalInvestment) * 100).toFixed(2)) : 0;
//         const total = totalValue || 0;
//         if (total > 0) {
//             Object.keys(allocation).forEach(key => {
//                 allocation[key] = Number(((allocation[key] / total) * 100).toFixed(2));
//             });
//         }

//         // ---------- RECOMMENDATIONS ----------
//         let recommendations = [];
//         let targetAllocation = null;

//         if (profile?.riskLevel) {
//             const targets = {
//                 low: { equity: 20, debt: 70, gold: 10, other: 0 },
//                 moderate: { equity: 50, debt: 40, gold: 10, other: 0 },
//                 high: { equity: 60, debt: 30, gold: 10, other: 0 }
//             };

//             targetAllocation = targets[profile.riskLevel];

//             if (targetAllocation) {
//                 // ✅ FIX: Only check equity, debt, gold for recommendations (other has 0% target)
//                 const diff = {
//                     equity: targetAllocation.equity - allocation.equity,
//                     debt: targetAllocation.debt - allocation.debt,
//                     gold: targetAllocation.gold - allocation.gold
//                     // "other" intentionally excluded - no target for uncategorized
//                 };

//                 Object.keys(diff).forEach(key => {
//                     if (Math.abs(diff[key]) > 5) {
//                         recommendations.push(diff[key] > 0
//                             ? `Increase ${key} to ${targetAllocation[key]}%`
//                             : `Decrease ${key} to ${targetAllocation[key]}%`
//                         );
//                     }
//                 });
//             }
//         }

//         // ✅ FIX: Add recommendation if "other" has significant allocation
//         if (allocation.other > 10) {
//             recommendations.push(`Categorize ${allocation.other.toFixed(0)}% uncategorized holdings`);
//         }

//         if (allocation.other > 10) {
//             recommendations.push(`Categorize ${allocation.other.toFixed(0)}% uncategorized holdings`);
//         }

//         if (recommendations.length === 0) recommendations = ["Portfolio is well aligned"];

//         // ---------- BUDGETS WITH SPENT ----------
//         const currentMonth = new Date().getMonth() + 1;
//         const currentYear = new Date().getFullYear();

//         const budgetsWithSpent = budgets.map(budget => {
//             const spent = transactions.reduce((sum, t) => {
//                 if (t.type !== "expense") return sum;
//                 if (t.category.toLowerCase() !== budget.category.toLowerCase()) return sum;

//                 const tDate = new Date(t.date);
//                 const tMonth = tDate.getMonth() + 1;
//                 const tYear = tDate.getFullYear();

//                 if ((budget.month === currentMonth && budget.year === currentYear
//                     && tMonth === currentMonth && tYear === currentYear) ||
//                     (tMonth === budget.month && tYear === budget.year)) {
//                     return sum + t.amount;
//                 }
//                 return sum;
//             }, 0);

//             return {
//                 _id: budget._id,
//                 category: budget.category,
//                 month: budget.month,
//                 year: budget.year,
//                 limit: budget.monthlyLimit,
//                 spent
//             };
//         });

//         // ---------- RESPONSE ----------
//         res.json({
//             success: true,
//             dashboard: {
//                 transactions: {
//                     totalIncome,
//                     totalExpense,
//                     balance,
//                     recent: recentTransactions,
//                     inflowOutflow,       // ✅ NEW
//                     categoryPie           // ✅ NEW
//                 },
//                 holdings: {
//                     totalValue,
//                     totalInvestment,
//                     totalGain,
//                     totalPercentage,
//                     allocation,
//                     recommendations,
//                     targetAllocation
//                 },
//                 goals,
//                 budgets: budgetsWithSpent
//             }
//         });

//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// module.exports = { getDashboard };



const Transaction = require('../models/Transaction');
const Holding = require('../models/Holding');
const Goal = require('../models/Goal');
const Budget = require('../models/Budget');
const Profile = require('../models/Profile');

async function getDashboard(req, res) {
    try {
        const userId = req.user._id;

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Filter transactions of current month
        const monthStart = new Date(currentYear, currentMonth - 1, 1);
        const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

        const [
            transactions,
            holdings,
            recentTransactions,
            goals,
            budgets,
            profile
        ] = await Promise.all([
            Transaction.find({ userId, date: { $gte: monthStart, $lte: monthEnd } }),
            Holding.find({ userId }),
            Transaction.find({ userId }).sort({ date: -1 }).limit(5),
            Goal.find({ userId }).sort({ targetDate: 1 }).limit(3),
            Budget.find({ userId, month: currentMonth, year: currentYear }).limit(3),
            Profile.findOne({ userId })
        ]);

        // ---------- TRANSACTIONS ----------
        let totalIncome = 0;
        let totalExpense = 0;
        const categoryExpense = {};

        for (const t of transactions) {
            if (t.type === "income") totalIncome += t.amount;
            else if (t.type === "expense") {
                totalExpense += t.amount;
                const cat = t.category || "Other";
                categoryExpense[cat] = (categoryExpense[cat] || 0) + t.amount;
            }
        }

        const balance = totalIncome - totalExpense;

        // ---------- INCOME vs EXPENSE VISUAL ----------
        const inflowOutflow = [
            { type: "Income", amount: totalIncome },
            { type: "Expense", amount: totalExpense },
            { type: "Balance", amount: balance }
        ];

        // ---------- CATEGORY-WISE EXPENSE PIE CHART ----------
        const totalExpenseAmount = Object.values(categoryExpense).reduce((sum, amt) => sum + amt, 0);
        const categoryPie = Object.keys(categoryExpense).map(cat => ({
            category: cat,
            percentage: totalExpenseAmount > 0 ? Number(((categoryExpense[cat] / totalExpenseAmount) * 100).toFixed(2)) : 0
        }));

        // ---------- HOLDINGS ----------
        let totalValue = 0;
        let totalInvestment = 0;
        let allocation = { equity: 0, debt: 0, gold: 0, other: 0 };

        for (const h of holdings) {
            totalValue += h.currentValue;
            totalInvestment += h.purchaseValue;

            let category = null;
            if (["stock", "mf", "crypto"].includes(h.type)) category = "equity";
            else if (["fd", "rd"].includes(h.type)) category = "debt";
            else if (h.type === "gold") category = "gold";
            else if (h.type === "other") category = "other";

            if (category) allocation[category] += h.currentValue;
        }

        const totalGain = totalValue - totalInvestment;
        const totalPercentage = totalInvestment > 0 ? Number(((totalGain / totalInvestment) * 100).toFixed(2)) : 0;
        const total = totalValue || 0;
        if (total > 0) {
            Object.keys(allocation).forEach(key => {
                allocation[key] = Number(((allocation[key] / total) * 100).toFixed(2));
            });
        }

        // ---------- RECOMMENDATIONS ----------
        let recommendations = [];
        let targetAllocation = null;

        if (profile?.riskLevel) {
            const targets = {
                low: { equity: 20, debt: 70, gold: 10, other: 0 },
                moderate: { equity: 50, debt: 40, gold: 10, other: 0 },
                high: { equity: 60, debt: 30, gold: 10, other: 0 }
            };

            targetAllocation = targets[profile.riskLevel];

            if (targetAllocation) {
                const diff = {
                    equity: targetAllocation.equity - allocation.equity,
                    debt: targetAllocation.debt - allocation.debt,
                    gold: targetAllocation.gold - allocation.gold
                };

                Object.keys(diff).forEach(key => {
                    if (Math.abs(diff[key]) > 5) {
                        recommendations.push(diff[key] > 0
                            ? `Increase ${key} to ${targetAllocation[key]}%`
                            : `Decrease ${key} to ${targetAllocation[key]}%`
                        );
                    }
                });
            }
        }

        if (allocation.other > 10) {
            recommendations.push(`Categorize ${allocation.other.toFixed(0)}% uncategorized holdings`);
        }

        if (recommendations.length === 0) recommendations = ["Portfolio is well aligned"];

        // ---------- BUDGETS WITH SPENT ----------
        const budgetsWithSpent = budgets.map(budget => {
            const spent = transactions.reduce((sum, t) => {
                if (t.type !== "expense") return sum;
                if (t.category.toLowerCase() !== budget.category.toLowerCase()) return sum;
                return sum + t.amount;
            }, 0);

            return {
                _id: budget._id,
                category: budget.category,
                month: budget.month,
                year: budget.year,
                limit: budget.monthlyLimit,
                spent
            };
        });

        // ---------- RESPONSE ----------
        res.json({
            success: true,
            dashboard: {
                transactions: {
                    totalIncome,
                    totalExpense,
                    balance,
                    recent: recentTransactions,
                    inflowOutflow,
                    categoryPie
                },
                holdings: {
                    totalValue,
                    totalInvestment,
                    totalGain,
                    totalPercentage,
                    allocation,
                    recommendations,
                    targetAllocation
                },
                goals,
                budgets: budgetsWithSpent
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { getDashboard };