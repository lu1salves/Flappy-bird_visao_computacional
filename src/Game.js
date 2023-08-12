import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import React, { useEffect, useRef, useState } from 'react';
import Webcam from "react-webcam";
import './Game.css';
import exampleImage from './assets/inf.png';
import Bird from "./components/Bird";
import Menu from "./components/Menu";
import Pipe from "./components/Pipe";
import GameParamters from './utils/GameSetting';
import { drawCanvas } from "./utils/canvasUtils";

const Game = ({ setPrePare }) => {
  const birdInitialState = {
    height: GameParamters.bird.initialHeight,
  }

  const pipeInitialState = {
    list: [],
    lastCreateTime: 0
  }

  const playRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const birdRef = useRef(birdInitialState)
  const [style, setStlye] = useState({ transform: `translate(0, ${-GameParamters.bird.initialHeight}px)` })
  const pipeRef = useRef(pipeInitialState)
  const [pipeList, setPipeList] = useState([])
  const scoreRef = useRef(0)
  const [score, setScore] = useState(0)
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [detecting, setDetecting] = useState(false)
  const flapRef = useRef(false)

  const detect = async (detector) => {
    if (typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      const video2 = webcamRef.current.video.videoHeight
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Video width-height
      webcamRef.current.video.width = videoWidth
      webcamRef.current.video.height = videoHeight

      const pose = await detector.estimatePoses(video)

      if (pose[0].keypoints[10].y <= pose[0].keypoints[6].y && pose[0].keypoints[9].y <= pose[0].keypoints[5].y) {
        flapRef.current = false
        console.log(flapRef.current)
      } else if (pose[0].keypoints[10].y > pose[0].keypoints[6].y && pose[0].keypoints[9].y > pose[0].keypoints[5].y && flapRef.current === false) {
        flapRef.current = true
        flap()
        console.log(flapRef.current)
      }
      drawCanvas(pose, videoWidth, videoHeight, canvasRef, flapRef)
      if (!detecting) {
        setDetecting(true)
      }
    }
  }

  useEffect(() => {
    let detector
    (async () => {
      const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
      detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
      setLoading(false)
    })()

    const startGame = setInterval(() => {
      detect(detector)
      if (playRef.current) {

        if (birdRef.current.height >= 10) {
          birdRef.current.height = birdRef.current.height - 10 
          setStlye({ transform: `translate(0, ${-birdRef.current.height}px)` })
        }

        const now = Date.now() 
        if (pipeRef.current.lastCreateTime === 0) {
          pipeRef.current.lastCreateTime = now
        }
        if (now - pipeRef.current.lastCreateTime >= GameParamters.pipings.timeInterval) {
          creatNewPipe(now)
        }
        UpdatePipeList(now)

        scoreDetection()

        collisionDetection()
      }
    }, 100)
    return () => clearInterval(startGame)

  }, [playing,])



  const creatNewPipe = (now) => {
    const pipeLowerShift = GameParamters.pipings.shiftRange.y.min + (GameParamters.pipings.shiftRange.y.max - GameParamters.pipings.shiftRange.y.min) * Math.random()
    const pipeUpperShift = GameParamters.heightLimit - pipeLowerShift - GameParamters.pipings.gap  
    const newPipe = {
      createTime: now,  
      x: 0,  
      pipeLowerShift: pipeLowerShift,  
      pipeUpperShift: pipeUpperShift,  
      topOfPipeLower: 0 + pipeLowerShift,  
      bottomOfPipeUpper: 0 + pipeLowerShift + GameParamters.pipings.gap,  
      isPassed: false
    }
    pipeRef.current.list = pipeRef.current.list.concat(newPipe)
    pipeRef.current.lastCreateTime = now
    setPipeList(pipeRef.current.list)  
  }

  const UpdatePipeList = (now) => {
    const pipeList = [...pipeRef.current.list]
 
    pipeList.map(pipe => {
      if (pipe.x < GameParamters.pipings.shiftRange.x.max) {
        let ratio = (now - pipe.createTime) / GameParamters.pipings.speed  
        if (ratio > 1) {
          ratio = 1  
        }
        pipe.x = ratio * GameParamters.pipings.shiftRange.x.max
      } else {
        pipe.x = GameParamters.pipings.shiftRange.x.max
      }
      return pipe
    }).filter(pipe => {  
      return pipe.x < GameParamters.pipings.shiftRange.x.max
    })
    pipeRef.current.list = pipeList
    setPipeList(pipeRef.current.list) 
  }


  const collisionDetection = () => {
    const pipeList = [...pipeRef.current.list]
    pipeList.map(pipe => {
      if (pipe.x > GameParamters.pipings.interactionX.head && pipe.x < GameParamters.pipings.interactionX.end) {
        const birdBottom = birdRef.current.height
        const birdTop = birdRef.current.height + GameParamters.bird.height
        if (birdBottom < pipe.topOfPipeLower - 2 || birdTop > pipe.bottomOfPipeUpper + 2) {
          playRef.current = false; 
          setPlaying(false)  
        }
      }
      return pipe
    })
  }

  const scoreDetection = () => {
    const pipeList = [...pipeRef.current.list]
    pipeList.map(pipe => {
      if (pipe.x > GameParamters.pipings.interactionX.end && !pipe.isPassed) {
        pipe.isPassed = true
        scoreRef.current = scoreRef.current + 1 
        setScore(scoreRef.current) 
      }
      return pipe
    })
  }

  const onPlay = () => {
    birdRef.current = { ...birdInitialState }
    pipeRef.current = { ...pipeInitialState }
    scoreRef.current = 0
    setStlye({ transform: `translate(0, ${-birdRef.current.height}px)` })
    setPipeList(pipeRef.current.list)
    setScore(0)
    playRef.current = true
    setPlaying(true)
  }

  // bird 
  const flap = () => {
    if (playRef.current && playing)
      birdRef.current.height = birdRef.current.height + 80
    setStlye({ transform: `translate(0, ${-birdRef.current.height}px)` })
  }


  return (
    <div className="background" onMouseDown={flap}>
      <h3 className="loading-status">{
        !playing ?
          loading ? "Carregando o esqueleto...." :
            detecting ? "O esqueleto está pronto, divirta-se!" :
              "O esqueleto está detectando seu corpo, espere um momento..." :
          "Balance seu braço!"
      }</h3>
      <div className="container" >
        <div className="image">
          <img src={exampleImage} alt="Imagem Exemplo"/>
        </div>
        <div className="gameWrapper">
          <div className="game">
            <div className="scene" >
              {(playing) ? <div className="score">{score}</div> : ""}
              <Bird style={style} />
              {
                pipeList.map(pipe => <Pipe key={pipe.createTime} x={pipe.x} pipeLowerShift={pipe.pipeLowerShift} pipeUpperShift={pipe.pipeUpperShift} />)
              }
              <div className={playing ? "ground sliding" : "ground"}></div>
              <Pipe />
              {(!playing) ? <Menu onPlay={onPlay} score={score} /> : ""}
            </div>
          </div>
        </div>
        <div className="videoWrapper">
          <Webcam ref={webcamRef} className="video" />
          <canvas ref={canvasRef} className="video" />
        </div>
      </div>
      <div className="btn-container">
        <button className="btn-screen" onClick={() => { onPlay() }}>Play</button>
      </div>
    </div>

  );
}

export default Game;
