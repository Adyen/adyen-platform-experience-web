const products = ['Coffee', 'Muffin', 'Pie', 'Tea', 'Latte', 'Brownie', 'Iced latte', 'Bubble tea', 'Apple pie', 'Iced tea'];
const getProductById = id => {
    const numericId = id.replace(/\D/g, '');
    const index = Number(numericId[numericId.length - 1]);
    return products[index];
};

const stores = ['New York', 'Chicago', 'San Francisco', 'Madrid', 'Singapore', 'Amsterdam', 'London', 'Sydney', 'Melbourne', 'Toronto'];
const getStoreById = id => {
    const numericId = id.replace(/\D/g, '');
    const index = Number(numericId[numericId.length - 1]);
    return stores[index];
};

const txMatcher = data => data.map(({ id }) => ({ id, _product: getProductById(id), _store: getStoreById(id) }));

const getMyCustomData = async data => {
    const customData = txMatcher(data);
    return customData;
};

export default getMyCustomData;
