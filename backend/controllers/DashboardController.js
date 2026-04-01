const Transaction = require('../models/Transaction');
const Holding = require('../models/Holding');
const Goal = require('../models/Goal');
const Budget = require('../models/Budget');
const Profile = require('../models/Profile');

async function getDashboard(req, res) {
    try {
        const userId = req.user._id;

        const [
            transactions,
            holdings,
            recentTransactions,
            goals,
            budgets,
            profile
        ] = await Promise.all([
            Transaction.find({ userId }),
            Holding.find({ userId }),
            Transaction.find({ userId }).sort({ date: -1 }).limit(5),
            Goal.find({ userId }).sort({ targetDate: 1 }).limit(3),
            Budget.find({ userId }).limit(3),
            Profile.findOne({ userId })
        ]);

        // ---------- TRANSACTIONS ----------
        let totalIncome = 0;
        let totalExpense = 0;

        for (const t of transactions) {
            if (t.type === "income") totalIncome += t.amount;
            else if (t.type === "expense") totalExpense += t.amount;
        }

        const balance = totalIncome - totalExpense;

        // ---------- HOLDINGS ----------
        let totalValue = 0;
        let totalInvestment = 0;

        // ✅ FIX: Added "other" category
        let allocation = { equity: 0, debt: 0, gold: 0, other: 0 };

        for (const h of holdings) {
            totalValue += h.currentValue;
            totalInvestment += h.purchaseValue;

            // ✅ FIX: Now handles ALL 7 types from your enum
            let category = null;

            if (["stock", "mf", "crypto"].includes(h.type)) {
                category = "equity";
            } else if (["fd", "rd"].includes(h.type)) {
                category = "debt";
            } else if (h.type === "gold") {
                category = "gold";
            } else if (h.type === "other") {
                category = "other";  // ✅ NEW: Handle "other" type
            }

            if (category && allocation[category] !== undefined) {
                allocation[category] += h.currentValue;
            }
        }

        const totalGain = totalValue - totalInvestment;

        const totalPercentage = totalInvestment > 0
            ? Number(((totalGain / totalInvestment) * 100).toFixed(2))
            : 0;

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
                // ✅ FIX: Only check equity, debt, gold for recommendations (other has 0% target)
                const diff = {
                    equity: targetAllocation.equity - allocation.equity,
                    debt: targetAllocation.debt - allocation.debt,
                    gold: targetAllocation.gold - allocation.gold
                    // "other" intentionally excluded - no target for uncategorized
                };

                Object.keys(diff).forEach(key => {
                    if (Math.abs(diff[key]) > 5) {
                        if (diff[key] > 0) {
                            recommendations.push(`Increase ${key} to ${targetAllocation[key]}%`);
                        } else {
                            recommendations.push(`Decrease ${key} to ${targetAllocation[key]}%`);
                        }
                    }
                });
            }
        }

        // ✅ FIX: Add recommendation if "other" has significant allocation
        if (allocation.other > 10) {
            recommendations.push(`Categorize ${allocation.other.toFixed(0)}% uncategorized holdings`);
        }

        if (recommendations.length === 0) {
            recommendations = ["Portfolio is well aligned"];
        }

        // ---------- BUDGETS WITH SPENT ----------
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const budgetsWithSpent = budgets.map(budget => {
            const budgetMonth = budget.month;
            const budgetYear = budget.year;

            const spent = transactions.reduce((sum, t) => {
                if (t.type !== "expense") return sum;
                if (t.category.toLowerCase() !== budget.category.toLowerCase()) return sum;

                const tDate = new Date(t.date);
                const tMonth = tDate.getMonth() + 1;
                const tYear = tDate.getFullYear();

                if (budgetMonth === currentMonth && budgetYear === currentYear) {
                    if (tMonth === currentMonth && tYear === currentYear) {
                        return sum + t.amount;
                    }
                } else {
                    if (tMonth === budgetMonth && tYear === budgetYear) {
                        return sum + t.amount;
                    }
                }
                return sum;
            }, 0);

            return {
                _id: budget._id,
                category: budget.category,
                month: budget.month,
                year: budget.year,
                limit: budget.monthlyLimit,
                spent: spent
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
                    recent: recentTransactions
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