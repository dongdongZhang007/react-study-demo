import React from 'react';
// import logo from './logo.svg';
// import './App.css';
import Products from './components/Products';
import Cart from './components/Cart';
import Counter from './components/Counter';

function App() {
  return (
    <div className="App">
      <h1>Shopping Cart Example.</h1>
      <hr/>
      <Products/>
      <hr/>
      <Cart/>
      <hr/>
      <Counter/>
    </div>
  );
}

export default App;
