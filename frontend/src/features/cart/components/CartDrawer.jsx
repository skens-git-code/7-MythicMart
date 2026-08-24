import React from 'react';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useUI } from '../../../context/UIContext';
import { formatPrice } from '../../../utils/formatters';
import { ROUTES, toHashPath } from '../../../utils/routes';
import Modal from '../../../components/common/Modal';
import '../../../styles/CartDrawer.css';

const CartDrawer = () => {
  const { isCartOpen, closeCart } = useUI();
  const { items, updateQuantity, removeItem, totalPrice, totalCount } = useCart();

  const handleCheckoutClick = () => {
    closeCart();
    window.location.hash = toHashPath(ROUTES.CHECKOUT);
  };

  const cartFooter = items.length > 0 ? (
    <div>
      <div className="cart-subtotal" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', marginBottom: '10px', color: 'var(--text)' }}>
        <span>Subtotal</span>
        <strong>{formatPrice(totalPrice)}</strong>
      </div>
      <p className="tax-shipping-note" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px', textAlign: 'center' }}>Taxes and shipping calculated at checkout</p>
      <button className="cta-button" style={{ width: '100%' }} onClick={handleCheckoutClick}>
        Checkout <ArrowRight size={18} />
      </button>
    </div>
  ) : null;

  return (
    <Modal
      isOpen={isCartOpen}
      onClose={closeCart}
      className="cart-modal"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
          Your Cart <span className="cart-count-badge" style={{ background: 'var(--clr-primary)', color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>{totalCount}</span>
        </div>
      }
      footer={cartFooter}
    >
      <div className="cart-body">
        {items.length === 0 ? (
          <div className="cart-empty" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            <ShoppingBag size={48} className="empty-icon" style={{ color: 'var(--clr-primary)', opacity: 0.5, marginBottom: '20px' }} />
            <p className="elegant-text" style={{ marginBottom: '20px' }}>Your cart is empty.</p>
            <button className="hero-btn outline" onClick={closeCart}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <ul className="cart-items-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {items.map(item => (
              <li key={item.id} className="cart-item glass-card" style={{ padding: '15px', display: 'flex', gap: '15px' }}>
                <img src={item.image} alt={item.name} className="cart-item-image" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} loading="lazy" />
                <div className="cart-item-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="cart-item-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text)' }}>{item.name}</h3>
                    <button
                      className="item-remove-btn"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                      style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '5px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="cart-item-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <div className="qty-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2px 10px' }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}
                      >-</button>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}
                      >+</button>
                    </div>
                    <span className="cart-item-price" style={{ fontWeight: 'bold', color: 'var(--text)' }}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default CartDrawer;
