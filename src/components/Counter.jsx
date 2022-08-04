import React from 'react';
import { observer,inject } from 'mobx-react';

// 在组件中使用 mobx 容器状态
const Counter = inject('counterStore')(observer(class Counter extends React.Component {
  render() {
    const {counterStore, history, location, match} = this.props;
    console.log(history, location, match);

    return (
      <div>
        <div className="nav">
          <button>Go back</button>
          <button>Go forward</button>
        </div>
        <h1>Counter Component</h1>
        <p>{counterStore.count}</p>
        <p><button onClick={counterStore.increment}>increment</button></p>
        <p><button onClick={counterStore.decrement}>decrement</button></p>
        <p>Total: {counterStore.price * counterStore.count}</p>
        <p>Computed Total: {counterStore.totalPrice}</p>
      </div>
    )
  }
}));

export default Counter;
