import React from 'react';
import Products from './Products';
import Cart from './Cart';

export default class ShoppingCart extends React.Component {
    render() {
        return (
            <div className="shop-cart-wrapper">
                <div className="nav">
                    <button>Go back</button>
                    <button>Go forward</button>
                </div>
                <h1>Shopping Cart Example.</h1>
                <hr/>
                <Products/>
                <hr/>
                <Cart/>
            </div>
        )
    }
}