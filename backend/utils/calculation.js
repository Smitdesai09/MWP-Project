<<<<<<< HEAD
const calculation = ({ targetCorpus, horizonyear, excpectedReturnPr, inflationPr, planType, progressCorpus = 0 }) => {

    const inflationRate = inflationPr / 100;
    const annualReturnRate = excpectedReturnPr / 100;
    const monthlyReturnRate = annualReturnRate / 12;
    const totalMonths = horizonyear * 12;
=======
const calculation = ({ targetCorpus,horizonyear,excpectedReturnPr,inflationPr,planType,progressCorpus=0}) =>{

    const inflationRate = inflationPr/100;
    const annualReturnRate = excpectedReturnPr/100;
    const monthlyReturnRate = annualReturnRate/12;
    const totalMonths = horizonyear*12;
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6

    // futuretargetCorpus

    const futureTargetCorpus = targetCorpus * Math.pow((1 + inflationRate), horizonyear)

    // suggestedSipMonthly

    let suggestedSipMonthly = 0
    if (monthlyReturnRate > 0) {
        suggestedSipMonthly =
            (futureTargetCorpus * monthlyReturnRate) /
            (Math.pow((1 + monthlyReturnRate), totalMonths) - 1)
    }

    //suggestedLumpSum

    let suggestedLumpSum = 0
    if (annualReturnRate > 0) {
        suggestedLumpSum =
            futureTargetCorpus / Math.pow((1 + annualReturnRate), horizonyear)
    }

    // progress %
<<<<<<< HEAD
    let progressPr = futureTargetCorpus > 0 ? (progressCorpus / futureTargetCorpus) * 100 : 0;
=======
    let progressPr = futureTargetCorpus>0 ? (progressCorpus/futureTargetCorpus)*100 : 0;
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6

    // status
    let status = 'off_track'

<<<<<<< HEAD
    if (progressPr >= 75) {
        status = 'on_track'
    }
    else if (progressPr >= 40) {
        status = 'off_track'
    }
    else {
        status = 'at_risk'
    }

    return {
        futureTargetCorpus: Number(futureTargetCorpus.toFixed(2)),
        suggestedSipMonthly: planType === 'sip' ? Number(suggestedSipMonthly.toFixed(2)) : 0,
        suggestedLumpSum: planType === 'lump_sum' ? Number(suggestedLumpSum.toFixed(2)) : 0,
        progressPr: Number(progressPr.toFixed(2)),
=======
    if(progressPr>=75){
        status='on_track'
    }
    else if(progressPr>=40){
        status='off_track'
    }
    else{
        status='at_risk'
    }

    return{
        futureTargetCorpus:Number(futureTargetCorpus.toFixed(2)),
        suggestedSipMonthly:planType==='sip'?Number(suggestedSipMonthly.toFixed(2)):0,
        suggestedLumpSum:planType==='lump_sum'?Number(suggestedLumpSum.toFixed(2)):0,
        progressPr:Number(progressPr.toFixed(2)),
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6
        status
    }
}

module.exports = calculation;