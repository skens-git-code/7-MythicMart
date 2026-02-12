import React, { useCallback } from 'react';
import { ShoppingBag, Check, Truck } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import products from '../../data/products';
import '../../styles/ProductSection.css';

/* Trending products grid with badges, pricing, and add-to-cart */
const ProductSection = () => {
    const { addItem } = useCart();

    const handleAddToCart = useCallback((product) => {
        addItem(product);
    }, [addItem]);

    return (
        <section id="products" className="product-section" aria-label="Trending products">
            <h2 className="section-title">Trending Now</h2>

            <div className="product-grid" role="list">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="product-card"
                        role="listitem"
                        aria-label={`${product.name}, $${product.price.toFixed(2)}`}
                    >
                        {/* Product image with badge */}
                        <div className="product-image-container">
                            <img src={product.image} alt={product.name} className="product-image" />
                            {product.badge && (
                                <span className={`product-badge badge-${product.badge.toLowerCase().replace(' ', '-')}`}>
                                    {product.badge}
                                </span>
                            )}
                        </div>

                        {/* Product info */}
                        <div className="product-details">
                            {/* Stock & shipping meta badges */}
                            <div className="product-meta-row">
                                <div className="meta-badge stock-badge">
                                    <Check size={12} strokeWidth={3} /> In Stock
                                </div>
                                {product.freeShipping && (
                                    <div className="meta-badge shipping-badge">
                                        <Truck size={12} strokeWidth={2.5} /> Free Shipping
                                    </div>
                                )}
                            </div>

                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-description">{product.description}</p>

                            {/* Price + add to cart */}
                            <div className="product-footer">
                                <div className="product-price-container">
                                    <span className="currency-symbol">$</span>
                                    <span className="current-price">{product.price.toFixed(2)}</span>
                                    {product.originalPrice && (
                                        <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                                    )}
                                </div>
                                <button
                                    className="add-btn"
                                    onClick={() => handleAddToCart(product)}
                                    aria-label={`Add ${product.name} to cart`}
                                >
                                    <ShoppingBag size={18} />
                                    <span>Add</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ProductSection;
