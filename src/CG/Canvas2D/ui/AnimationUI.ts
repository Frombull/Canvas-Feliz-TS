class AnimationUI {
  static panelVisible: boolean = false;
  static animationPanelDiv: any = null;
  static frameSlider: any = null;
  static frameValueBox: any = null;
  static framerateSlider: any = null;
  static framerateValueBox: any = null;
  static maxFramesSlider: any = null;
  static maxFramesValueBox: any = null;
  static timelineCanvas: any = null;
  static keyframeIndicators: any = null;
  
  static createAnimationPanel() {
    if (AnimationUI.animationPanelDiv) {
      AnimationUI.animationPanelDiv.remove();
    }
  
    AnimationUI.animationPanelDiv = createDiv('').class('control-panel animation-panel');
    AnimationUI.animationPanelDiv.position(windowWidth - SidePanel.controlPanelSize.x, SidePanel.controlPanelSize.y);
  
    let animationSection = createDiv('').class('section').parent(AnimationUI.animationPanelDiv);

    // Back button to return to main panel
    new Button('« Back to Main Panel', animationSection, () => {
      AnimationUI.toggleAnimationPanel(false);
      select('.control-panel')?.style('display', 'block');
    });
  
    createDiv('').class('section-title').html('PolygonAnimation').parent(animationSection);
    
    // ------------------------------ Timeline section ------------------------------
    let timelineContainer = createDiv('').class('timeline-container').parent(animationSection);
    
    // Timeline display
    AnimationUI.createTimelineDisplay(timelineContainer);
    
    // Frame slider
    AnimationUI.createFrameControls(animationSection);
    
    // ------------------------------ Playback Controls ------------------------------
    let playbackControlsContainer = createDiv('').class('playback-controls-container').parent(animationSection);
    let buttonContainer = createDiv('').class('playback-buttons-container').parent(playbackControlsContainer);
    
    // Previous keyframe button
    let prevKeyframeButton = createButton('⏮').class('button prev-keyframe-button').parent(buttonContainer);
    prevKeyframeButton.mousePressed(() => {
      PolygonAnimation.prevKeyframe();
    });
    
    // Play/Pause button
    let playPauseButton = createButton('▶ Play').class('button play-animation-button').parent(buttonContainer);
    playPauseButton.mousePressed(() => {
      PolygonAnimation.togglePlayback();
    });
    
    // Next keyframe button
    let nextKeyframeButton = createButton('⏭').class('button next-keyframe-button').parent(buttonContainer);
    nextKeyframeButton.mousePressed(() => {
      PolygonAnimation.nextKeyframe();
    });
    
    // ------------------------------ Keyframe Controls ------------------------------
    createDiv('').class('section-title').html('Keyframes').parent(animationSection);
    
    let keyframeControlsContainer = createDiv('').class('keyframe-controls-container').parent(animationSection);
    
    // Add keyframe button
    let addKeyframeButton = createButton('+ Add Keyframe').class('button add-keyframe-button').parent(keyframeControlsContainer);
    addKeyframeButton.mousePressed(() => {
      PolygonAnimation.addKeyframe();
    });
    
    // Delete keyframe button
    let deleteKeyframeButton = createButton('- Delete Keyframe').class('button delete-keyframe-button').parent(keyframeControlsContainer);
    deleteKeyframeButton.mousePressed(() => {
      PolygonAnimation.deleteKeyframe();
    });
    
    // ------------------------------ PolygonAnimation Settings ------------------------------
    createDiv('').class('section-title').html('Settings').parent(animationSection);
    
    // Frame rate slider
    let framerateContainer = createDiv('').class('framerate-container').parent(animationSection);
    createDiv('Frame Rate:').parent(framerateContainer);
    
    let framerateSliderContainer = createDiv('').class('slider-container').parent(framerateContainer);
    AnimationUI.framerateSlider = createSlider(1, 60, PolygonAnimation.frameRate, 1).class('slider').parent(framerateSliderContainer);
    AnimationUI.framerateValueBox = createDiv(PolygonAnimation.frameRate.toString()).class('colorpicker-value-box').parent(framerateSliderContainer);
    
    AnimationUI.framerateSlider.input(() => {
      PolygonAnimation.frameRate = Number(AnimationUI.framerateSlider.value());
      AnimationUI.framerateValueBox.html(PolygonAnimation.frameRate.toString());
    });
    
    // Max frames slider
    let maxFramesContainer = createDiv('').class('max-frames-container').parent(animationSection);
    createDiv('Max Frames:').parent(maxFramesContainer);
    
    let maxFramesSliderContainer = createDiv('').class('slider-container').parent(maxFramesContainer);
    AnimationUI.maxFramesSlider = createSlider(10, 300, PolygonAnimation.maxFrames, 10).class('slider').parent(maxFramesSliderContainer);
    AnimationUI.maxFramesValueBox = createDiv(PolygonAnimation.maxFrames.toString()).class('colorpicker-value-box').parent(maxFramesSliderContainer);
    
    AnimationUI.maxFramesSlider.input(() => {
      // If we're making the timeline shorter, adjust current frame if needed
      if (Number(AnimationUI.maxFramesSlider.value()) < PolygonAnimation.currentFrame) {
        PolygonAnimation.currentFrame = Number(AnimationUI.maxFramesSlider.value());
        AnimationUI.updateFramePosition();
      }
      
      PolygonAnimation.maxFrames = Number(AnimationUI.maxFramesSlider.value());
      AnimationUI.maxFramesValueBox.html(PolygonAnimation.maxFrames.toString());
      
      // Update frame slider range
      AnimationUI.frameSlider.attribute('max', PolygonAnimation.maxFrames);
      
      // Redraw timeline
      AnimationUI.updateTimelineDisplay();
    });
    
    // Loop animation checkbox
    let loopContainer = createDiv('').class('loop-container').parent(animationSection);
    let loopAnimationCheckbox: any = createCheckbox('Loop PolygonAnimation', PolygonAnimation.loopAnimation).parent(loopContainer);
    loopAnimationCheckbox.changed(() => {
      PolygonAnimation.loopAnimation = loopAnimationCheckbox.checked();
    });
    
    // Hide panel initially
    AnimationUI.animationPanelDiv.style('display', 'none');
    AnimationUI.panelVisible = false;
  }
  
  static createTimelineDisplay(container: any) {
    let timelineWrapper = createDiv('').class('timeline-wrapper').parent(container);
    
    // Create div for timeline instead of canvas
    AnimationUI.timelineCanvas = createDiv('').class('timeline-canvas').parent(timelineWrapper);
    AnimationUI.timelineCanvas.style('width', '100%');
    AnimationUI.timelineCanvas.style('height', '100%');
    AnimationUI.timelineCanvas.style('background-color', '#eee');
    
    // Create container for keyframe indicators
    AnimationUI.keyframeIndicators = createDiv('').class('keyframe-indicators').parent(timelineWrapper);
    
    // Add frame markers directly as DOM elements
    AnimationUI.updateTimelineDisplay();
  }
  
  static updateTimelineDisplay() {
    // Clear existing timeline elements
    AnimationUI.timelineCanvas.html('');
    
    // Get the width of the timeline container
    const timeline = AnimationUI.timelineCanvas.elt;
    const width = timeline.offsetWidth;
    const height = timeline.offsetHeight;
    
    // Calculate marker intervals based on max frames
    const markerInterval = Math.ceil(PolygonAnimation.maxFrames / 20); // Adjust marker density
    
    // Create and add frame markers as DOM elements
    for (let i = 0; i <= PolygonAnimation.maxFrames; i += markerInterval) {
      const percentage = (i / PolygonAnimation.maxFrames) * 100;
      
      // Major marker every 5 intervals
      const isMajor = i % (markerInterval * 5) === 0;
      
      // Create marker
      const marker = createDiv('').parent(AnimationUI.timelineCanvas);
      marker.class('timeline-marker');
      marker.style('position', 'absolute');
      marker.style('left', `${percentage}%`);
      marker.style('bottom', '0');
      marker.style('width', '1px');
      marker.style('height', isMajor ? '15px' : '8px');
      marker.style('background-color', '#888');
      
      // Create label for major markers
      if (isMajor) {
        const label = createDiv(i.toString()).parent(AnimationUI.timelineCanvas);
        label.class('timeline-marker-label');
        label.style('position', 'absolute');
        label.style('left', `${percentage}%`);
        label.style('bottom', '18px');
        label.style('transform', 'translateX(-50%)');
        label.style('font-size', '10px');
        label.style('color', '#555');
      }
      
      // Add click handler to jump to this frame
      marker.mousePressed(() => {
        PolygonAnimation.jumpToFrame(i);
      });
    }
    
    // Create current frame indicator
    const currentFramePercentage = (PolygonAnimation.currentFrame / PolygonAnimation.maxFrames) * 100;
    
    const frameIndicator = createDiv('').parent(AnimationUI.timelineCanvas);
    frameIndicator.class('current-frame-indicator');
    frameIndicator.style('position', 'absolute');
    frameIndicator.style('left', `${currentFramePercentage}%`);
    frameIndicator.style('top', '0');
    frameIndicator.style('bottom', '0');
    frameIndicator.style('width', '2px');
    frameIndicator.style('background-color', 'rgba(255, 60, 60, 0.8)');
    frameIndicator.style('z-index', '5');
    
    // Add playhead triangle
    const playhead = createDiv('').parent(AnimationUI.timelineCanvas);
    playhead.class('playhead');
    playhead.style('position', 'absolute');
    playhead.style('left', `${currentFramePercentage}%`);
    playhead.style('top', '0');
    playhead.style('width', '0');
    playhead.style('height', '0');
    playhead.style('transform', 'translateX(-50%)');
    playhead.style('border-left', '6px solid transparent');
    playhead.style('border-right', '6px solid transparent');
    playhead.style('border-top', '8px solid rgba(255, 60, 60, 0.8)');
    playhead.style('z-index', '6');
    playhead.style('cursor', 'pointer');
    
    // Make the entire timeline scrubable
    AnimationUI.timelineCanvas.mousePressed(function(event: any) {
      if (PolygonAnimation.isPlaying) return; // Don't allow scrubbing during playback
      
      const rect = AnimationUI.timelineCanvas.elt.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const percentage = clickX / rect.width;
      const frame = Math.round(percentage * PolygonAnimation.maxFrames);
      
      PolygonAnimation.jumpToFrame(frame);
    });
    
    // Update keyframe markers
    AnimationUI.updateKeyframeMarkers();
  }
  
  static updateKeyframeMarkers() {
    // Clear existing markers
    AnimationUI.keyframeIndicators.html('');
    
    if (!selectedPolygon) return;
    
    // Get keyframes for the selected polygon
    const polygonKeyframes = PolygonAnimation.getPolygonKeyframes(selectedPolygon.id);
    
    // Create a marker for each keyframe
    for (const frame of polygonKeyframes) {
      const percentage = (frame / PolygonAnimation.maxFrames) * 100;
      
      const marker = createDiv('').class('keyframe-marker');
      marker.parent(AnimationUI.keyframeIndicators);
      
      marker.style('position', 'absolute');
      marker.style('left', `${percentage}%`);
      marker.style('top', '50%');
      marker.style('transform', 'translate(-50%, -50%)');
      marker.style('width', '10px');
      marker.style('height', '10px');
      marker.style('background-color', '#ff7700');
      marker.style('border-radius', '50%');
      marker.style('cursor', 'pointer');
      marker.style('z-index', '10');
      
      // Make the current frame's keyframe marker highlighted
      if (frame === PolygonAnimation.currentFrame) {
        marker.style('border', '2px solid #fff');
        marker.style('box-shadow', '0 0 3px rgba(0, 0, 0, 0.3)');
        marker.style('width', '12px');
        marker.style('height', '12px');
      }
      
      // Add click handler to jump to this frame
      marker.mousePressed(() => {
        PolygonAnimation.jumpToFrame(frame);
      });
    }
  }
  
  static createFrameControls(container: any) {
    // Frame slider and value box
    let frameControlContainer = createDiv('').class('frame-control-container').parent(container);
    createDiv('Frame:').parent(frameControlContainer);
    
    let frameSliderContainer = createDiv('').class('slider-container').parent(frameControlContainer);
    AnimationUI.frameSlider = createSlider(0, PolygonAnimation.maxFrames, PolygonAnimation.currentFrame, 1).class('slider').parent(frameSliderContainer);
    AnimationUI.frameValueBox = createDiv(PolygonAnimation.currentFrame.toString()).class('colorpicker-value-box').parent(frameSliderContainer);
    
    AnimationUI.frameSlider.input(() => {
      PolygonAnimation.jumpToFrame(Number(AnimationUI.frameSlider.value()));
    });
  }
  
  static toggleAnimationPanel(show?: boolean) {
    if (show === undefined) {
      show = !AnimationUI.panelVisible;
    }

    if (show) {
      select('.control-panel:not(.animation-panel)')?.style('display', 'none');
      AnimationUI.animationPanelDiv?.style('display', 'block');
      AnimationUI.panelVisible = true;
      
      // Update timeline with any changes
      AnimationUI.updateTimelineDisplay();
    } 
    else {
      AnimationUI.animationPanelDiv?.style('display', 'none');
      AnimationUI.panelVisible = false;
    }
  }
  
  static updateFramePosition() {
    if (AnimationUI.frameSlider && AnimationUI.frameValueBox) {
      AnimationUI.frameSlider.value(PolygonAnimation.currentFrame);
      AnimationUI.frameValueBox.html(PolygonAnimation.currentFrame.toString());
      
      // Update timeline display
      AnimationUI.updateTimelineDisplay();
    }
  }
  
  static updatePlayButton() {
    const playButton = select('.play-animation-button');
    if (playButton) {
      if (PolygonAnimation.isPlaying) {
        playButton.html('⏸ Pause');
      } else {
        playButton.html('▶ Play');
      }
    }
  }
  
  static handleWindowResize() {
    if (AnimationUI.animationPanelDiv) {
      AnimationUI.animationPanelDiv.position(windowWidth - SidePanel.controlPanelSize.x, SidePanel.controlPanelSize.y);
    }
  }
}