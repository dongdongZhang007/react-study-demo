import React from 'react';
import {
  BrowserRouter,
  Switch,
  Route,
  Link
} from "react-router-dom";
// import logo from './logo.svg';
import './App.css';
import Counter from './components/Counter';
import LineChart from './components/LineChart';
import ShoppingCart from './components/ShoppingCart';

function Home() {
  return (<>
    <LineChart/>
  </>)
}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Link to="./cart">购物车案例</Link> &nbsp;
        <Link to="./counter">计数器案例</Link>
      </div>
      <Switch>
        <Route path="/" component={Home}></Route>
        <Route path="/cart" component={ShoppingCart}></Route>
        <Route path="/counter" component={Counter}></Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
