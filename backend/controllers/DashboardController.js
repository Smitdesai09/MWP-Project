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

        let allocation = { equity: 0, debt: 0, gold: 0 };

        for (const h of holdings) {
            totalValue += h.currentValue;
            totalInvestment += h.purchaseValue;

            // INLINE CATEGORY LOGIC (NO getCategory function)
            let category = null;

            if (["stock", "mf", "crypto"].includes(h.type)) category = "equity";
            else if (["fd", "rd"].includes(h.type)) category = "debt";
            else if (h.type === "gold") category = "gold";

            if (category && allocation[category] !== undefined) {
                allocation[category] += h.currentValue;
            }
        }

        const totalGain = totalValue - totalInvestment;

        const totalPercentage = totalInvestment > 0
            ? Number(((totalGain / totalInvestment) * 100).toFixed(2))
            : 0;

        const total = totalValue || 1;

        Object.keys(allocation).forEach(key => {
            allocation[key] = Number(((allocation[key] / total) * 100).toFixed(2));
        });

        // ---------- RECOMMENDATIONS ----------
        let recommendations = [];
        let targetAllocation = null;

        if (profile?.riskClass) {
            const targets = {
                low: { equity: 20, debt: 70, gold: 10 },
                moderate: { equity: 50, debt: 40, gold: 10 },
                high: { equity: 60, debt: 30, gold: 10 }
            };

            targetAllocation = targets[profile.riskClass];

            if (targetAllocation) {
                const diff = {
                    equity: targetAllocation.equity - allocation.equity,
                    debt: targetAllocation.debt - allocation.debt,
                    gold: targetAllocation.gold - allocation.gold
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

        if (recommendations.length === 0) {
            recommendations = ["Portfolio is well aligned"];
        }

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
                budgets
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { getDashboard };