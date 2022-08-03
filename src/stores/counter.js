import { 
    observable, 
    action,
    computed, 
    // autorun, 
    makeObservable,
    configure,
    runInAction,
    // when,
    // reaction,
} from 'mobx';

// 配置Configure 会导致 Mobx 告警，可观测对象值的修改只能在 action 中完成
// mobx.esm.js:1978 [MobX] Since strict-mode is enabled, changing (observed) observable values without using an action is not allowed. Tried to modify: Store@1.count
configure({
    enforceActions: 'observed'
});

// 初始化 mobx 容器仓库
class CounterStore {
    price = 10;
    count = 5;
    foo = 'bar';
    constructor(rootStore) {
        this.rootStore = rootStore; // 通过子容器访问到根容器

        makeObservable(this, {
            price: observable,
            count: observable,
            foo: observable,
            totalPrice: computed,
            increment: action.bound,
            decrement: action.bound,
            changeCount: action.bound,
            asyncChange: action.bound,
        });
    }
    // 计算属性，本质是方法，封装计算逻辑，缓存计算结果
    get totalPrice() {
        return this.price * this.count;
    }

    increment = () => {
        this.count++;
    }

    decrement = () => {
        this.count--;
        if(this.count < 0) {
            this.count = 0;
        }
    }

    changeCount = (value = 20) => {
        this.count = value;
    }

    asyncChange = () => {
        setTimeout(() => {
            // this.count = 100; // 不推荐
            // 不能直接在容器外操作容器状态，有三种方式
            // 1. 定义 action 函数
            // this.changeCount();
            
            // 2. 直接调用 action 函数, 定义了一个函数并调用
            // action('changeFoo', ()=>{
            //   this.foo = 'switch';
            // })();
    
            // 3. runInAction
            runInAction(() => {
            this.count = 100;
            });
        }, 100);
    }
}


// // 在组件中发起 action 修改容器状态
// const store = new CounterStore();

// // autorun 默认执行一次，
// // 然后是当内部所依赖的被观测的数据发生改变的时候重新出发执行
// autorun(() => {
//     // 如果foo不添加observble修饰，则只能改变一次状态
//     console.log('autorun => ', store.foo, store.count);
// });

// // store.foo = 'foo';
// // store.count = 2;

// runInAction(() => {
//     // store.foo = 'hello';
//     // store.count = 10;
//     store.asyncChange();
// });

// // 当 count > 100 的时候，只执行一次自定义逻辑
// when(
//     () => {
//         return store.count > 100;
//     },
//     () => {
//         console.log('when => ', store.count);
//     }
// )

// // 不同于 autorun 和 when, reaction 只有当被观测的数据发生改变的时候，才会执行
// reaction(
//     () => {
//         // 执行一些业务逻辑操作，返回数据给下一个函数使用
//         return store.count;
//     }, 
//     (data, reaction) => {
//         // data 是上一个函数的返回结果
//         console.log('reaction => ', data);

//         // 手动停止当前 reaction 的监听
//         // reaction.dispose();
//     }
// );

// store.changeCount(200);
// store.changeCount(300);

export default CounterStore
