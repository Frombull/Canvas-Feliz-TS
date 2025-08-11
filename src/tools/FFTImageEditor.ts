// FFT Image Editor - Converted to TypeScript
// Original code converted and organized into classes

interface Complex {
    real: number;
    imag: number;
}

interface FFTResult {
    magnitude: number[];
    phase: number[];
}

enum DrawMode {
    ERASE = 'erase',
    SMOOTH = 'smooth',
    CIRCLE = 'circle'
}

class FFTImageEditor {
    private originalImg: HTMLImageElement | null = null;
    private originalCanvas: HTMLCanvasElement | null = null;
    private fftCanvas: HTMLCanvasElement | null = null;
    private originalCtx: CanvasRenderingContext2D | null = null;
    private fftCtx: CanvasRenderingContext2D | null = null;
    private imgData: ImageData | null = null;
    private fftMagnitudeData: number[] = [];
    private fftPhaseData: number[] = [];
    private originalFFTMagnitude: number[] = [];
    private originalFFTPhase: number[] = [];
    private canvasSize = 512;
    private brushSize = 20;
    private drawMode: DrawMode = DrawMode.ERASE;
    private isDrawing = false;
    private circleStartX = 0;
    private circleStartY = 0;
    private tempCircleRadius = 0;
    private drawingCircle = false;
    private lastDrawX = -1;
    private lastDrawY = -1;
    private maxFFTValue = 0;

    constructor() {
        this.init();
    }

