/* import { Currency } from '@prisma/client'; */
import { round2 } from './round2';

export type Currency = 'PEN' | 'USD';

export const calculatePaymentAmount = ({
    sourceCurrency,
    currencyRate,
    detractionRate,
    netWorth,
    retentionRate,
    usesPorcentages = true,
}: {
    netWorth: number;
    detractionRate: number;
    retentionRate: number;
    currencyRate: number;
    sourceCurrency: Currency;
    usesPorcentages?: boolean;
    targetCurrency?: Currency;
}) => {
    const extractIgvRate = 1.18;
    let detraction = 0;
    let retention = 0;
    const targetCurrency: Currency = 'PEN';
    // Convertimos y redondeamos el neto en la moneda objetivo
    let convertedNetWorth = netWorth;
    if (sourceCurrency !== targetCurrency) {
        convertedNetWorth = round2(netWorth * currencyRate);
    } else {
        convertedNetWorth = round2(netWorth);
    }

    const netWorthWithoutIgv = convertedNetWorth / extractIgvRate;
    const totalIgv = round2(convertedNetWorth - netWorthWithoutIgv);
    // if (sourceCurrency !== targetCurrency) {
    //     netWorthWithoutIgv = round2((convertedNetWorth / extractIgvRate));
    // } else {
    //     netWorthWithoutIgv = round2(convertedNetWorth / extractIgvRate);
    // }

    if (usesPorcentages) {
        detraction = round2(convertedNetWorth * (detractionRate / 100));
        const baseForRetention = round2(detraction ? convertedNetWorth - detraction : convertedNetWorth);
        retention = round2(baseForRetention * (retentionRate / 100));
    } else {
        detraction = round2(convertedNetWorth * detractionRate);
        const baseForRetention = round2(detraction ? convertedNetWorth - detraction : convertedNetWorth);
        retention = round2(baseForRetention * retentionRate);
    }

    const totalPayment = round2(convertedNetWorth - detraction - retention);

    let reconvertedTotalPayment = totalPayment;
    let reconvertedDetraction = detraction;
    let reconvertedRetention = retention;
    if (sourceCurrency !== targetCurrency) {
        reconvertedTotalPayment = round2(totalPayment / currencyRate);
        reconvertedDetraction = round2(detraction / currencyRate);
        reconvertedRetention = round2(retention / currencyRate);
    }

    return {
        detraction,
        retention,
        convertedNetWorth, //this the total amount
        convertedNetWorthWithoutIgv: netWorthWithoutIgv,
        convertedTotalIgv: totalIgv,
        totalPayment,
        reconvertedTotalPayment,
        reconvertedDetraction,
        reconvertedRetention,
    };
};

export const calculateTotals = ({
    sourceCurrency,
    currencyRate,
    detractionRate,
    netWorth,
    retentionRate,
    usesPorcentages = true,
}: {
    netWorth: number;
    detractionRate: number;
    retentionRate: number;
    currencyRate: number;
    sourceCurrency: Currency;
    usesPorcentages?: boolean;
}) => {
    const extractIgvRate = 1.18;
    let detraction = 0;
    let retention = 0;
    const targetCurrency: Currency = 'USD';
    // Convertimos y redondeamos el neto en la moneda objetivo
    // let convertedNetWorth = netWorth;
    // if (sourceCurrency !== targetCurrency) {
    //     convertedNetWorth = round2(netWorth * currencyRate);
    // } else {
    //     convertedNetWorth = round2(netWorth);
    // }

    const {
        retention: penRetention,
        detraction: penDetraction,
        reconvertedDetraction,
        reconvertedRetention,
        totalPayment: penTotalPayment,
    } = calculatePaymentAmount({
        sourceCurrency,
        currencyRate,
        detractionRate,
        netWorth,
        retentionRate,
        usesPorcentages,
    });

    const netWorthWithoutIgv = netWorth / extractIgvRate;
    const totalIgv = round2(netWorth - netWorthWithoutIgv);
    // if (sourceCurrency !== targetCurrency) {
    //     netWorthWithoutIgv = round2((convertedNetWorth / extractIgvRate));
    // } else {
    //     netWorthWithoutIgv = round2(convertedNetWorth / extractIgvRate);
    // }

    if (usesPorcentages) {
        detraction = round2(netWorth * (detractionRate / 100));
        const baseForRetention = round2(detraction ? netWorth - detraction : netWorth);
        retention = round2(baseForRetention * (retentionRate / 100));
    } else {
        detraction = round2(netWorth * detractionRate);
        const baseForRetention = round2(detraction ? netWorth - detraction : netWorth);
        retention = round2(baseForRetention * retentionRate);
    }

    const totalPayment = round2(netWorth - detraction - retention);

    return {
        detraction,
        retention,
        penDetraction,
        penRetention,
        netWorthWithoutIgv,
        totalIgv,
        finalNetworth: netWorth,
        totalPayment,
    };
};
