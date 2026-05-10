import React, { useEffect, useRef } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useUI } from '../../context/UIContext';
import { formatPrice } from '../../utils/formatters';
import '../../styles/CartDrawer.css';

const CartDrawer = () => {
  const { isCartOpen, closeCart } = useUI();
  const { items, updateQuantity, removeItem, totalPrice, totalCount } = useCart();
  const drawerRef = useRef(null);

  /* Close on Escape key */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) closeCart();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  /* Lock body scroll when open */
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-backdrop" onClick={closeCart} aria-hidden="true" />
      <div 
        className="cart-drawer" 
        role="dialog" 
        aria-modal="true" 
        aria-label="Shopping Cart"
        ref={drawerRef}
      >
        <div className="cart-header">
          <h2>Your Cart <span className="cart-count-badge">{totalCount}</span></h2>
          <button className="cart-close-btn" onClick={closeCart} aria-label="Close cart">
            <X size={24} />
          </button>
        </div>

        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={48} className="empty-icon" />
              <p>Your cart is empty.</p>
              <button className="continue-shopping-btn" onClick={closeCart}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="cart-items-list">
              {items.map(item => (
                <li key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-image" loading="lazy" />
                  <div className="cart-item-info">
                    <div className="cart-item-top">
                      <h3>{item.name}</h3>
                      <button 
                        className="item-remove-btn" 
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="cart-item-bottom">
                      <div className="qty-controls">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >-</button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >+</button>
                      </div>
                      <span className="cart-item-price">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <strong>{formatPrice(totalPrice)}</strong>
            </div>
            <p className="tax-shipping-note">Taxes and shipping calculated at checkout</p>
            <button className="checkout-btn">
              Checkout <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
