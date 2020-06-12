import fragmentShaderSource from "./shader.frag";
import vertexShaderSource from "./shader.vert";

function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string): WebGLProgram {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (! gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(shaderProgram);
        alert('Unable to initialize the shader program: ' + log);
        throw log;
    }
    return shaderProgram;
}

function loadShader(gl: WebGLRenderingContext, type_: number, source: string): WebGLShader {
    const shader = gl.createShader(type_);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        alert('An error occurred compiling the shaders: ' + log);
        gl.deleteShader(shader);
        throw log;
    }
    return shader;
}

function createVBO(gl: WebGLRenderingContext, data): WebGLBuffer {
    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
}

function createIBO(gl: WebGLRenderingContext, data): WebGLBuffer {
    var ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return ibo;
}

class MandelbrotSet {
    gl: WebGLRenderingContext;
    shaderProgram: WebGLProgram;
    uOffset: WebGLUniformLocation;
    uScale: WebGLUniformLocation;
    uResolution: WebGLUniformLocation;
    mouseY: number;
    mouseX: number;
    offsetY: number;
    offsetX: number;
    scale: number;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.mouseY = 0;
        this.mouseX = 0;
        this.offsetY = 0;
        this.offsetX = 0;
        this.scale = 1;

        // initialize the program
        this.shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
        gl.useProgram(this.shaderProgram);
        this.uOffset = gl.getUniformLocation(this.shaderProgram, 'uOffset');
        this.uScale = gl.getUniformLocation(this.shaderProgram, 'uScale');
        this.uResolution = gl.getUniformLocation(this.shaderProgram, 'uResolution');

        // prepare the billboard
        var position = [
            -1.0,  1.0,
            1.0,  1.0,
            -1.0, -1.0,
            1.0, -1.0,
        ];
        var index = [
            0, 2, 1,
            1, 2, 3
        ];
        const vPosition = createVBO(gl, position);
        const vIndex = createIBO(gl, index);
        const aPosition = gl.getAttribLocation(this.shaderProgram, 'aPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, vPosition);
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vIndex);
    }

    resize(height: number, width: number): void {
        const gl = this.gl;
        gl.canvas.height = height;
        gl.canvas.width = width;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        this.mouseY = height / 2;
        this.mouseX = width / 2;
    }

    mousemove(y: number, x: number): void {
        this.mouseY = y;
        this.mouseX = x;
    }

    step(): void {
        const gl = this.gl;
        const rate = 0.95;
        const pmy = (gl.canvas.height / 2 - this.mouseY) / Math.min(gl.canvas.height, gl.canvas.width);
        const pmx = (this.mouseX - gl.canvas.width / 2) / Math.min(gl.canvas.height, gl.canvas.width);
        const my = pmy * this.scale + this.offsetY;
        const mx = pmx * this.scale + this.offsetX;
        this.offsetY += pmy * this.scale * (1 - rate);
        this.offsetX += pmx * this.scale * (1 - rate);
        this.scale *= rate;

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2fv(this.uOffset, [this.offsetX, this.offsetY]);
        gl.uniform1f(this.uScale, this.scale);
        gl.uniform2fv(this.uResolution, [gl.canvas.width, gl.canvas.height]);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.flush();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const body = document.body as HTMLBodyElement;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const gl = canvas.getContext("webgl");
    if (! gl) {
        alert('WebGL is not supported on your browser');
        throw null;
    }
    const app = new MandelbrotSet(gl);
    const resize = () => {
        app.resize(body.clientHeight, body.clientWidth);
    };
    const mousemove = (ev: MouseEvent) => {
        app.mousemove(ev.y, ev.x);
    };

    resize();
    window.addEventListener('resize', (ev: any) => { resize(); });
    window.addEventListener('mousemove', (ev: MouseEvent) => { mousemove(ev); });
    const fps = 10;
    setInterval(() => {
        app.step();
    }, 1000 / fps);
});
