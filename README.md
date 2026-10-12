# Trabalho 1 - Computação Gráfica UFF

Disciplina ministrada pelo Professor Marcos de Oliveira Lage Ferreira.

Cena 2D animada de uma pipa voando no céu, feita com WebGPU e shaders WGSL.

## Integrantes

- Claudio Pires Salgado
- Diogo Gouveia de Oliveira
- Guilherme da Hora Andrade Fontoura

## Como rodar

O navegador bloqueia os imports se o arquivo for aberto direto (`file://`), então é preciso um servidor local.

Com o VS Code:

1. Instalar a extensão Live Server
2. Abrir a pasta raiz do repositório
3. Clicar com o botão direito em `pipa/main.html` e escolher "Open with Live Server"

Ou com Python, na pasta raiz:

```
python -m http.server 8000
```

e acessar `http://localhost:8000/pipa/main.html`.

Usar Chrome ou Edge atualizado (precisa de suporte a WebGPU).

## Relatório

### Modelagem e animação

A cena usa quatro triângulos. Dois formam o corpo da pipa, um vermelho e outro amarelo, e os outros dois formam as fitas laranjas da cauda. O fundo azul é definido pela cor de limpeza do canvas.

O movimento vertical da pipa usa `0.2 * Math.sin(this.angle)`. A rotação também varia com uma função seno, com amplitude de `0.12` radianos. A matriz de modelagem combina a rotação com a translação vertical.

Cada fita gira em torno do ponto onde está presa. A primeira recebe a transformação da pipa, e a segunda recebe a transformação da primeira. As rotações têm amplitudes e frequências diferentes, fazendo as fitas balançarem sem perder a ligação com o restante da pipa. Os uniform buffers são atualizados a cada quadro, e a animação continua com `requestAnimationFrame`.

### Câmera

A câmera foi implementada com base no exemplo da pasta `06 - camera` do [repositório da disciplina](https://github.com/mlage/curso-cg/tree/main/06%20-%20camera). O método `createViewMatrix` usa `createLookAtMat4` para calcular a matriz de visão a partir de `eye`, `at` e `up`.

A posição vertical da câmera é calculada por `0.1 * Math.sin(this.angle)`, usando o mesmo ângulo da animação da pipa. Como a pipa se desloca com amplitude de `0.2`, a câmera acompanha metade desse movimento. Assim, a pipa continua subindo e descendo na tela, com amplitude de `0.1` no centro do corpo.

Os vetores `eye` e `at` recebem a mesma posição vertical, mantendo a direção da câmera fixa. A câmera fica em `[0, cameraPos, 2]`, olha para `[0, cameraPos, 0]` e usa `[0, 1, 0]` como vetor para cima. O último argumento de `createLookAtMat4` é `true`, para usar a convenção de coordenadas da matriz de projeção ortográfica. Nessa convenção, os objetos à frente da câmera têm coordenada Z negativa no espaço de visão.

Antes de enviar os dados ao shader, a matriz de visão é multiplicada pela matriz de modelagem de cada objeto, na ordem `view * model`. A pipa e as duas fitas usam a mesma câmera, preservando os movimentos relativos da cauda.

### Projeção

A projeção foi implementada com base no exemplo da pasta `07 - projeções` do [repositório da disciplina](https://github.com/mlage/curso-cg/tree/main/07%20-%20proje%C3%A7%C3%B5es), usando `createOrthographicMat4` no método `createProjectionMatrix`.

A proporção do canvas é calculada por `width / height`. Os limites verticais são `-1` e `1`, e os horizontais são `-aspect` e `aspect`. No canvas de 1024 por 768, isso corresponde a limites horizontais de aproximadamente `-1.33` e `1.33`. Esse ajuste faz uma unidade horizontal ocupar a mesma quantidade de pixels que uma unidade vertical, preservando as proporções da pipa durante a rotação.

Os planos de corte próximo e distante ficam a `0.1` e `10` unidades da câmera. A matriz converte a profundidade para o intervalo de `0` a `1` usado pelo WebGPU. Como a pipa está no plano Z igual a zero e a câmera está em Z igual a dois, toda a geometria fica entre esses planos.

A matriz enviada ao uniforme `modelViewProjection` é calculada na ordem `projection * view * model`. O shader aplica essa matriz aos vértices da pipa e das fitas. A projeção ortográfica mantém o tamanho dos objetos independentemente da distância da câmera, e o enquadramento permite ver a pipa e toda a cauda durante a animação.

