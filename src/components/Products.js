import React from 'react';
import { observer, inject } from 'mobx-react';

const Products = inject('productsStore', 'cartStore')(observer(class Products extends React.Component {
    
    componentDidMount() {
        this.props.productsStore.getAllProducts();
    }

    render() {
        const { productsStore, cartStore } = this.props;
        return (
            <div>
                <h2>Products</h2>
                <ul>
                    {productsStore.all.map((item, key) => {
                        return <li key={key}>
                            {item.title} - {item.price} * { item.inventory}
                            <br/>
                            <button 
                                disabled={!item.inventory}
                                onClick={()=> cartStore.addProduct(item)}>
                                    {item.inventory ? 'Add to Cart' : 'Sold out'}
                            </button>
                        </li>
                    })}
                </ul>
            </div>
        )
    }
}));

export default Products