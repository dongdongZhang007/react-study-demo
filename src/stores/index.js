import ProductsStore from './products';
import CartStore from './cart';
import CounterStore from './counter';

// 集中管理store的写法一
class RootStore {
    constructor() {
        this.productsStore = new ProductsStore(this);
        this.cartStore = new CartStore(this);
        this.counterStore = new CounterStore(this);
    }
}

const rootStore = new RootStore();

export default rootStore;

// // 集中管理store的写法二
// import { createContext, useContext } from 'react';
// export class Store {
//     lineChartStore: LineChartStore = new LineChartStore(this);
// }

// const store = createContext(Store);
// export function useStore() {
//     return useContext(store);
// }
