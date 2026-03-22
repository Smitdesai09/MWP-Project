const Holding = require('../models/Holding');
// const Profile = require("../models/Profile");
const mongoose = require('mongoose');

function calculateGain(h) {
    const gain = h.currentValue - h.purchaseValue;
    const percentage = h.purchaseValue > 0 ? (gain / h.purchaseValue) * 100 : 0;
    return { gain, percentage: Number(percentage.toFixed(2)) };
};

function getCategory(type) {
    if (["stock", "mf", "crypto"].includes(type)) {
        return "equity";
    }
    if (["fd", "rd"].includes(type)) {
        return "debt";
    }
    if (type === "gold") {
        return "gold";
    }
    return "other";
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

async function getHoldings(req, res) {
    try {
        const userId = req.user._id;
        const holdings = await Holding.find({ userId: userId }).sort({ purchaseDate: -1 });

        let totalValue = 0;
        let totalInvestment = 0;
        let allocation = { equity: 0, debt: 0, gold: 0 };

        const result = holdings.map(h => {
            const { gain, percentage } = calculateGain(h);
            totalValue += h.currentValue;
            totalInvestment += h.purchaseValue;

            const category = getCategory(h.type);
            if (allocation[category] !== undefined) {
                allocation[category] += h.currentValue;
            }

            return {
                _id: h._id,
                type: h.type,
                name: h.name,
                purchaseValue: h.purchaseValue,
                currentValue: h.currentValue,
                purchaseDate: h.purchaseDate,
                gain,
                percentage
            };
        });

        const total = totalValue || 1; // prevent division by zero

        Object.keys(allocation).forEach(key => {
            allocation[key] = Number(((allocation[key] / total) * 100).toFixed(2));
        });

        const totalGain = totalValue - totalInvestment;
        const totalPercentage = totalInvestment > 0 ? Number(((totalGain / totalInvestment) * 100).toFixed(2)) : Number("0.00");

        res.json({
            success: true,
            holdings: result,
            summary: {
                totalValue,
                totalInvestment,
                totalGain,
                totalPercentage
            },
            allocation
        });
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

async function getRecommendations(req, res) {
    try {
        const userId = req.user._id;

        const profile = await Profile.findOne({ userId: userId });
        if (!profile) {
            return res.status(404).json({ success: false, error: 'User profile not found, Complete your Profile First.' });
        }
        if (!riskClass) {
            return res.status(400).json({ success: false, error: 'Risk Class not found, complete your profile first.' });
        }
        const targetAllocation = {
            conservative: { equity: 20, debt: 70, gold: 10 },
            balanced: { equity: 50, debt: 40, gold: 10 },
            aggressive: { equity: 60, debt: 30, gold: 10 }
        };
        const target = targetAllocation[riskClass];


        const holdings = await Holding.find({ userId: userId });


        let current = { equity: 0, debt: 0, gold: 0 };
        let totalValue = 0;
        holdings.forEach(h => {
            const category = getCategory(h.type);

            if (current[category] !== undefined) {
                current[category] += h.currentValue;
                totalValue += h.currentValue;
            }
        });
        totalValue = totalValue || 1; // prevent division by zero
        Object.keys(current).forEach(key => {
            current[key] = Number(((current[key] / totalValue) * 100).toFixed(2));
        });



        const diff = {
            equity: Math.abs(target.equity - current.equity),
            debt: Math.abs(target.debt - current.debt),
            gold: Math.abs(target.gold - current.gold)
        };
        const maxDiff = Math.max(diff.equity, diff.debt, diff.gold);

        // 6. Suggestions (simple)
        let recommendations = [];

        Object.keys(diff).forEach(key => {
            if (diff[key] > 5) {
                if (current[key] < target[key]) {
                    recommendations.push(`Increase ${key} to ${target[key]}%`);
                } else {
                    recommendations.push(`Decrease ${key} to ${target[key]}%`);
                }
            }
        });

        // 7. Response (minimal)
        res.json({
            success: true,
            currentAllocation: current,
            targetAllocation,
            recommendations: recommendations.length > 0
                ? recommendations
                : ["Portfolio is well aligned with your risk profile"]
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

module.exports = {
    addHolding,
    getHoldings,
    updateHolding,
    deleteHolding,
    getRecommendations
};