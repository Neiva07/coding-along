import React, {useEffect} from 'react';
import { Terminal} from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit'
import * as attach from 'xterm/lib/addons/attach/attach'
import * as fullscreen from 'xterm/lib/addons/fullscreen/fullscreen'
import * as search from 'xterm/lib/addons/search/search'
import * as winptyCompat from 'xterm/lib/addons/winptyCompat/winptyCompat'
import * as webLinks from 'xterm/lib/addons/webLinks/webLinks'
import axios from 'axios'
import {PORT, HOST} from '../../config'

interface Props {
  options?: {
  }
}

type FixTerminal = Terminal & {
  winptyCompatInit: Function;
  fit: Function;
  webLinksInit: Function;
}


const Term = (props : Props) => {
    // let term
    //  : Terminal;
    let fontSize  = 16;
    let container!: HTMLDivElement;
    let pid: number;
    let webSocket : WebSocket;
    const WEB_SOCKET_URL = `ws://${HOST}:${PORT}/terminals/`;
    let failures : number = 0;
    let interval : NodeJS.Timeout;


    Terminal.applyAddon(fullscreen);
    Terminal.applyAddon(fit);
    Terminal.applyAddon(search);
    Terminal.applyAddon(webLinks);
    Terminal.applyAddon(attach);
    Terminal.applyAddon(winptyCompat);

    const term = new Terminal({
      cursorBlink: true,
      rows: 15,
      fontSize,
      cursorStyle: "bar",
      rightClickSelectsWord: true
    }) as FixTerminal;
    

    useEffect(() => {
        
        term.open(container)
        term.winptyCompatInit();
        term.fit();
        term.webLinksInit();
        term.write('code-along:\x1B[1;3;31m~Lucas-PC\x1B[0m $ ')
        term.focus()

        term.on('resize', async (size:{cols: number, rows: number}) => {
          const {cols, rows} = size;
          const url = `http://${HOST}:${PORT}/terminals/?cols=${cols}&rows=${rows}`;
          await axios({
            method:'POST',
            url
          })
        })
        console.log('ola')
        connectToServer();
        
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
        term.on('key', (key, ev) => {
          const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;
      
          if (ev.keyCode === 13) {
            term.write('\r\n$ ');
          }
          else if (printable) {
            term.write(key);
          }
        });
        
        

    })

    const connectToServer = async () => {
      const response = await axios({
        url : `http://${HOST}:${PORT}/terminals/?cols=${term.cols}&rows=${term.rows}`,
        method: 'POST'
      })
      if(response.statusText !== "OK"){
          failures =+ 1;
          if(failures === 2) {
            term.writeln(`There is backend server found, but returns ${response.status} ${response.statusText}.`);
          }
          tryAgain();
          return;
      }

      pid = response.data;
      webSocket = new WebSocket(WEB_SOCKET_URL + pid);
      webSocket.onopen = () => {
        console.log('óla')
        //@ts-ignore
        term.attach(webSocket);
      }
      webSocket.onclose = () => {
        //disconnected
        console.log('desconnected')
      }
      webSocket.onerror = () => {
        term.writeln('Ooops! Something went wrong! Try to refresh the page :)');
      }

    }
    const tryAgain = () => {
      clearTimeout(interval);
      interval = setTimeout(() => {
        connectToServer();
      }, 2000);
    }
      
      
    
        return (
            <div className="terminal" 
            style={{
                top: 0, left: 0, width: '100%', height: '100%'
              }}
            ref={ref => {
                ref ? container = ref : null
            }}
            
            >
            </div>
        );
}
export default Term;