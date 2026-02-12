/* API service layer — handles all backend communication */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const headers = { 'Content-Type': 'application/json' };

/* Fetch all products from the catalog */
export const fetchProducts = async () => {
    const response = await fetch(`${API_BASE}/products`, { headers });
    if (!response.ok) throw new Error(`Failed to fetch products: ${response.status}`);
    return response.json();
};

/* Fetch a single product by ID */
export const fetchProductById = async (id) => {
    const response = await fetch(`${API_BASE}/products/${id}`, { headers });
    if (!response.ok) throw new Error(`Product not found: ${response.status}`);
    return response.json();
};

/* Submit a cart order to the backend */
export const submitOrder = async (cartItems) => {
    const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ items: cartItems }),
    });
    if (!response.ok) throw new Error(`Order failed: ${response.status}`);
    return response.json();
};