    private init(): void {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeCanvases();
            this.setupControls();
            this.loadDefaultImage();
        });
    }

    private initializeCanvases(): void {
        this.originalCanvas = document.getElementById('originalCanvas') as HTMLCanvasElement;
        this.fftCanvas = document.getElementById('fftCanvas') as HTMLCanvasElement;
        
        if (!this.originalCanvas || !this.fftCanvas) {
            return;
        }
        
        this.originalCtx = this.originalCanvas.getContext('2d');
        this.fftCtx = this.fftCanvas.getContext('2d');
        
        this.drawInitialState(this.originalCtx!, 'Imagem Original');
        this.drawInitialState(this.fftCtx!, 'Domínio da Frequência');
        
        this.setupCanvasEvents();
    }

    private drawInitialState(ctx: CanvasRenderingContext2D, text: string): void {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const lines = text.split('\n');
        const lineHeight = 20;
        const startY = this.canvasSize/2 - (lines.length - 1) * lineHeight/2;
        
        lines.forEach((line, index) => {
            ctx.fillText(line, this.canvasSize/2, startY + index * lineHeight);
        });
    }

    private setupControls(): void {
        const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }
        
        const brushSizeSlider = document.getElementById('brushSize') as HTMLInputElement;
        const brushSizeValue = document.getElementById('brushSizeValue') as HTMLSpanElement;
        
        if (brushSizeSlider && brushSizeValue) {
            brushSizeSlider.addEventListener('input', (e) => {
                this.brushSize = parseInt((e.target as HTMLInputElement).value);
                brushSizeValue.textContent = this.brushSize.toString();
            });
        }
        
        const drawModeSelect = document.getElementById('drawMode') as HTMLSelectElement;
        if (drawModeSelect) {
            if (!drawModeSelect.querySelector('option[value="circle"]')) {
                const circleOption = document.createElement('option');
                circleOption.value = 'circle';
                circleOption.textContent = '⭕ Círculo';
                drawModeSelect.appendChild(circleOption);
            }

            drawModeSelect.addEventListener('change', (e) => {
                this.drawMode = (e.target as HTMLSelectElement).value as DrawMode;
            });
        }
        
        const fileWrapper = document.querySelector('.file-input-wrapper') as HTMLElement;
        if (fileWrapper && fileInput) {
            fileWrapper.addEventListener('click', (e) => {
                if (e.target !== fileInput) {
                    fileInput.click();
                }
            });
        }
    }

    private setupCanvasEvents(): void {
        if (!this.fftCanvas) return;
        
        this.fftCanvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.fftCanvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.fftCanvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.fftCanvas.addEventListener('mouseleave', () => this.onMouseLeave());
        this.fftCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    private onMouseDown(e: MouseEvent): void {
        if (this.fftMagnitudeData.length > 0) {
            const rect = this.fftCanvas!.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) * this.canvasSize / rect.width);
            const y = Math.floor((e.clientY - rect.top) * this.canvasSize / rect.height);
            
            this.lastDrawX = -1;
            this.lastDrawY = -1;
            
            if (this.drawMode === DrawMode.CIRCLE) {
                this.drawingCircle = true;
                this.circleStartX = x;
                this.circleStartY = y;
                this.tempCircleRadius = 0;
            } else {
                this.isDrawing = true;
                this.drawOnFFT(e, false);
            }
        }
    }

    private onMouseMove(e: MouseEvent): void {
        if (this.fftMagnitudeData.length > 0) {
            const rect = this.fftCanvas!.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) * this.canvasSize / rect.width);
            const y = Math.floor((e.clientY - rect.top) * this.canvasSize / rect.height);
            
            if (this.drawingCircle) {
                const dx = x - this.circleStartX;
                const dy = y - this.circleStartY;
                this.tempCircleRadius = Math.sqrt(dx*dx + dy*dy);
                
                this.displayFFT(true);
            } else if (this.isDrawing) {
                this.drawOnFFT(e, false);
            }
        }
    }

    private onMouseUp(e: MouseEvent): void {
        if (this.drawingCircle && this.fftMagnitudeData.length > 0) {
            const rect = this.fftCanvas!.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) * this.canvasSize / rect.width);
            const y = Math.floor((e.clientY - rect.top) * this.canvasSize / rect.height);
            
            const dx = x - this.circleStartX;
            const dy = y - this.circleStartY;
            const radius = Math.sqrt(dx*dx + dy*dy);
            
            this.drawCircleOnFFT(this.circleStartX, this.circleStartY, radius);
            
            this.drawingCircle = false;
            
            this.displayFFT();
            this.reconstructImage();
        } else if (this.isDrawing) {
            this.displayFFT();
            this.reconstructImage();
        }
        
        this.isDrawing = false;
        this.drawingCircle = false;
        
        this.lastDrawX = -1;
        this.lastDrawY = -1;
    }

    private onMouseLeave(): void {
        if (this.isDrawing) {
            this.displayFFT();
            this.reconstructImage();
        }
        
        this.isDrawing = false;
        
        this.lastDrawX = -1;
        this.lastDrawY = -1;
    }

    private loadDefaultImage(): void {
        const img = new Image();
        
        img.onload = () => {
            this.originalImg = img;
            this.processImage();
        };
        
        img.onerror = () => {
            alert('Não foi possível carregar a imagem padrão.');
        };
        
        img.src = '../src/assets/Lenna.png';
    }

    private handleImageUpload(event: Event): void {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) {
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione um arquivo de imagem válido.');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImg = img;
                this.processImage();
            };
            
            img.onerror = () => {
                alert('Erro ao carregar a imagem. Tente outro arquivo.');
            };
            
            img.src = e.target?.result as string;
        };
        
        reader.onerror = () => {
            alert('Erro ao ler o arquivo. Tente novamente.');
        };
        
        reader.readAsDataURL(file);
    }

    private processImage(): void {
        if (!this.originalCtx || !this.originalImg) {
            return;
        }
        
        this.originalCtx.clearRect(0, 0, this.canvasSize, this.canvasSize);
        this.originalCtx.fillStyle = '#fff';
        this.originalCtx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        
        let aspectRatio = this.originalImg.width / this.originalImg.height;
        let drawWidth: number, drawHeight: number;
        
        if (aspectRatio > 1) {
            drawWidth = this.canvasSize;
            drawHeight = this.canvasSize / aspectRatio;
        } else {
            drawWidth = this.canvasSize * aspectRatio;
            drawHeight = this.canvasSize;
        }
        
        let x = (this.canvasSize - drawWidth) / 2;
        let y = (this.canvasSize - drawHeight) / 2;
        
        this.originalCtx.drawImage(this.originalImg, x, y, drawWidth, drawHeight);
        
        this.imgData = this.originalCtx.getImageData(0, 0, this.canvasSize, this.canvasSize);
        
        // Convert to black and white
        for (let i = 0; i < this.imgData.data.length; i += 4) {
            const r = this.imgData.data[i];
            const g = this.imgData.data[i + 1];
            const b = this.imgData.data[i + 2];
            
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            
            this.imgData.data[i] = gray;
            this.imgData.data[i + 1] = gray;
            this.imgData.data[i + 2] = gray;
        }
        
        this.originalCtx.putImageData(this.imgData, 0, 0);
        
        this.calculateAndDisplayFFT();
        
        this.lastDrawX = -1;
        this.lastDrawY = -1;
    }

    public resetFFT(): void {
        if (!this.originalImg) {
            return;
        }
        
        if (this.originalFFTMagnitude.length > 0 && this.originalFFTPhase.length > 0) {
            this.fftMagnitudeData = [...this.originalFFTMagnitude];
            this.fftPhaseData = [...this.originalFFTPhase];
            
            this.maxFFTValue = 0;
            for (let i = 0; i < this.fftMagnitudeData.length; i++) {
                if (this.fftMagnitudeData[i] > this.maxFFTValue) {
                    this.maxFFTValue = this.fftMagnitudeData[i];
                }
            }
            
            this.displayFFT();
            this.reconstructImage();
        } else {
            if (this.originalImg && this.originalCtx) {
                this.processImage();
            }
        }
    }

    // Continue with FFT calculation methods...
    private calculateAndDisplayFFT(): void {
        let grayData: number[] = [];
        
        for (let i = 0; i < this.imgData!.data.length; i += 4) {
            let r = this.imgData!.data[i];
            let g = this.imgData!.data[i + 1];
            let b = this.imgData!.data[i + 2];
            let gray = (r + g + b) / 3;
            grayData.push(gray);
        }
        
        const fftResult = FFTProcessor.compute2DFFT(grayData, this.canvasSize, this.canvasSize);
        
        this.fftMagnitudeData = fftResult.magnitude;
        this.fftPhaseData = fftResult.phase;
        
        this.originalFFTMagnitude = [...this.fftMagnitudeData];
        this.originalFFTPhase = [...this.fftPhaseData];
        
        this.maxFFTValue = 0;
        for (let i = 0; i < this.fftMagnitudeData.length; i++) {
            if (this.fftMagnitudeData[i] > this.maxFFTValue) {
                this.maxFFTValue = this.fftMagnitudeData[i];
            }
        }
        
        this.displayFFT();
    }

    private displayFFT(showPreview = false): void {
        if (!this.fftCtx || this.fftMagnitudeData.length === 0) {
            return;
        }
        
        const fftMagnitudeDisplay = [...this.fftMagnitudeData];
        
        const maxMag = this.maxFFTValue;
        
        const imageData = this.fftCtx.createImageData(this.canvasSize, this.canvasSize);
        
        for (let i = 0; i < fftMagnitudeDisplay.length; i++) {
            let normalizedMag = Math.log(1 + fftMagnitudeDisplay[i]) / Math.log(1 + maxMag);
            let value = Math.max(0, Math.min(255, Math.round(normalizedMag * 255)));
            
            let idx = i * 4;
            
            imageData.data[idx] = value;     // R
            imageData.data[idx + 1] = value; // G
            imageData.data[idx + 2] = value; // B
            imageData.data[idx + 3] = 255;   // A
        }
        
        const shiftedImageData = this.fftShift(imageData, this.canvasSize, this.canvasSize);
        
        this.fftCtx.putImageData(shiftedImageData, 0, 0);
        
        if (showPreview && this.drawingCircle) {
            this.fftCtx.beginPath();
            this.fftCtx.arc(this.circleStartX, this.circleStartY, this.tempCircleRadius, 0, Math.PI * 2);
            this.fftCtx.strokeStyle = 'red';
            this.fftCtx.lineWidth = 2;
            this.fftCtx.stroke();
        }
    }

    private fftShift(imageData: ImageData, width: number, height: number): ImageData {
        const shifted = this.fftCtx!.createImageData(width, height);
        const halfW = Math.floor(width / 2);
        const halfH = Math.floor(height / 2);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let srcX = (x + halfW) % width;
                let srcY = (y + halfH) % height;
                
                let srcIdx = (srcY * width + srcX) * 4;
                let dstIdx = (y * width + x) * 4;
                
                shifted.data[dstIdx] = imageData.data[srcIdx];
                shifted.data[dstIdx + 1] = imageData.data[srcIdx + 1];
                shifted.data[dstIdx + 2] = imageData.data[srcIdx + 2];
                shifted.data[dstIdx + 3] = imageData.data[srcIdx + 3];
            }
        }
        
        return shifted;
    }

    private reconstructImage(): void {
        if (!this.originalCtx || this.fftMagnitudeData.length === 0 || this.fftPhaseData.length === 0) {
            return;
        }
        
        let complexData: Complex[] = [];
        for (let i = 0; i < this.fftMagnitudeData.length; i++) {
            let mag = this.fftMagnitudeData[i];
            let phase = this.fftPhaseData[i];
            
            let real = mag * Math.cos(phase);
            let imag = mag * Math.sin(phase);
            
            complexData.push({ real, imag });
        }
        
        let reconstructed = FFTProcessor.compute2DIFFT(complexData, this.canvasSize, this.canvasSize);
        
        let maxVal = -Infinity;
        let minVal = Infinity;
        
        for (let i = 0; i < reconstructed.length; i++) {
            if (reconstructed[i] > maxVal) maxVal = reconstructed[i];
            if (reconstructed[i] < minVal) minVal = reconstructed[i];
        }
        
        const imageData = this.originalCtx.createImageData(this.canvasSize, this.canvasSize);
        
        for (let i = 0; i < reconstructed.length; i++) {
            let normalized = (reconstructed[i] - minVal) / (maxVal - minVal);
            let value = Math.max(0, Math.min(255, Math.round(normalized * 255)));
            
            let idx = i * 4;
            
            imageData.data[idx] = value;     // R
            imageData.data[idx + 1] = value; // G
            imageData.data[idx + 2] = value; // B
            imageData.data[idx + 3] = 255;   // A
        }
        
        this.originalCtx.putImageData(imageData, 0, 0);
    }

    private drawOnFFT(event: MouseEvent, updateImage = true): void {
        if (this.fftMagnitudeData.length === 0) return;
        
        const rect = this.fftCanvas!.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) * this.canvasSize / rect.width);
        const y = Math.floor((event.clientY - rect.top) * this.canvasSize / rect.height);
        
        if (x < 0 || x >= this.canvasSize || y < 0 || y >= this.canvasSize) return;
        
        if (this.lastDrawX >= 0 && this.lastDrawY >= 0 && (this.lastDrawX !== x || this.lastDrawY !== y)) {
            const points = this.getLinePoints(this.lastDrawX, this.lastDrawY, x, y);
            
            for (const point of points) {
                this.applyBrushAt(point.x, point.y);
            }
        } else {
            this.applyBrushAt(x, y);
        }
        
        this.lastDrawX = x;
        this.lastDrawY = y;
        
        if (updateImage) {
            this.displayFFT();
            this.reconstructImage();
        } else {
            this.displayFFT();
        }
    }

    private getLinePoints(x0: number, y0: number, x1: number, y1: number): Array<{x: number, y: number}> {
        const points: Array<{x: number, y: number}> = [];
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = (x0 < x1) ? 1 : -1;
        const sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;
        
        while (true) {
            points.push({x: x0, y: y0});
            
            if (x0 === x1 && y0 === y1) break;
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
        
        return points;
    }

    private applyBrushAt(x: number, y: number): void {
        const fftDataCopy = [...this.fftMagnitudeData];
        
        const halfW = Math.floor(this.canvasSize / 2);
        const halfH = Math.floor(this.canvasSize / 2);
        const shiftedX = (x - halfW + this.canvasSize) % this.canvasSize;
        const shiftedY = (y - halfH + this.canvasSize) % this.canvasSize;
        
        for (let dy = -this.brushSize; dy <= this.brushSize; dy++) {
            for (let dx = -this.brushSize; dx <= this.brushSize; dx++) {
                let px = shiftedX + dx;
                let py = shiftedY + dy;
                
                px = (px + this.canvasSize) % this.canvasSize;
                py = (py + this.canvasSize) % this.canvasSize;
                
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= this.brushSize) {
                    let i = py * this.canvasSize + px;
                    if (i < this.fftMagnitudeData.length) {
                        let strength = Math.max(0, 1 - distance / this.brushSize);
                        
                        switch(this.drawMode) {
                            case DrawMode.ERASE:
                                this.fftMagnitudeData[i] *= (1 - strength * 0.8);
                                break;
                            case DrawMode.SMOOTH:
                                let avg = 0;
                                let count = 0;
                                for (let sy = -1; sy <= 1; sy++) {
                                    for (let sx = -1; sx <= 1; sx++) {
                                        let nx = (px + sx + this.canvasSize) % this.canvasSize;
                                        let ny = (py + sy + this.canvasSize) % this.canvasSize;
                                        let ni = ny * this.canvasSize + nx;
                                        if (ni < this.fftMagnitudeData.length) {
                                            avg += fftDataCopy[ni];
                                            count++;
                                        }
                                    }
                                }
                                if (count > 0) {
                                    let targetValue = avg / count;
                                    this.fftMagnitudeData[i] = fftDataCopy[i] * (1 - strength * 0.3) + targetValue * (strength * 0.3);
                                }
                                break;
                        }
                    }
                }
            }
        }
    }

    private drawCircleOnFFT(centerX: number, centerY: number, radius: number): void {
        if (this.fftMagnitudeData.length === 0) return;
        
        const halfW = Math.floor(this.canvasSize / 2);
        const halfH = Math.floor(this.canvasSize / 2);
        
        const startX = Math.max(0, Math.floor(centerX - radius - 1));
        const startY = Math.max(0, Math.floor(centerY - radius - 1));
        const endX = Math.min(this.canvasSize - 1, Math.ceil(centerX + radius + 1));
        const endY = Math.min(this.canvasSize - 1, Math.ceil(centerY + radius + 1));
        
        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance <= radius) {
                    const shiftedX = (x - halfW + this.canvasSize) % this.canvasSize;
                    const shiftedY = (y - halfH + this.canvasSize) % this.canvasSize;
                    const i = shiftedY * this.canvasSize + shiftedX;
                    
                    if (i >= 0 && i < this.fftMagnitudeData.length) {
                        this.fftMagnitudeData[i] = 0;
                    }
                }
            }
        }
    }
}

