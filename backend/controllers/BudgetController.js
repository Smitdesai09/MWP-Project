const Budget = require("../models/Budget");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

async function updateBudget(req, res) {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { monthlyLimit } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid budget ID" });
        }

        if (monthlyLimit === undefined) {
            return res.status(400).json({ success: false, error: "monthlyLimit is required" });
        }

        const parsedLimit = Number(monthlyLimit);
        if (isNaN(parsedLimit) || parsedLimit <= 0) {
            return res.status(400).json({ success: false, error: "monthlyLimit must be a positive number" });
        }

        const updated = await Budget.findOneAndUpdate(
            { _id: id, userId },
            { monthlyLimit: parsedLimit },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                error: "Budget not found."
            });
        }

        res.json({
            success: true,
            budget: updated
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

async function addBudget(req, res) {
    try {
        const userId = req.user._id;
        const { category, monthlyLimit } = req.body;

        if (!category?.trim() || monthlyLimit === undefined) {
            return res.status(400).json({ success: false, error: "Category and monthlyLimit are required." });
        }

        const cleanCategory = category.trim();

        const parsedLimit = Number(monthlyLimit);
        if (isNaN(parsedLimit) || parsedLimit <= 0) {
            return res.status(400).json({ success: false, error: "monthlyLimit must be a positive number" });
        }

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        let budget = await Budget.findOne({ userId, category: cleanCategory, month, year });

        if (budget) {
            return res.status(409).json({ success: false, error: "Budget for this category already exists, try editing instead." });
        } else {
            const budget = await Budget.create({ userId, category: cleanCategory, monthlyLimit: parsedLimit, month, year });

            return res.status(201).json({ success: true, budget });
        }

    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

async function getBudgets(req, res) {
    try {
        const userId = req.user._id;
        const { month, year } = req.query;

        const now = new Date();

        let selectedMonth = now.getMonth() + 1;
        let selectedYear = now.getFullYear();

        if (month) {
            selectedMonth = Number(month);
            if (isNaN(selectedMonth) || selectedMonth < 1 || selectedMonth > 12) {
                return res.status(400).json({ success: false, error: "Invalid month" });
            }
        }

        if (year) {
            selectedYear = Number(year);
            if (isNaN(selectedYear)) {
                return res.status(400).json({ success: false, error: "Invalid year" });
            }
        }

        const budgets = await Budget.find({ userId, month: selectedMonth, year: selectedYear });

        const result = await Promise.all(
            budgets.map(async (b) => {
                const transactions = await Transaction.find({
                    userId,
                    category: b.category,
                    type: "expense",
                    date: {
                        $gte: new Date(selectedYear, selectedMonth - 1, 1),
                        $lt: new Date(selectedYear, selectedMonth, 1)
                    }
                });

                const current = transactions.reduce(
                    (sum, t) => sum + t.amount,
                    0
                );

                const remaining = b.monthlyLimit - current;

                const percentage = b.monthlyLimit > 0
                    ? (current / b.monthlyLimit) * 100
                    : 0;

                return {
                    _id: b._id,
                    category: b.category,
                    limit: b.monthlyLimit,
                    current,
                    remaining,
                    percentage: Number(percentage.toFixed(2))
                };
            })
        );

        res.json({
            success: true,
            budgets: result
        });

    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

module.exports = {
    updateBudget,
    addBudget,
    getBudgets
};