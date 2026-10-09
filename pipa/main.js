import vertShaderSrc from './projection.vert.js';
import fragShaderSrc from './projection.frag.js';
import WebGPU from '../lib/webgpu.js';
import { createIdentityMat4, createTranslationMat4 } from '../lib/utils.js';

class Scene {
    constructor(gpu) {

        this.angle = 0;
        this.program = gpu.createProgram(vertShaderSrc, fragShaderSrc);
        this.pipa = gpu.createShape(this.createPipa(), 6);
        this.cauda = gpu.createShape(this.createCauda(), 6);
        this.uniformCauda = gpu.createUniform(this.program, createIdentityMat4());
        this.uniform = gpu.createUniform(this.program, createIdentityMat4());
    }

    createPipa() {
        const positions = [
            // Triangulo vermelho: Topo, esquerda, base
            0.0, 0.25, 0.0, 1.0,
            -0.202, 0.048, 0.0, 1.0, 
            0.0, -0.25, 0.0, 1.0,   
            
            // Triangulo amarelo: Topo, direita, base 
            0.0, 0.25, 0.0, 1.0,  
            0.202, 0.048, 0.0, 1.0, 
            0.0, -0.25, 0.0, 1.0,
        ];

        const colors = [
            // Vermelho
            0.925, 0.098, 0.145, 1.0,
            0.925, 0.098, 0.145, 1.0,
            0.925, 0.098, 0.145, 1.0,

            // Amarelo
            0.988, 0.855, 0.180, 1.0,
            0.988, 0.855, 0.180, 1.0,
            0.988, 0.855, 0.180, 1.0,
        ];

        return [positions, colors];
    }

    createCauda() {
        const positions = [
            // Cauda 1: Topo, esquerda, direita
            0.0, -0.25, 0.0, 1.0,    
            0.021, -0.379, 0.0, 1.0,  
            0.103, -0.332, 0.0, 1.0,  

            // Cauda 2
            0.062, -0.355, 0.0, 1.0,  
            0.083, -0.485, 0.0, 1.0,  
            0.165, -0.437, 0.0, 1.0,  
        ];

        const colors = [
            // Laranja
            0.996, 0.494, 0.137, 1.0,
            0.996, 0.494, 0.137, 1.0,
            0.996, 0.494, 0.137, 1.0,

            0.996, 0.494, 0.137, 1.0,
            0.996, 0.494, 0.137, 1.0,
            0.996, 0.494, 0.137, 1.0,
        ];

        return [positions, colors];
    }

    createModelMatrix() {
        this.angle += 0.02;
        const y = 0.2 * Math.sin(this.angle);
        const translate = createTranslationMat4(0, y, 0);
        return translate;
    }

    draw(gpu) {
        const model = this.createModelMatrix();

        this.uniform.data.set(model);
        gpu.writeBuffer(this.uniform.buffer, this.uniform.data);
        gpu.draw(this.program, this.pipa, [this.uniform.bindGroup]);

        this.uniformCauda.data.set(model);
        gpu.writeBuffer(this.uniformCauda.buffer, this.uniformCauda.data);
        gpu.draw(this.program, this.cauda, [this.uniformCauda.bindGroup]);
    }
}

class Main {
    async init() {
        this.gpu = await WebGPU.createCanvas('#glcanvas', 1024, 768, {
            clearColor: { r: 0.596, g: 0.835, b: 0.992, a: 1.0 },
        });
        this.scene = new Scene(this.gpu);
    }

    draw() {
        this.gpu.start();
        this.scene.draw(this.gpu);
        this.gpu.finish();
        requestAnimationFrame(this.draw.bind(this));
    }
}

try {
    const app = new Main();
    await app.init();
    app.draw();
} catch (error) {
    console.error(error);
    document.body.insertAdjacentHTML('beforeend', `<p>${error.message}</p>`);
}