// FFT Processing class
class FFTProcessor {
    static fft1d(signal: Complex[]): Complex[] {
        const n = signal.length;
        
        if (n === 1) {
            return [{ real: signal[0].real, imag: signal[0].imag }];
        }
        
        if (n & (n - 1)) {
            return [];
        }
        
        const result = new Array(n);
        for (let i = 0; i < n; i++) {
            result[i] = { real: signal[i].real, imag: signal[i].imag };
        }
        
        for (let i = 0, j = 0; i < n; i++) {
            if (i < j) {
                const temp = { real: result[i].real, imag: result[i].imag };
                result[i] = { real: result[j].real, imag: result[j].imag };
                result[j] = { real: temp.real, imag: temp.imag };
            }
            
            let k = n >> 1;
            while (k > 0 && j >= k) {
                j -= k;
                k >>= 1;
            }
            j += k;
        }
        
        for (let s = 1; s < Math.log2(n) + 1; s++) {
            const m = Math.pow(2, s);
            const wm = { real: Math.cos(-2 * Math.PI / m), imag: Math.sin(-2 * Math.PI / m) };
            
            for (let k = 0; k < n; k += m) {
                let w = { real: 1, imag: 0 };
                
                for (let j = 0; j < m/2; j++) {
                    const t = {
                        real: w.real * result[k + j + m/2].real - w.imag * result[k + j + m/2].imag,
                        imag: w.real * result[k + j + m/2].imag + w.imag * result[k + j + m/2].real
                    };
                    
                    const u = { real: result[k + j].real, imag: result[k + j].imag };
                    
                    result[k + j] = {
                        real: u.real + t.real,
                        imag: u.imag + t.imag
                    };
                    
                    result[k + j + m/2] = {
                        real: u.real - t.real,
                        imag: u.imag - t.imag
                    };
                    
                    const nextW = {
                        real: w.real * wm.real - w.imag * wm.imag,
                        imag: w.real * wm.imag + w.imag * wm.real
                    };
                    w = nextW;
                }
            }
        }
        
        return result;
    }

