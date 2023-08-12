export function drawSegment(ctx, [mx, my], [tx, ty], color) {
    ctx.beginPath()
    ctx.moveTo(mx, my)  
    ctx.lineTo(tx, ty)
    ctx.lineWidth = 6
    ctx.strokeStyle = color
    ctx.stroke()  
}

export function drawPoint(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI); 
    ctx.fillStyle = color;
    ctx.fill();  
}

export const drawCanvas = (pose, videoWidth, videoHeight, canvasRef, flapRef) => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);  
    canvasRef.current.width = videoWidth 
    canvasRef.current.height = videoHeight 

    const keypoints = pose[0].keypoints
    keypoints.map(keypoint => {
      if (keypoint.score > 0.2) {
        if (!(keypoint.name === 'left_eye' || keypoint.name === 'right_eye')) {
          // draw points
          let color = flapRef.current ? 'rgb(0,255,0' : 'rgb(255,255,255)'
          drawPoint(ctx, keypoint.x , keypoint.y , 10, color)
          // draw connections
          let connections = keypointConnections[keypoint.name]  
          try {
            connections.forEach((connection) => {
              let conName = connection.toUpperCase()  
              drawSegment(ctx, [keypoint.x , keypoint.y ],
                [keypoints[POINTS[conName]].x ,
                keypoints[POINTS[conName]].y ]
                , color)
            })
          } catch (err) {
          }
        }
      }
      return keypoint
    })
  }


export const keypointConnections = {
    nose: ['left_ear', 'right_ear'],
    left_ear: ['left_shoulder'],
    right_ear: ['right_shoulder'],
    left_shoulder: ['right_shoulder', 'left_elbow', 'left_hip'],
    right_shoulder: ['right_elbow', 'right_hip'],
    left_elbow: ['left_wrist'],
    right_elbow: ['right_wrist'],
    left_hip: ['left_knee', 'right_hip'],
    right_hip: ['right_knee'],
    left_knee: ['left_ankle'],
    right_knee: ['right_ankle']
}

export const POINTS = {
    NOSE : 0,
    LEFT_EYE : 1,
    RIGHT_EYE : 2,
    LEFT_EAR : 3,
    RIGHT_EAR : 4,
    LEFT_SHOULDER : 5,
    RIGHT_SHOULDER : 6,
    LEFT_ELBOW : 7,
    RIGHT_ELBOW : 8,
    LEFT_WRIST : 9,
    RIGHT_WRIST : 10,
    LEFT_HIP : 11,
    RIGHT_HIP : 12,
    LEFT_KNEE : 13,
    RIGHT_KNEE : 14,
    LEFT_ANKLE : 15,
    RIGHT_ANKLE : 16,
}