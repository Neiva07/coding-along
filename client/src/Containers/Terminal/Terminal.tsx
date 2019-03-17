import React, {useEffect} from 'react';
import { Terminal} from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit'
import * as fullscreen from 'xterm/lib/addons/fullscreen/fullscreen'
import * as search from 'xterm/lib/addons/search/search'
import * as winptyCompat from 'xterm/lib/addons/winptyCompat/winptyCompat'
import * as webLinks from 'xterm/lib/addons/webLinks/webLinks'
import axios from 'axios'

interface Props {
  options?: {
  }
}


const Term = (props : Props) => {
    let term : Terminal;
    let fontSize : number = 16;
    let container!: HTMLDivElement;
    
    Terminal.applyAddon(fullscreen);
    Terminal.applyAddon(fit);
    Terminal.applyAddon(search);
    Terminal.applyAddon(webLinks);
    Terminal.applyAddon(winptyCompat);

    term = new Terminal({
      cursorBlink: true,
      rows: 15,
      fontSize: 16,
      cursorStyle: "bar",
      rightClickSelectsWord: true
    });

    useEffect(() => {
        
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
        term.textarea.onkeydown = e => {
          console.log(e.keyCode, e.shiftKey, e.ctrlKey, e.altKey);
          // ctrl + shift + metakey + +
          if ((e.keyCode === 187 || e.keyCode === 61) && e.shiftKey && e.ctrlKey && e.altKey) {
            term.setOption('fontSize', ++fontSize);
            //@ts-ignore
            term.fit();
          }
          // ctrl + shift + metakey + -
          if ((e.keyCode === 189 || e.keyCode === 173) && e.shiftKey && e.ctrlKey && e.altKey) {
            term.setOption('fontSize', --fontSize);
            //@ts-ignore
            term.fit();
          }
        }
        term.on('resize', async (size:{cols: number, rows: number}) => {
          const {cols, rows} = size;
          const url = `/terminals/?cols=${cols}&rows=${rows}`;
          await axios({
            method:'POST',
            url
          })
          
        })

    }, [container])

    // term.textarea.onkeydown = e => {
    //     console.log(e.keyCode, e.shiftKey, e.ctrlKey, e.altKey);
    //     // ctrl + shift + metakey + +
    //     if ((e.keyCode === 187 || e.keyCode === 61) && e.shiftKey && e.ctrlKey && e.altKey) {
    //       term.setOption('fontSize', ++fontSize);
    //       //@ts-ignore
    //       term.fit();
    //     }
    //     // ctrl + shift + metakey + -
    //     if ((e.keyCode === 189 || e.keyCode === 173) && e.shiftKey && e.ctrlKey && e.altKey) {
    //       term.setOption('fontSize', --fontSize);
    //       //@ts-ignore
    //       term.fit();
    //     }
      //   // ctrl + shift + metakey + v
      //   if (e.keyCode === 86 && e.shiftKey && e.ctrlKey && e.altKey) {
      //     props.options.splitVertical && props.options.splitVertical();
      //   }
      //   // ctrl + shift + metakey + h
      //   if (e.keyCode === 72 && e.shiftKey && e.ctrlKey && e.altKey) {
      //     props.options.splitHorizontal && props.options.splitHorizontal();
      //   }
      //   // ctrl + shift + metakey + w
      //   if (e.keyCode === 87 && e.shiftKey && e.ctrlKey && e.altKey) {
      //     props.options.close && props.options.close();
      //   }
      // };
    // }
      
      
    
        return (
            <div className="terminal" 
            style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'
              }}
            ref={ref => {
                ref ? container = ref : null
            }}
            
            >
            </div>
        );
}
export default Term;