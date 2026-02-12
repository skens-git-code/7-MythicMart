/* Utility functions for formatting display values */

/* Format a number as USD currency (e.g. $19.99) */
export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};

/* Abbreviate large counts (e.g. 5000 → "5k+") */
export const formatCount = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(0)}k+`;
    return String(count);
};

/* Truncate text with ellipsis at max length */
export const truncateText = (text, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trimEnd() + '…';
};
