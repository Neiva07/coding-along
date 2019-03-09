import React, {useEffect} from 'react';
import {Terminal as Term} from 'xterm';

const Terminal = () => {

    let container!: HTMLDivElement;

    
    useEffect(() => {
        const term = new Term();
        term.open(container);
        term.write('code-along:\x1B[1;3;31m~Lucas-PC\x1B[0m $ ')
        term.focus()
        term.on("key", (key, ev) => {
            term.write(key);
        })
      }, [container])

      
        return (
          <div className="terminal" ref={ref => {
              ref ? container = ref : null
          }}>
          </div>
        );
}
export default Terminal;