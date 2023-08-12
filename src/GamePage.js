import React, { useState } from 'react';
import Game from './Game';

const GamePage = () => {
    const [setPrePare] = useState(false)
    return (
        <Game setPrePare={setPrePare}/>
    )
}
export default GamePage