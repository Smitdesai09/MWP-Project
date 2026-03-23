const Transaction = require('../models/Transaction');
const mongoose = require("mongoose");

async function getTransactions(req, res) {
    try {
        const { month, year, type, category, search, page = 1, limit = 10 } = req.query;

        // ---------- VALIDATION ----------
        if (month && (Number(month) < 1 || Number(month) > 12)) {
            return res.status(400).json({ success: false, error: "Invalid month" });
        }
        if (year && isNaN(Number(year))) {
            return res.status(400).json({ success: false, error: "Invalid year" });
        }
        if (type && !['income', 'expense'].includes(type.toLowerCase())) {
            return res.status(400).json({ success: false, error: "Invalid type" });
        }


        // ---------- BASE FILTER ----------
        const now = new Date();
        const selectedMonth = month ? Number(month) : now.getMonth() + 1;
        const selectedYear = year ? Number(year) : now.getFullYear();
        const start = new Date(selectedYear, selectedMonth - 1, 1);
        const end = new Date(selectedYear, selectedMonth, 1);

        const filter = {
            userId: req.user._id,
            date: { $gte: start, $lt: end }
        };


        // ---------- OPTIONAL FILTERS ----------
        if (type) filter.type = type.toLowerCase();
        if (category) filter.category = category.trim();

        if (search) {
            const searchRegex = new RegExp(search.trim(), "i");
            filter.$or = [
                { title: searchRegex },
                { notes: searchRegex },
                { category: searchRegex }
            ];
        }

        const pageNumber = Math.max(1, Number(page));
        const limitNumber = Math.max(1, Number(limit));
        const skip = (pageNumber - 1) * limitNumber;

        const countQuery = { ...filter };



        const [transactions, total] = await Promise.all([
            Transaction.find(filter)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limitNumber),
            Transaction.countDocuments(countQuery)
        ]);



        res.status(200).json({
            success: true,
            transactions,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            }
        });

    } catch (error) {
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
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
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
            date: parsedDate || new Date(),
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
            if (isNaN(parsedAmount) || parsedAmount <= 0) {
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

async function getTransactionSummary(req, res) {
    try {
        const userId = req.user._id;

        const transactions = await Transaction.find({ userId });

        let totalIncome = 0;
        let totalExpense = 0;

        for (const t of transactions) {
            if (t.type === "income") totalIncome += t.amount;
            else if (t.type === "expense") totalExpense += t.amount;
        }

        const balance = totalIncome - totalExpense;

        res.json({
            success: true,
            summary: {
                totalIncome,
                totalExpense,
                balance
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionSummary
};