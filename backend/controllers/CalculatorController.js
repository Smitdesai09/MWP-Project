const toNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? null : num;
};

exports.sipCalculator = (req, res, next) => {
    try {
        const monthlyInvestment = toNumber(req.body.monthlyInvestment);
        const annualRate = toNumber(req.body.annualRate);
        const years = toNumber(req.body.years);

        if (monthlyInvestment === null || monthlyInvestment <= 0) {
            return res.status(400).json({ success: false, message: "Invalid monthlyInvestment" });
        }

        if (annualRate === null || annualRate < 0) {
            return res.status(400).json({ success: false, message: "Invalid annualRate" });
        }

        if (years === null || years <= 0) {
            return res.status(400).json({ success: false, message: "Invalid years" });
        }

        const r = annualRate / 12 / 100;
        const n = years * 12;

        const futureValue =
            r === 0
                ? monthlyInvestment * n
                : monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);

        const invested = monthlyInvestment * n;
        const returns = futureValue - invested;
        const total = futureValue;

        const investedPercent = (invested / total) * 100;
        const returnPercent = (returns / total) * 100;

        return res.status(200).json({
            success: true,
            data: {
                investedAmount: Math.round(invested),
                estimatedReturns: Math.round(returns),
                totalValue: Math.round(total),

                breakdown: [
                    { label: "Invested Amount", value: Math.round(invested) },
                    { label: "Estimated Returns", value: Math.round(returns) }
                ],

                percentages: {
                    invested: Math.round(investedPercent),
                    returns: Math.round(returnPercent)
                }
            },
        });

    } catch (err) {
        next(err);
    }
};

exports.lumpSumCalculator = (req, res, next) => {
    try {
        const principal = toNumber(req.body.principal);
        const rate = toNumber(req.body.rate);
        const years = toNumber(req.body.years);

        if (principal === null || principal <= 0) {
            return res.status(400).json({ success: false, message: "Invalid principal" });
        }

        if (rate === null || rate < 0) {
            return res.status(400).json({ success: false, message: "Invalid rate" });
        }

        if (years === null || years <= 0) {
            return res.status(400).json({ success: false, message: "Invalid years" });
        }

        const futureValue = principal * Math.pow(1 + rate / 100, years);

        const returns = futureValue - principal;
        const total = futureValue;

        const investedPercent = (principal / total) * 100;
        const returnPercent = (returns / total) * 100;

        return res.status(200).json({
            success: true,
            data: {
                investedAmount: principal,
                estimatedReturns: Math.round(returns),
                totalValue: Math.round(total),

                breakdown: [
                    { label: "Invested Amount", value: principal },
                    { label: "Estimated Returns", value: Math.round(returns) }
                ],

                percentages: {
                    invested: Math.round(investedPercent),
                    returns: Math.round(returnPercent)
                }
            },
        });

    } catch (err) {
        next(err);
    }
};

exports.emiCalculator = (req, res, next) => {
    try {
        const loanAmount = toNumber(req.body.loanAmount);
        const rate = toNumber(req.body.rate);
        const tenure = toNumber(req.body.tenure);

        if (loanAmount === null || loanAmount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid loanAmount" });
        }

        if (rate === null || rate < 0) {
            return res.status(400).json({ success: false, message: "Invalid rate" });
        }

        if (tenure === null || tenure <= 0) {
            return res.status(400).json({ success: false, message: "Invalid tenure" });
        }

        const r = rate / 12 / 100;
        const n = tenure * 12;

        const emi =
            r === 0
                ? loanAmount / n
                : (loanAmount * r * Math.pow(1 + r, n)) /
                (Math.pow(1 + r, n) - 1);

        return res.status(200).json({
            success: true,
            data: {
                emi: Math.round(emi),
                totalPayment: Math.round(emi * n),
                interestPaid: Math.round(emi * n - loanAmount),
            },
        });

    } catch (err) {
        next(err);
    }
};

