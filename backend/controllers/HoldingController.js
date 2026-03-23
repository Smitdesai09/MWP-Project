const Holding = require('../models/Holding');
// const Profile = require("../models/Profile");
const mongoose = require('mongoose');

async function getHoldings(req, res) {
    try {
        const { type, search, page = 1, limit = 10 } = req.query;

        const normalizedType = type?.toLowerCase();
        if (type && !["stock", "mf", "gold", "fd", "rd", "crypto", "other"].includes(normalizedType)) {
            return res.status(400).json({ success: false, error: "Invalid type" });
        }

        // ---------- BASE FILTER ----------
        const filter = {
            userId: req.user._id
        };

        // ---------- FILTER ----------
        if (type) filter.type = normalizedType;
        if (search) {
            filter.name = { $regex: search.trim(), $options: "i" };
        }

        // ---------- PAGINATION ----------
        const pageNumber = Math.max(1, Number(page));
        const limitNumber = Math.max(1, Number(limit));
        const skip = (pageNumber - 1) * limitNumber;
        const countQuery = { ...filter };



        // ---------- DB CALLS ----------
        const [holdings, total] = await Promise.all([
            Holding.find(filter)
                .sort({ purchaseDate: -1 })
                .skip(skip)
                .limit(limitNumber),
            Holding.countDocuments(countQuery)
        ]);

        // ---------- RESPONSE ----------
        res.json({
            success: true,
            holdings,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

async function addHolding(req, res) {
    try {
        const userId = req.user._id;
        const { type, name, purchaseValue, currentValue, purchaseDate } = req.body;

        if (!type || !name?.trim() || purchaseValue === undefined || currentValue === undefined || !purchaseDate) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        const cleanName = name.trim();
        const allowedTypes = ["stock", "mf", "gold", "fd", "rd", "crypto", "other"];
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ success: false, error: 'Invalid holding type' });
        }

        const parsedPurchase = Number(purchaseValue);
        const parsedCurrent = Number(currentValue);
        if (isNaN(parsedPurchase) || parsedPurchase < 0) {
            return res.status(400).json({ success: false, error: 'purchaseValue must be a non-negative number' });
        }
        if (isNaN(parsedCurrent) || parsedCurrent < 0) {
            return res.status(400).json({ success: false, error: 'currentValue must be a non-negative number' });
        }

        const parsedDate = new Date(purchaseDate);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ success: false, error: 'Invalid purchaseDate' });
        }

        const holding = await Holding.create({
            userId: userId,
            type,
            name: cleanName,
            purchaseValue: parsedPurchase,
            currentValue: parsedCurrent,
            purchaseDate: parsedDate
        });
        res.status(201).json({ success: true, data: holding });

    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

async function updateHolding(req, res) {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { currentValue } = req.body;

        //id validation
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid holding ID' });
        }

        //currentValue validation
        if (currentValue === undefined) {
            return res.status(400).json({ success: false, error: 'currentValue is required' });
        }
        const parsedValue = Number(currentValue);
        if (isNaN(parsedValue) || parsedValue < 0) {
            return res.status(400).json({ success: false, error: 'currentValue must be a non-negative number' });
        }

        const holding = await Holding.findOneAndUpdate(
            { _id: id, userId: userId },
            { currentValue: parsedValue },
            { new: true }
        );

        if (!holding) {
            return res.status(404).json({ success: false, error: 'Holding not found' });
        }

        res.json({ success: true, data: holding });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

async function deleteHolding(req, res) {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid holding ID' });
        }

        const holding = await Holding.findOneAndDelete({ _id: id, userId: userId });

        if (!holding) {
            return res.status(404).json({ success: false, error: 'Holding not found' });
        }

        res.json({ success: true, message: 'Holding deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

async function getHoldingsSummary(req, res) {
    try {
        const userId = req.user._id;

        const holdings = await Holding.find({ userId });

        let totalValue = 0;
        let totalInvestment = 0;

        for (const h of holdings) {
            totalValue += h.currentValue;
            totalInvestment += h.purchaseValue;
        }

        const totalGain = totalValue - totalInvestment;

        const totalPercentage = totalInvestment > 0
            ? Number(((totalGain / totalInvestment) * 100).toFixed(2))
            : 0;

        res.json({
            success: true,
            summary: {
                totalValue,
                totalInvestment,
                totalGain,
                totalPercentage
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    addHolding,
    getHoldings,
    updateHolding,
    deleteHolding,
    getHoldingsSummary
};