    static ifft1d(spectrum: Complex[]): Complex[] {
        const n = spectrum.length;
        
        const conjugatedSpectrum = spectrum.map(x => ({ real: x.real, imag: -x.imag }));
        
        const result = FFTProcessor.fft1d(conjugatedSpectrum);
        
        return result.map(x => ({ 
            real: x.real / n, 
            imag: -x.imag / n 
        }));
    }

    static isPowerOf2(n: number): boolean {
        return n > 0 && (n & (n - 1)) === 0;
    }

    static padToPowerOf2(array: Complex[]): Complex[] {
        if (FFTProcessor.isPowerOf2(array.length)) {
            return array;
        }
        
        const nextPow2 = Math.pow(2, Math.ceil(Math.log2(array.length)));
        const padded = [...array];
        
        for (let i = array.length; i < nextPow2; i++) {
            padded.push({ real: 0, imag: 0 });
        }
        
        return padded;
    }

    static compute2DFFT(data: number[], width: number, height: number): FFTResult {
        let realData: Complex[] = [];
        for (let i = 0; i < data.length; i++) {
            realData.push({ real: data[i], imag: 0 });
        }
        
        let rowFFT: Complex[][] = [];
        for (let y = 0; y < height; y++) {
            let row: Complex[] = [];
            for (let x = 0; x < width; x++) {
                row.push(realData[y * width + x]);
            }
            
            row = FFTProcessor.padToPowerOf2(row);
            
            rowFFT.push(FFTProcessor.fft1d(row));
        }
        
        let result: Complex[][] = Array(height).fill(null).map(() => Array(width).fill(null));
        
        for (let x = 0; x < width; x++) {
            let col: Complex[] = [];
            for (let y = 0; y < height; y++) {
                col.push(rowFFT[y][x]);
            }
            
            col = FFTProcessor.padToPowerOf2(col);
            
            let colFFT = FFTProcessor.fft1d(col);
            
            for (let y = 0; y < height; y++) {
                result[y][x] = colFFT[y];
            }
        }
        
        let magnitude: number[] = [];
        let phase: number[] = [];
        
        const totalPixels = width * height;
        
        for (let i = 0; i < totalPixels; i++) {
            const y = Math.floor(i / width);
            const x = i % width;
            
            if (result[y] && result[y][x]) {
                let real = result[y][x].real;
                let imag = result[y][x].imag;
                
                let mag = Math.sqrt(real * real + imag * imag);
                let ph = Math.atan2(imag, real);
                
                magnitude.push(mag);
                phase.push(ph);
            } else {
                magnitude.push(0);
                phase.push(0);
            }
        }
        
        return { magnitude, phase };
    }

