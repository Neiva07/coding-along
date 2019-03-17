import React from 'react'
import Terminal from './Terminal'

const TerminalBox = () => {
    
    return (
        <div style={{
            maxWidth: 700,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto '
        }}>
            <Terminal />
        </div>
    )
}

export default TerminalBox;