import {
    observable,
    action,
    makeObservable,
    computed,
} from 'mobx';

class CartStore {
    // {id: 商品id，quantity: 商品数量}
    items = [];
    foo = 'baz';
    constructor(rootStore) {
        this.rootStore = rootStore; // 通过子容器访问到根容器
        makeObservable(this, { 
            items: observable,
            foo: observable,
            cartProducts: computed,
            totalPrice: computed,
            addProduct: action.bound
        });
    }

    get cartProducts() {
        const productsStore = this.rootStore.productsStore;
        return this.items.map(cartItem => {
            const prod = productsStore.all.find(prodItem => prodItem.id === cartItem.id);
            return {
                id: prod.id,
                title: prod.title,
                price: prod.price,
                quantity: cartItem.quantity,
            }
        })
    }

    get totalPrice() {
        return this.cartProducts.reduce((total, prod) => {
            return total + prod.price * prod.quantity;
        }, 0);
    }

    addProduct = (product) => {
        console.log("addProduct => ", product);
        // 判断购物车数据中是否已经有该商品
        // if has, 数量 + 1, 没有 新添加
        const prod = this.items.find(cartItem => cartItem.id === product.id);
        if(prod) {
            prod.quantity++;
        } else {
            this.items.push({
                id: product.id,
                quantity: 1
            })
        }
        // 库存数据-1
        this.rootStore.productsStore.decrementInventory(product);
    }
}

export default CartStore
