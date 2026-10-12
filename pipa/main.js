import vertShaderSrc from './projection.vert.js';
import fragShaderSrc from './projection.frag.js';
import WebGPU from '../lib/webgpu.js';
import { 
    createIdentityMat4, 
    createLookAtMat4,
    createOrthographicMat4,
    createTranslationMat4, 
    createRotationZMat4, 
    multiplyMat4 
} from '../lib/utils.js';

class Scene {
    constructor(gpu) {
        this.angle = 0;
        this.cameraPos = 0;
        this.program = gpu.createProgram(vertShaderSrc, fragShaderSrc);

        // Geometria da pipa
        this.pipa = gpu.createShape(this.createPipa(), 6);

        // Geometrias das duas fitas mantendo cores e dimensões originais
        const [fita1Data, fita2Data] = this.createCauda();
        this.fita1 = gpu.createShape(fita1Data, 3);
        this.fita2 = gpu.createShape(fita2Data, 3);

        // Uniforms
        this.uniformPipa = gpu.createUniform(this.program, createIdentityMat4());
        this.uniformFita1 = gpu.createUniform(this.program, createIdentityMat4());
        this.uniformFita2 = gpu.createUniform(this.program, createIdentityMat4());
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

    // Estilo de criação diferente, retornando no formato de array de arrays, com as posições e cores de cada fita separadas para renderização individual com transformações independentes
    createCauda() {
       
        const color = [
            // Laranja
            0.996, 0.494, 0.137, 1.0,
            0.996, 0.494, 0.137, 1.0,
            0.996, 0.494, 0.137, 1.0,
        ];

        // Fita 1: Topo da pipa, Ponta Direita, Ponta Esquerda
        const pos1 = [
            0.0, -0.25, 0.0, 1.0,    
            0.021, -0.379, 0.0, 1.0,  
            0.103, -0.332, 0.0, 1.0,  
        ];

        // Fita 2: Topo no meio da base da Fita 1, Ponta Direita, Ponta Esquerda
        const pos2 = [
            0.062, -0.355, 0.0, 1.0,  
            0.083, -0.485, 0.0, 1.0,  
            0.165, -0.437, 0.0, 1.0,
        ];

        return [[pos1, color], [pos2, color]];
    }

    createModelMatrix() {
        this.angle += 0.02;
        const y = 0.2 * Math.sin(this.angle);
        
        // Valor da Leve Rotação da Pipa (Valores podem ser ajustados)
        const rotZ = 0.12 * Math.sin(this.angle * 1.3);

        const translate = createTranslationMat4(0, y, 0);
        const rotate = createRotationZMat4(rotZ);

        return multiplyMat4(translate, rotate);
    }

    createModelMatrixFita1(modelPipa) {
        const pivotY1 = -0.25;   // Ponto onde a Fita 1 se conecta à Pipa
        // Apenas o eixo Y é necessário para a Fita 1, pois ela se conecta ao centro da base da pipa

        // Valor de Rotação da Fita 1 (Valores podem ser ajustados)
        const rotFita1 = 0.30 * Math.sin(this.angle * 2.2);

        // Transformação da Fita 1 (relativa à pipa)
        const toPivot1 = createTranslationMat4(0, pivotY1, 0);
        const rotateF1 = createRotationZMat4(rotFita1);
        const fromPivot1 = createTranslationMat4(0, -pivotY1, 0);
        
        const localFita1 = multiplyMat4(toPivot1, multiplyMat4(rotateF1, fromPivot1));
        
        return multiplyMat4(modelPipa, localFita1);
    }

    createModelMatrixFita2(modelFita1) {
        const pivotX2 = 0.062;   // Ponto onde a Fita 2 se conecta à Fita 1
        const pivotY2 = -0.355;
        // A Fita 2 se conecta ao meio da base da Fita 1, precisando de ambos os eixos X e Y para manter a posição relativa

        // Valor de Rotação da Fita 2 (Valores podem ser ajustados)
        const rotFita2 = 0.45 * Math.sin(this.angle * 2.8 - 0.7); 

        // Transformação da Fita 2 (Encadeada: Filha da Fita 1)
        const toPivot2 = createTranslationMat4(pivotX2, pivotY2, 0);
        const rotateF2 = createRotationZMat4(rotFita2);
        const fromPivot2 = createTranslationMat4(-pivotX2, -pivotY2, 0);

        const localFita2 = multiplyMat4(toPivot2, multiplyMat4(rotateF2, fromPivot2));
        
        // Multiplicação Hierárquica: Fita 2 segue perfeitamente a Fita 1 sem descolar
        return multiplyMat4(modelFita1, localFita2);
    }

    createViewMatrix() {
        this.cameraPos = 0.1 * Math.sin(this.angle);

        const eye = [0, this.cameraPos, 2];
        const at = [0, this.cameraPos, 0];
        const up = [0, 1, 0];

        return createLookAtMat4(eye, at, up, true);
    }

    createProjectionMatrix(gpu) {
        const aspect = gpu.canvas.width / gpu.canvas.height;

        return createOrthographicMat4(-aspect, aspect, -1, 1, 0.1, 10);
    }

    draw(gpu) {
        const model = this.createModelMatrix();
        const view = this.createViewMatrix();
        const projection = this.createProjectionMatrix(gpu);

        const modelFita1 = this.createModelMatrixFita1(model);
        const modelFita2 = this.createModelMatrixFita2(modelFita1);

        const modelView = multiplyMat4(view, model);
        const modelViewFita1 = multiplyMat4(view, modelFita1);
        const modelViewFita2 = multiplyMat4(view, modelFita2);

        
        // Renderiza a Pipa
        this.uniformPipa.data.set(multiplyMat4(projection, modelView));
        gpu.writeBuffer(this.uniformPipa.buffer, this.uniformPipa.data);
        gpu.draw(this.program, this.pipa, [this.uniformPipa.bindGroup]);

        // Renderiza a Fita 1
        this.uniformFita1.data.set(multiplyMat4(projection, modelViewFita1));
        gpu.writeBuffer(this.uniformFita1.buffer, this.uniformFita1.data);
        gpu.draw(this.program, this.fita1, [this.uniformFita1.bindGroup]);

        // Renderiza a Fita 2
        this.uniformFita2.data.set(multiplyMat4(projection, modelViewFita2));
        gpu.writeBuffer(this.uniformFita2.buffer, this.uniformFita2.data);
        gpu.draw(this.program, this.fita2, [this.uniformFita2.bindGroup]);
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
