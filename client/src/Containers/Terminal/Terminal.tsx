import React, {useEffect} from 'react';
import { Terminal} from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit'
import * as fullscreen from 'xterm/lib/addons/fullscreen/fullscreen'
import * as search from 'xterm/lib/addons/search/search'
import * as winptyCompat from 'xterm/lib/addons/winptyCompat/winptyCompat'
import * as webLinks from 'xterm/lib/addons/webLinks/webLinks'




const Term = () => {
    let term : Terminal;

    let container!: HTMLDivElement;

    Terminal.applyAddon(fullscreen);
    Terminal.applyAddon(fit);
    Terminal.applyAddon(search);
    Terminal.applyAddon(webLinks);
    Terminal.applyAddon(winptyCompat);
    

    useEffect(() => {
        term = new Terminal({
      cursorBlink: true,
      rows: 15,
      fontSize: 16,
      cursorStyle: "bar",
      rightClickSelectsWord: true
    });
        term.open(container)
        //@ts-ignore
        term.winptyCompatInit();
        //@ts-ignore
        term.fit();
        term.write('code-along:\x1B[1;3;31m~Lucas-PC\x1B[0m $ ')
        term.focus()
        term.on("key", (key, ev) => {
          term.write(key);
        })

    }, [container])
      
      
    
        return (
            <div className="terminal" 
            ref={ref => {
                ref ? container = ref : null
            }}
            
            >
            </div>
        );
}
export default Term;