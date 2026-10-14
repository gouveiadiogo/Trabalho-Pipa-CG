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