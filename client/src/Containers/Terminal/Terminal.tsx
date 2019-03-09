import React, {useEffect} from 'react';
import {Terminal as Term} from 'xterm';

const Terminal = () => {

    let container!: HTMLDivElement;

    
    useEffect(() => {
        const term = new Term();
        term.open(container);
        term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
      }, [container])

      
        return (
          <div className="App" ref={ref => {
              ref ? container = ref : null
          }}>
          </div>
        );
}
export default Terminal;