exports.cagrCalculator = (req, res, next) => {
    try {
        const initialValue = toNumber(req.body.initialValue);
        const finalValue = toNumber(req.body.finalValue);
        const years = toNumber(req.body.years);

        if (initialValue === null || initialValue <= 0) {
            return res.status(400).json({ success: false, message: "Invalid initialValue" });
        }

        if (finalValue === null || finalValue <= 0) {
            return res.status(400).json({ success: false, message: "Invalid finalValue" });
        }

        if (years === null || years <= 0) {
            return res.status(400).json({ success: false, message: "Invalid years" });
        }

        const cagr =
            (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;

        return res.status(200).json({
            success: true,
            data: {
                cagr: Number(cagr.toFixed(2)),
            },
        });

    } catch (err) {
        next(err);
    }
};

exports.inflationCalculator = (req, res, next) => {
    try {
        const amount = toNumber(req.body.amount);
        const inflationRate = toNumber(req.body.inflationRate);
        const years = toNumber(req.body.years);

        if (amount === null || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount" });
        }

        if (inflationRate === null || inflationRate < 0) {
            return res.status(400).json({ success: false, message: "Invalid inflationRate" });
        }

        if (years === null || years <= 0) {
            return res.status(400).json({ success: false, message: "Invalid years" });
        }

        const futureValue =
            amount * Math.pow(1 + inflationRate / 100, years);

        return res.status(200).json({
            success: true,
            data: {
                futureCost: Math.round(futureValue),
            },
        });

    } catch (err) {
        next(err);
    }
};

exports.retirementCalculator = (req, res, next) => {
    try {
        const currentAge = toNumber(req.body.currentAge);
        const retirementAge = toNumber(req.body.retirementAge);
        const monthlyExpense = toNumber(req.body.monthlyExpense);
        const inflationRate = toNumber(req.body.inflationRate);

        if (currentAge === null || currentAge <= 0) {
            return res.status(400).json({ success: false, message: "Invalid currentAge" });
        }

        if (retirementAge === null || retirementAge <= currentAge) {
            return res.status(400).json({ success: false, message: "retirementAge must be greater than currentAge" });
        }

        if (monthlyExpense === null || monthlyExpense <= 0) {
            return res.status(400).json({ success: false, message: "Invalid monthlyExpense" });
        }

        if (inflationRate === null || inflationRate < 0) {
            return res.status(400).json({ success: false, message: "Invalid inflationRate" });
        }

        const yearsToRetire = retirementAge - currentAge;

        const inflatedExpense =
            monthlyExpense *
            Math.pow(1 + inflationRate / 100, yearsToRetire);

        const annualExpense = inflatedExpense * 12;
        const corpus = annualExpense * 25;

        return res.status(200).json({
            success: true,
            data: {
                monthlyExpenseAtRetirement: Math.round(inflatedExpense),
                yearlyExpense: Math.round(annualExpense),
                requiredCorpus: Math.round(corpus),
            },
        });

    } catch (err) {
        next(err);
    }
};

exports.cibilEstimator = (req, res, next) => {
    try {
        const paymentHistory = req.body.paymentHistory;
        const creditUtilization = toNumber(req.body.creditUtilization);
        const loans = toNumber(req.body.loans);

        if (!["good", "average", "poor"].includes(paymentHistory)) {
            return res.status(400).json({
                success: false,
                message: "paymentHistory must be good, average or poor",
            });
        }

        if (creditUtilization === null || creditUtilization < 0 || creditUtilization > 100) {
            return res.status(400).json({
                success: false,
                message: "creditUtilization must be between 0-100",
            });
        }

        if (loans === null || loans < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid loans count",
            });
        }

        let score = 300;

        if (paymentHistory === "good") score += 200;
        else if (paymentHistory === "average") score += 100;

        if (creditUtilization < 30) score += 200;
        else if (creditUtilization < 50) score += 100;

        if (loans < 3) score += 100;

        if (score > 900) score = 900;

        let rating =
            score > 750 ? "Excellent" :
                score > 650 ? "Good" :
                    score > 550 ? "Average" : "Poor";

        return res.status(200).json({
            success: true,
            data: {
                estimatedScore: score,
                rating,
            },
        });

    } catch (err) {
        next(err);
    }
};