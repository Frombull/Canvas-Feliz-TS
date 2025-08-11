class PolygonAnimation {
  static keyframes: Map<number, Map<number, Vertex[]>> = new Map(); // Map<frame, Map<polygonId, vertexArray>>
  static isPlaying: boolean = false;
  static currentFrame: number = 0;
  static maxFrames: number = 60;
  static frameRate: number = 24;
  static loopAnimation: boolean = true;

  // Selected keyframe for editing
  static selectedKeyframe: number | null = null;
  
  static reset() {
    PolygonAnimation.keyframes = new Map();
    PolygonAnimation.currentFrame = 0;
    PolygonAnimation.isPlaying = false;
    PolygonAnimation.selectedKeyframe = null;
  }
  
  static togglePlayback() {
    PolygonAnimation.isPlaying = !PolygonAnimation.isPlaying;
    
    // Update UI based on animation state
    const animationPanel = select('.animation-panel');
    if (animationPanel) {
      if (PolygonAnimation.isPlaying) {
        animationPanel.addClass('playing');
      } else {
        animationPanel.removeClass('playing');
      }
    }
    
    // Update button text
    const playPauseButton = select('.play-animation-button');
    if (playPauseButton) {
      if (PolygonAnimation.isPlaying) {
        playPauseButton.html('⏸ Pause');
      } else {
        playPauseButton.html('▶ Play');
      }
    }
  }
  
  static updateAnimation() {
    if (!PolygonAnimation.isPlaying) return;
    
    // Update frame counter
    PolygonAnimation.currentFrame += 1;
    
    // Update UI
    AnimationUI.updateFramePosition();
    
    // Loop or stop at end
    if (PolygonAnimation.currentFrame >= PolygonAnimation.maxFrames) {
      if (PolygonAnimation.loopAnimation) {
        PolygonAnimation.currentFrame = 0;
      } else {
        PolygonAnimation.currentFrame = PolygonAnimation.maxFrames;
        PolygonAnimation.isPlaying = false;
        AnimationUI.updatePlayButton();
      }
    }
    
    // Apply interpolated state to polygons
    PolygonAnimation.applyInterpolatedState();
  }
  
  static addKeyframe() {
    if (!selectedPolygon) return;
    
    // Create new keyframe entry if it doesn't exist
    if (!PolygonAnimation.keyframes.has(PolygonAnimation.currentFrame)) {
      PolygonAnimation.keyframes.set(PolygonAnimation.currentFrame, new Map());
    }
    
    // Get the frame's polygon map
    const frameData = PolygonAnimation.keyframes.get(PolygonAnimation.currentFrame)!;
    
    // Save deep copy of polygon vertices
    frameData.set(selectedPolygon.id, selectedPolygon.copyVertices(selectedPolygon.vertices));
    
    console.log(`Added keyframe at frame ${PolygonAnimation.currentFrame} for polygon ${selectedPolygon.id}`);
    
    // Update UI to show keyframe marker
    AnimationUI.updateKeyframeMarkers();
  }
  
  static deleteKeyframe() {
    if (!selectedPolygon) return;
    
    // Check if keyframe exists
    if (!PolygonAnimation.keyframes.has(PolygonAnimation.currentFrame)) return;
    
    const frameData = PolygonAnimation.keyframes.get(PolygonAnimation.currentFrame)!;
    
    // Remove this polygon's data from the frame
    frameData.delete(selectedPolygon.id);
    
    // If frame is now empty, remove the entire frame
    if (frameData.size === 0) {
      PolygonAnimation.keyframes.delete(PolygonAnimation.currentFrame);
    }
    
    console.log(`Deleted keyframe at frame ${PolygonAnimation.currentFrame} for polygon ${selectedPolygon.id}`);
    
    // Update UI
    AnimationUI.updateKeyframeMarkers();
  }
  
  static hasKeyframeAt(frame: number, polygonId?: number): boolean {
    if (!PolygonAnimation.keyframes.has(frame)) return false;
    
    // If polygon ID provided, check if that specific polygon has a keyframe
    if (polygonId !== undefined) {
      const frameData = PolygonAnimation.keyframes.get(frame)!;
      return frameData.has(polygonId);
    }
    
    return true;
  }
  
  static getAllKeyframeFrames(): number[] {
    return Array.from(PolygonAnimation.keyframes.keys()).sort((a, b) => a - b);
  }
  
  static getPolygonKeyframes(polygonId: number): number[] {
    const frames: number[] = [];
    
    PolygonAnimation.keyframes.forEach((frameData, frameNumber) => {
      if (frameData.has(polygonId)) {
        frames.push(frameNumber);
      }
    });
    
    return frames.sort((a, b) => a - b);
  }
  
  static applyInterpolatedState() {
    // Process each polygon
    for (const polygon of polygonsList) {
      const polygonId = polygon.id;
      
      // Get all keyframes for this polygon
      const keyframeIndices = PolygonAnimation.getPolygonKeyframes(polygonId);
      
      // Skip if less than 2 keyframes (need at least 2 for interpolation)
      if (keyframeIndices.length < 2) continue;
      
      // Find surrounding keyframes
      let prevKeyframeIndex = -1;
      let nextKeyframeIndex = -1;
      
      for (let i = 0; i < keyframeIndices.length; i++) {
        if (keyframeIndices[i] <= PolygonAnimation.currentFrame) {
          prevKeyframeIndex = keyframeIndices[i];
        }
        
        if (keyframeIndices[i] >= PolygonAnimation.currentFrame && nextKeyframeIndex === -1) {
          nextKeyframeIndex = keyframeIndices[i];
        }
      }
      
      // If we're exactly on a keyframe, apply it directly
      if (prevKeyframeIndex === PolygonAnimation.currentFrame) {
        const keyframeData = PolygonAnimation.keyframes.get(prevKeyframeIndex)!.get(polygonId)!;
        polygon.vertices = polygon.copyVertices(keyframeData);
        continue;
      }
      
      // If we're after the last keyframe, use the last one
      if (prevKeyframeIndex !== -1 && nextKeyframeIndex === -1) {
        const keyframeData = PolygonAnimation.keyframes.get(prevKeyframeIndex)!.get(polygonId)!;
        polygon.vertices = polygon.copyVertices(keyframeData);
        continue;
      }
      
      // If we're before the first keyframe, use the first one
      if (prevKeyframeIndex === -1 && nextKeyframeIndex !== -1) {
        const keyframeData = PolygonAnimation.keyframes.get(nextKeyframeIndex)!.get(polygonId)!;
        polygon.vertices = polygon.copyVertices(keyframeData);
        continue;
      }
      
      // Interpolate between surrounding keyframes
      if (prevKeyframeIndex !== -1 && nextKeyframeIndex !== -1) {
        const prevVertices = PolygonAnimation.keyframes.get(prevKeyframeIndex)!.get(polygonId)!;
        const nextVertices = PolygonAnimation.keyframes.get(nextKeyframeIndex)!.get(polygonId)!;
        
        // Calculate interpolation factor (0 to 1)
        const frameDiff = nextKeyframeIndex - prevKeyframeIndex;
        const t = (PolygonAnimation.currentFrame - prevKeyframeIndex) / frameDiff;
        
        // Interpolate each vertex
        const interpolatedVertices: Vertex[] = [];
        
        // Only interpolate if vertex counts match
        if (prevVertices.length === nextVertices.length) {
          for (let i = 0; i < prevVertices.length; i++) {
            const x = prevVertices[i].x + (nextVertices[i].x - prevVertices[i].x) * t;
            const y = prevVertices[i].y + (nextVertices[i].y - prevVertices[i].y) * t;
            interpolatedVertices.push({x, y});
          }
          
          polygon.vertices = interpolatedVertices;
        }
      }
    }
  }
  
  static jumpToFrame(frame: number) {
    PolygonAnimation.currentFrame = Math.max(0, Math.min(PolygonAnimation.maxFrames, frame));
    AnimationUI.updateFramePosition();
    
    // Apply the state at this frame
    PolygonAnimation.applyInterpolatedState();
  }
  
  static drawAnimationState() {
    // Visualization for current animation state
    if (selectedPolygon) {
      const polygonId = selectedPolygon.id;
      const keyframeIndices = PolygonAnimation.getPolygonKeyframes(polygonId);
      
      // If there are keyframes for this polygon, draw a visual indicator
      if (keyframeIndices.length > 0) {
        push();
        noStroke();
        fill(Colors.orange);
        textSize(3);
        textAlign(CENTER, CENTER);
        
        const center = selectedPolygon.getCenter();
        text(`${keyframeIndices.length} keyframes`, center.x, center.y - 15);
        
        // If the current frame has a keyframe for this polygon, highlight it
        if (PolygonAnimation.hasKeyframeAt(PolygonAnimation.currentFrame, polygonId)) {
          stroke(Colors.orange);
          strokeWeight(2);
          noFill();
          ellipse(center.x, center.y, 8);
        }
        
        pop();
      }
    }
  }
  
  static nextKeyframe() {
    if (!selectedPolygon) return;
    
    const polygonId = selectedPolygon.id;
    const keyframeIndices = PolygonAnimation.getPolygonKeyframes(polygonId);
    
    if (keyframeIndices.length === 0) return;
    
    // Find next keyframe
    for (const frame of keyframeIndices) {
      if (frame > PolygonAnimation.currentFrame) {
        PolygonAnimation.jumpToFrame(frame);
        return;
      }
    }
    
    // If no next keyframe, loop to first
    PolygonAnimation.jumpToFrame(keyframeIndices[0]);
  }
  
  static prevKeyframe() {
    if (!selectedPolygon) return;
    
    const polygonId = selectedPolygon.id;
    const keyframeIndices = PolygonAnimation.getPolygonKeyframes(polygonId);
    
    if (keyframeIndices.length === 0) return;
    
    // Find previous keyframe (searching in reverse)
    for (let i = keyframeIndices.length - 1; i >= 0; i--) {
      if (keyframeIndices[i] < PolygonAnimation.currentFrame) {
        PolygonAnimation.jumpToFrame(keyframeIndices[i]);
        return;
      }
    }
    
    // If no previous keyframe, loop to last
    PolygonAnimation.jumpToFrame(keyframeIndices[keyframeIndices.length - 1]);
  }
}