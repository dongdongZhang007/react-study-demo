import React from 'react';
import { observer, inject } from 'mobx-react';

const Carts = inject('cartStore')(observer(class Carts extends React.Component {
    render() {
        const { cartStore } = this.props;

        return (
            <div>
                <h2>Carts</h2>
                <ul>
                    {
                        cartStore.cartProducts.map((item, key) => {
                            return <li key={item.id}>
                                {item.title} - {item.price * item.quantity} 
                            </li>
                        })
                    }
                </ul>
                <p>total: {cartStore.totalPrice}</p>
                <p>
                    <button disabled={!cartStore.items.length}> CheckOut</button>
                </p>
            </div>
        )
    }
}));

export default Carts