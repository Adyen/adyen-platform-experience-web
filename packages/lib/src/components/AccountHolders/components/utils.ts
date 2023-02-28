export const getLabel = (key) => {
    const labels = {
        id: 'accountHolderId'
    }

    return labels[key] || key;
};