import React, { Component, useRef, useEffect } from 'react';
import {Terminal} from 'xterm';


class App extends Component {
  container!: HTMLDivElement;

  constructor(props:any) {
    super(props);
    
  }
  componentDidMount() {
    const term = new Terminal();
    term.open(this.container);
    term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
  }  
  render() {
    return (
      <div className="App" ref={ref => {
          ref ? this.container = ref : null
      }}>
      </div>
    );
  }
  
}

export default App;
