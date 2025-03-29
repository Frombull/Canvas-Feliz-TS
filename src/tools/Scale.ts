class Scale {
  // Configurações visuais
  static gizmoScaleHandleSize: number = 6;
  static gizmoScaleDistance: number = 30;
  static cornerHandleDistance: number = 42;
  
  // Estado de escala
  static isScaling: boolean = false;
  static scaleAxis: "x" | "y" | "xy" | "" = "";
  static initialMousePos: Vertex | null = null;
  static initialCenter: Vertex | null = null;
  static initialVertices: Vertex[] = [];
  static currentScale = {x: 1, y: 1};
  
  // Desenha o gizmo de escala
  static drawScaleGizmo() {
    if (!selectedPolygon) return;
    
    const center = selectedPolygon.getCenter();
    if (!center) return;
    
    push();
    
    // Desenha eixo X e handle
    const xHandlePos = {
      x: center.x + Scale.gizmoScaleDistance,
      y: center.y
    };
    
    stroke(Colors.GizmoScaleColor);
    strokeWeight(1.2);
    line(center.x, center.y, xHandlePos.x, xHandlePos.y);
    
    fill(Colors.GizmoScaleColor);
    if (Scale.scaleAxis === "x") {
      stroke(255);
      strokeWeight(0.8);
    } else {
      noStroke();
    }
    ellipse(xHandlePos.x, xHandlePos.y, Scale.gizmoScaleHandleSize);
    
    // Desenha eixo Y e handle
    const yHandlePos = {
      x: center.x,
      y: center.y - Scale.gizmoScaleDistance
    };
    
    stroke(Colors.GizmoScaleColor);
    strokeWeight(1.2);
    line(center.x, center.y, yHandlePos.x, yHandlePos.y);
    
    fill(Colors.GizmoScaleColor);
    if (Scale.scaleAxis === "y") {
      stroke(255);
      strokeWeight(0.8);
    } else {
      noStroke();
    }
    ellipse(yHandlePos.x, yHandlePos.y, Scale.gizmoScaleHandleSize);
    
    // Desenha diagonal e handle para escala uniforme
    const xyHandlePos = {
      x: center.x + Scale.cornerHandleDistance * 0.707,
      y: center.y - Scale.cornerHandleDistance * 0.707
    };
    
    stroke(Colors.GizmoScaleColor);
    strokeWeight(0.8);
    drawingContext.setLineDash([3, 2]);
    line(center.x, center.y, xyHandlePos.x, xyHandlePos.y);
    drawingContext.setLineDash([]);
    
    fill(Colors.GizmoScaleColor);
    if (Scale.scaleAxis === "xy") {
      stroke(255);
      strokeWeight(0.8);
    } else {
      noStroke();
    }
    rect(xyHandlePos.x - Scale.gizmoScaleHandleSize/2, 
         xyHandlePos.y - Scale.gizmoScaleHandleSize/2,
         Scale.gizmoScaleHandleSize,
         Scale.gizmoScaleHandleSize, 1);
    
    // Mostra o fator de escala atual se estiver escalando
    if (Scale.isScaling) {
      fill(0);
      stroke(255);
      strokeWeight(0.2);
      textAlign(CENTER, CENTER);
      textSize(3);
      
      if (Scale.scaleAxis === "x") {
        text(`X: ${Scale.currentScale.x.toFixed(2)}`, xHandlePos.x, xHandlePos.y - 8);
      } else if (Scale.scaleAxis === "y") {
        text(`Y: ${Scale.currentScale.y.toFixed(2)}`, yHandlePos.x, yHandlePos.y - 8);
      } else if (Scale.scaleAxis === "xy") {
        text(`${Scale.currentScale.x.toFixed(2)}`, xyHandlePos.x, xyHandlePos.y - 8);
      }
    }
    
    pop();
  }
  
  // Verifica qual handle foi clicado
  static getClickedHandle(): "x" | "y" | "xy" | "" {
    if (!selectedPolygon) return "";
    
    const center = selectedPolygon.getCenter();
    if (!center) return "";
    
    const mousePos = Mouse.mousePosInGrid;
    const detectRange = Scale.gizmoScaleHandleSize;
    
    // Handle X
    const xHandle = {
      x: center.x + Scale.gizmoScaleDistance,
      y: center.y
    };
    if (dist(mousePos.x, mousePos.y, xHandle.x, xHandle.y) < detectRange) {
      return "x";
    }
    
    // Handle Y
    const yHandle = {
      x: center.x,
      y: center.y - Scale.gizmoScaleDistance
    };
    if (dist(mousePos.x, mousePos.y, yHandle.x, yHandle.y) < detectRange) {
      return "y";
    }
    
    // Handle XY (uniforme)
    const xyHandle = {
      x: center.x + Scale.cornerHandleDistance * 0.707,
      y: center.y - Scale.cornerHandleDistance * 0.707
    };
    if (dist(mousePos.x, mousePos.y, xyHandle.x, xyHandle.y) < detectRange) {
      return "xy";
    }
    
    return "";
  }
  
  // Inicia a operação de escala
  static startScaling(axis: "x" | "y" | "xy") {
    if (!selectedPolygon) return;
    
    // Salvar o estado inicial
    Scale.isScaling = true;
    Scale.scaleAxis = axis;
    Scale.initialMousePos = { ...Mouse.mousePosInGrid };
    
    // Importante: salvar o centro original
    const center = selectedPolygon.getCenter();
    Scale.initialCenter = { x: center.x, y: center.y };
    
    // Salvar cópia dos vértices originais
    Scale.initialVertices = selectedPolygon.vertices.map(v => ({ x: v.x, y: v.y }));
    
    console.log(`Started scaling on ${axis} axis`);
  }
  

static processScaling() {
  if (!Scale.isScaling || !selectedPolygon || !Scale.initialMousePos || !Scale.initialCenter) return;
  
  // Posição atual do mouse
  const currentMousePos = Mouse.mousePosInGrid;
  
  // Calcular fatores de escala
  let scaleX = 1;
  let scaleY = 1;
  
  try {
    // Usar uma abordagem de taxa constante em vez de proporção direta
    // baseada na distância entre mouse e centro
    
    if (Scale.scaleAxis === "x" || Scale.scaleAxis === "xy") {
      // Diferença de posição do mouse em X desde o início da operação
      const mouseDeltaX = currentMousePos.x - Scale.initialMousePos.x;
      
      // Aplicar uma taxa constante de mudança de escala
      // Ajuste o divisor (25) para controlar a sensibilidade da escala
      scaleX = 1 + mouseDeltaX / 25;
    }
    
    if (Scale.scaleAxis === "y" || Scale.scaleAxis === "xy") {
      // Para o eixo Y, valores negativos de delta aumentam a escala (movimento para cima)
      const mouseDeltaY = Scale.initialMousePos.y - currentMousePos.y;
      
      // Aplicar uma taxa constante de mudança de escala
      scaleY = 1 + mouseDeltaY / 25;
    }
    
    // Em escala uniforme, usar a média para movimentos diagonais
    if (Scale.scaleAxis === "xy") {
      // Para escala uniforme, usar a média da escala X e Y
      // ou uma abordagem baseada na distância Euclidiana
      const dx = currentMousePos.x - Scale.initialMousePos.x;
      const dy = Scale.initialMousePos.y - currentMousePos.y;  // invertido para Y
      const delta = (dx + dy) / 2;  // média simples do movimento bidimensional
      
      // Aplicar o mesmo fator a ambos os eixos
      scaleX = scaleY = 1 + delta / 25;
    }
    
    // Permitir valores negativos, mas restringir a magnitude para evitar problemas
    scaleX = Math.max(-10, Math.min(scaleX, 10));
    scaleY = Math.max(-10, Math.min(scaleY, 10));
    
    // Aplicar apenas no eixo selecionado
    if (Scale.scaleAxis === "x") {
      scaleY = 1; // Manter Y inalterado
    } else if (Scale.scaleAxis === "y") {
      scaleX = 1; // Manter X inalterado
    }
    
    // Guardar os valores atuais
    Scale.currentScale = { x: scaleX, y: scaleY };
    
    // Aplicar transformação a cada vértice
    Scale.applyScaleToPolygon(scaleX, scaleY);
    
  } catch (err) {
    console.error("Error during scaling:", err);
    // Restaurar forma original em caso de erro
    if (selectedPolygon) {
      selectedPolygon.vertices = Scale.initialVertices.map(v => ({ x: v.x, y: v.y }));
    }
  }
}
  
  // Aplica a escala aos vértices do polígono
  static applyScaleToPolygon(scaleX: number, scaleY: number) {
    if (!selectedPolygon || !Scale.initialCenter || Scale.initialVertices.length === 0) return;
    
    // Salvar vértices para histórico antes de modificar
    const oldVertices = selectedPolygon.saveStateBeforeChange();
    
    // Aplicar escala a cada vértice
    for (let i = 0; i < Scale.initialVertices.length; i++) {
      const origVertex = Scale.initialVertices[i];
      
      // Calcular deslocamento do vértice em relação ao centro
      const dx = origVertex.x - Scale.initialCenter.x;
      const dy = origVertex.y - Scale.initialCenter.y;
      
      // Aplicar escala ao deslocamento
      const scaledX = dx * scaleX;
      const scaledY = dy * scaleY;
      
      // Definir nova posição
      selectedPolygon.vertices[i].x = Scale.initialCenter.x + scaledX;
      selectedPolygon.vertices[i].y = Scale.initialCenter.y + scaledY;
    }
    
    // Registrar para histórico
    selectedPolygon.recordAction(oldVertices);
  }
  
  // Finaliza a operação de escala
  static endScaling() {
    if (Scale.isScaling) {
      console.log(`Scaling ended. Final scale: X=${Scale.currentScale.x.toFixed(2)}, Y=${Scale.currentScale.y.toFixed(2)}`);
    }
    
    Scale.isScaling = false;
    Scale.scaleAxis = "";
    Scale.initialMousePos = null;
    
    // Não limpar os vertices iniciais e o centro,
    // pois podem ser necessários para outras operações
    
    // Resetar qualquer linha tracejada
    drawingContext.setLineDash([]);
  }
  
  // Define a escala para valores específicos
  static setScaleTo(newX: number, newY: number) {
    if (!selectedPolygon) return;
    // Removi a verificação !newX e !newY para permitir valores zero ou negativos
    
    // Salvar centro e vértices se ainda não estiverem salvos
    if (!Scale.initialCenter || Scale.initialVertices.length === 0) {
      const center = selectedPolygon.getCenter();
      Scale.initialCenter = { x: center.x, y: center.y };
      Scale.initialVertices = selectedPolygon.vertices.map(v => ({ x: v.x, y: v.y }));
    }
    
    // Atualizar valores de escala atuais
    Scale.currentScale.x = newX;
    Scale.currentScale.y = newY;
    
    // Aplicar a escala
    Scale.applyScaleToPolygon(newX, newY);
    
    console.log(`Scale set to: X=${newX.toFixed(2)}, Y=${newY.toFixed(2)}`);
  }
}