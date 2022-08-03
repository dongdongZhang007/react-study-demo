import {
    observable,
    action,
    makeObservable,
} from 'mobx';
import * as shop from '../api/shop'

class ProductsStore {
    all = [];
    foo = 'baz';
    constructor(rootStore) {
        this.rootStore = rootStore; // 通过子容器访问到根容器
        makeObservable(this, { 
            all: observable,
            foo: observable,

            getAllProducts: action.bound,
            setAll: action.bound,
            decrementInventory: action.bound,
        });
    }

    getAllProducts = () => {
        shop.getAllProducts(products => {
            this.setAll(products);
        });
    }

    setAll(products) {
        this.all = products;
    }

    decrementInventory = (product) => {
        const prod = this.all.find(cartItem => cartItem.id === product.id);
        if(prod) {
            prod.inventory--;
        }
    }
}

export default ProductsStore