    static compute2DIFFT(complexData: Complex[], width: number, height: number): number[] {
        let matrix: Complex[][] = [];
        for (let y = 0; y < height; y++) {
            matrix[y] = [];
            for (let x = 0; x < width; x++) {
                matrix[y][x] = complexData[y * width + x];
            }
        }
        
        let rowIFFT: Complex[][] = [];
        for (let y = 0; y < height; y++) {
            rowIFFT.push(FFTProcessor.ifft1d(matrix[y]));
        }
        
        let colIFFT: number[][] = Array(height).fill(null).map(() => Array(width).fill(0));
        
        for (let x = 0; x < width; x++) {
            let col: Complex[] = [];
            for (let y = 0; y < height; y++) {
                col.push(rowIFFT[y][x]);
            }
            
            let colResult = FFTProcessor.ifft1d(col);
            
            for (let y = 0; y < height; y++) {
                colIFFT[y][x] = colResult[y].real;
            }
        }
        
        let flatResult: number[] = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                flatResult.push(colIFFT[y][x]);
            }
        }
        
        return flatResult;
    }
}

// Global instance and functions for compatibility with HTML
let fftEditor: FFTImageEditor;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    fftEditor = new FFTImageEditor();
});

// Global function for the reset button
function resetFFT(): void {
    if (fftEditor) {
        fftEditor.resetFFT();
    }
}
