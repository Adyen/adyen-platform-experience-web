const getDate = (daysOffset = 0, originDate = new Date()) => {
    const date = new Date(originDate);
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString();
};

export default getDate;
