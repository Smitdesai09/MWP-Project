const Transaction = require("../models/Transaction");
const Holding = require("../models/Holding");
const { Parser } = require("json2csv");

// ---------- Helper function to format date ----------
function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

// ---------- CSV Export: Transactions ----------
function generateCSVTransactions(req, res) {
    const userId = req.user._id;
    const { month, year } = req.query;

    let query = { userId };
    if (month && year) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59, 999);
        query.date = { $gte: start, $lte: end };
    }

    Transaction.find(query)
        .sort({ date: 1 })
        .then(transactions => {
            const data = transactions.map(t => ({
                Date: formatDate(t.date),
                Title: t.title,
                Type: t.type,
                Category: t.category,
                Amount: t.amount
            }));

            const json2csvParser = new Parser({ fields: ["Date", "Title", "Type", "Category", "Amount"] });
            const csv = json2csvParser.parse(data);

            res.header("Content-Type", "text/csv");
            res.attachment(`transactions_${month || "all"}_${year || "all"}.csv`);
            res.send(csv);
        })
        .catch(error => res.status(500).json({ success: false, error: error.message }));
}

// ---------- CSV Export: Holdings ----------
function generateCSVHoldings(req, res) {
    const userId = req.user._id;

    Holding.find({ userId }).sort({ name: 1 })
        .then(holdings => {
            const data = holdings.map(h => {
                const gain = h.currentValue - h.purchaseValue;
                const gainPercentage = h.purchaseValue > 0 ? ((gain / h.purchaseValue) * 100).toFixed(2) : 0;
                return {
                    Name: h.name,
                    Type: h.type,
                    "Purchase Value": h.purchaseValue,
                    "Current Value": h.currentValue,
                    Gain: gain,
                    "Gain %": gainPercentage,
                    "Purchase Date": formatDate(h.purchaseDate)
                };
            });

            const json2csvParser = new Parser({ fields: ["Name", "Type", "Purchase Value", "Current Value", "Gain", "Gain %", "Purchase Date"] });
            const csv = json2csvParser.parse(data);

            res.header("Content-Type", "text/csv");
            res.attachment(`holdings.csv`);
            res.send(csv);
        })
        .catch(error => res.status(500).json({ success: false, error: error.message }));
}

module.exports = {
    generateCSVTransactions,
    generateCSVHoldings
};