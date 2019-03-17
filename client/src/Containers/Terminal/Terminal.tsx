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


const Term = (props : Props) => {
    let term : Terminal;
    let fontSize : number = 16;
    let container!: HTMLDivElement;
    let pid: string;
    let webSocket : WebSocket;
    const WEB_SOCKET_URL = `ws://${HOST}:${PORT}/terminals/`;


    Terminal.applyAddon(fullscreen);
    Terminal.applyAddon(fit);
    Terminal.applyAddon(search);
    Terminal.applyAddon(webLinks);
    Terminal.applyAddon(attach);
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
          const url = `http://${PORT}/terminals/?cols=${cols}&rows=${rows}`;
          await axios({
            method:'POST',
            url
          })
        })
        console.log('ola')
        connectToServer();

    }, [container])

    const connectToServer = async () => {
      const serverResponse:any = await axios({
        url : `http://${HOST}:${PORT}/terminals/?cols=${term.cols}&rows=${term.rows}`,
        method: 'POST'
      })
      const processId:string = serverResponse.text();
      pid = processId;
      webSocket = new WebSocket(WEB_SOCKET_URL + processId);
      webSocket.onopen = () => {
        console.log('óla')
        //@ts-ignore
        term.attach(webSocket);
      }
      webSocket.onclose = () => {
        //@ts-ignore
        term.dettach()
      }
      webSocket.onerror = () => {
        term.writeln('Ooops! Something went wrong! Try to refresh the page :)');
      }

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