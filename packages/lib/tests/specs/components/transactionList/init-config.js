Object.assign(window, {
    testConfig: {
        showDetails: {
            transaction: false,
            balanceAccount: true,
        },
        onTransactionSelected: null,
        onBalanceAccountSelected: null,
        onAccountSelected: function ({ showModal }) {
            showModal();
        },
        onFilterChange: () => {},
    },
});
