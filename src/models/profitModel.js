export const profitModel = (data, profit) => {
    return {
        clientId: data.clientId,
        profit: profit,
        docketNo: data.docketNo
    }
}