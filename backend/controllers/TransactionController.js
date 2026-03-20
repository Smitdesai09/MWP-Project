const Transaction = require('../models/Transaction');
const mongoose = require("mongoose");

async function getTransactions(req, res) {
    try {
        const { month, year, type, category } = req.query;

        const filter = {
            userId: req.user._id
        };

        if (month && (Number(month) < 1 || Number(month) > 12)) {
            return res.status(400).json({ success: false, error: "Invalid month" });
        }
        if (year && isNaN(Number(year))) {
            return res.status(400).json({ success: false, error: "Invalid year" });
        }

        //default: current month
        const now = new Date();
        const selectedMonth = month ? Number(month) : now.getMonth() + 1;
        const selectedYear = year ? Number(year) : now.getFullYear();
        const start = new Date(selectedYear, selectedMonth - 1, 1);
        const end = new Date(selectedYear, selectedMonth, 1);
        filter.date = { $gte: start, $lt: end };

        if (type) filter.type = type.toLowerCase();
        if (category) filter.category = category.trim();

        const transactions = await Transaction.find(filter)
            .sort({ date: -1 });

        res.status(200).json({ success: true, transactions });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function createTransaction(req, res) {
    try {
        const { title, amount, type, category, date, notes } = req.body;
        const userId = req.user._id;

        //missing check
        if (!title?.trim() || amount === undefined || !type || !category?.trim()) {
            return res.status(400).json({ success: false, error: 'Please enter all required fields.' });
        }

        //amount check
        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount < 0) {
            return res.status(400).json({ success: false, error: 'Invalid amount.' });
        }

        //type check
        const normalizedType = type.toLowerCase();
        if (!['income', 'expense'].includes(normalizedType)) {
            return res.status(400).json({ success: false, error: 'Invalid transaction type.' });
        }

        //date check
        let parsedDate;
        if (date) {
            parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({ success: false, error: 'Invalid date.' });
            }
        }

        const transaction = await Transaction.create({
            userId,
            title: title.trim(),
            amount: parsedAmount,
            type: normalizedType,
            category: category.trim(),
            date: parsedDate,
            notes: notes?.trim()
        });

        res.status(201).json({ success: true, transaction });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function updateTransaction(req, res) {
    try {
        const { id } = req.params;
        const { title, amount, type, category, date, notes } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid transaction ID"
            });
        }

        const updateData = {};

        if (title) updateData.title = title.trim();
        if (amount !== undefined) {
            const parsedAmount = Number(amount);
            if (isNaN(parsedAmount) || parsedAmount < 0) {
                return res.status(400).json({ success: false, error: 'Invalid amount.' });
            }
            updateData.amount = parsedAmount;
        }
        if (type) {
            const normalizedType = type.toLowerCase();
            if (!['income', 'expense'].includes(normalizedType)) {
                return res.status(400).json({ success: false, error: 'Invalid transaction type.' });
            }
            updateData.type = normalizedType;
        }
        if (category) updateData.category = category.trim();
        if (date) {
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({ success: false, error: 'Invalid date.' });
            }
            updateData.date = parsedDate;
        }
        if (notes) updateData.notes = notes.trim();

        const updated = await Transaction.findOneAndUpdate(
            { _id: id, userId },
            updateData,
            { returnDocument: 'after', runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, error: 'Transaction not found.' });
        }

        res.json({ success: true, transaction: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function deleteTransaction(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid transaction ID"
            });
        }

        const deleted = await Transaction.findOneAndDelete({ _id: id, userId });

        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Transaction not found.' });
        }

        res.json({ success: true, transaction: deleted });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
};