const campoBusca = document.querySelector("#buscar-produto");
const botaoAdicionar = document.querySelector("#btn-adicionar");
const formularioProduto = document.querySelector("#formulario-produto");
const formProduto = document.querySelector("#form-produto");
const tabelaProdutos = document.querySelector("tbody");

const tituloFormulario = document.querySelector("#titulo-formulario");
const botaoSalvar = document.querySelector("#btn-salvar");
const botaoCancelar = document.querySelector("#btn-cancelar");

const chaveProdutos = "stockpro_produtos";

let produtoEmEdicao = null;

// Carregar produtos salvos
let produtos = JSON.parse(localStorage.getItem(chaveProdutos));

// Criar produtos iniciais se não houver uma lista válida
if (!Array.isArray(produtos) || produtos.length === 0) {
    produtos = [
        {
            nome: "Teclado mecânico",
            categoria: "Periféricos",
            quantidade: 12,
            preco: 150,
            estoqueMinimo: 5
        },
        {
            nome: "Mouse gamer",
            categoria: "Periféricos",
            quantidade: 3,
            preco: 90,
            estoqueMinimo: 5
        },
        {
            nome: "Monitor 24 polegadas",
            categoria: "Monitores",
            quantidade: 8,
            preco: 750,
            estoqueMinimo: 3
        }
    ];

    localStorage.setItem(
        chaveProdutos,
        JSON.stringify(produtos)
    );
}

// Salvar produtos
function salvarProdutos() {
    localStorage.setItem(
        chaveProdutos,
        JSON.stringify(produtos)
    );
}

// Resetar formulário
function resetarFormulario() {
    produtoEmEdicao = null;

    formProduto.reset();

    tituloFormulario.textContent = "Adicionar produto";
    botaoSalvar.textContent = "Salvar produto";

    formularioProduto.hidden = true;
}

// Criar botões de ação
function adicionarBotoesAcao(linha, produto) {
    const colunaAcoes = linha.insertCell(-1);

    // Botão Editar
    const botaoEditar = document.createElement("button");

    botaoEditar.type = "button";
    botaoEditar.textContent = "Editar";

    botaoEditar.addEventListener("click", () => {
        produtoEmEdicao = produto;

        document.querySelector("#nome-produto").value = produto.nome;
        document.querySelector("#categoria-produto").value = produto.categoria;
        document.querySelector("#quantidade-produto").value = produto.quantidade;
        document.querySelector("#preco-produto").value = produto.preco;
        document.querySelector("#estoque-minimo").value = produto.estoqueMinimo;

        tituloFormulario.textContent = "Editar produto";
        botaoSalvar.textContent = "Salvar alterações";

        formularioProduto.hidden = false;
    });

    // Botão Excluir
    const botaoExcluir = document.createElement("button");

    botaoExcluir.type = "button";
    botaoExcluir.textContent = "Excluir";

    botaoExcluir.addEventListener("click", () => {
        const confirmar = confirm(
            `Tem certeza que deseja excluir "${produto.nome}"?`
        );

        if (!confirmar) {
            return;
        }

        produtos = produtos.filter((item) => item !== produto);

        salvarProdutos();
        carregarProdutos();
    });

    // Adicionar os botões à tabela
    colunaAcoes.appendChild(botaoEditar);
    colunaAcoes.appendChild(botaoExcluir);
}

// Criar linha do produto
function criarLinhaProduto(produto) {
    const linha = document.createElement("tr");

    const status = produto.quantidade <= produto.estoqueMinimo
        ? "Estoque baixo"
        : "Disponível";

    const classeStatus = produto.quantidade <= produto.estoqueMinimo
        ? "status-baixo"
        : "status-entrada";

    linha.innerHTML = `
        <td>${produto.nome}</td>
        <td>${produto.categoria}</td>
        <td>${produto.quantidade}</td>
        <td>${produto.preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })}</td>
        <td>
            <span class="${classeStatus}">${status}</span>
        </td>
    `;

    adicionarBotoesAcao(linha, produto);

    return linha;
}

// Mostrar os produtos na tabela
function carregarProdutos() {
    tabelaProdutos.innerHTML = "";

    produtos.forEach((produto) => {
        const linha = criarLinhaProduto(produto);

        tabelaProdutos.appendChild(linha);
    });
}

// Carregar tabela ao abrir a página
carregarProdutos();

// Pesquisar produtos
campoBusca.addEventListener("input", () => {
    const busca = campoBusca.value.toLowerCase();
    const linhasProdutos = document.querySelectorAll("tbody tr");

    linhasProdutos.forEach((linha) => {
        const textoLinha = linha.textContent.toLowerCase();

        linha.style.display = textoLinha.includes(busca)
            ? ""
            : "none";
    });
});

// Mostrar ou esconder formulário
botaoAdicionar.addEventListener("click", () => {
    if (!formularioProduto.hidden && produtoEmEdicao !== null) {
        resetarFormulario();
        return;
    }

    produtoEmEdicao = null;

    formProduto.reset();

    tituloFormulario.textContent = "Adicionar produto";
    botaoSalvar.textContent = "Salvar produto";

    formularioProduto.hidden = !formularioProduto.hidden;
});

// Cancelar cadastro ou edição
botaoCancelar.addEventListener("click", () => {
    resetarFormulario();
});

// Cadastrar ou editar produto
formProduto.addEventListener("submit", (evento) => {
    evento.preventDefault();

    // Ler os valores do formulário
    const nome = document.querySelector("#nome-produto").value.trim();
    const categoria = document.querySelector("#categoria-produto").value.trim();

    const quantidade = Number(
        document.querySelector("#quantidade-produto").value
    );

    const preco = Number(
        document.querySelector("#preco-produto").value
    );

    const estoqueMinimo = Number(
        document.querySelector("#estoque-minimo").value
    );

    // Validar nome e categoria
    if (nome === "" || categoria === "") {
        alert("Preencha o nome e a categoria do produto.");
        return;
    }

    // Validar quantidade
    if (
        !Number.isInteger(quantidade) ||
        quantidade < 0
    ) {
        alert("A quantidade deve ser um número inteiro igual ou maior que zero.");
        return;
    }

    // Validar preço
    if (
        !Number.isFinite(preco) ||
        preco < 0
    ) {
        alert("O preço deve ser um número válido igual ou maior que zero.");
        return;
    }

    // Validar estoque mínimo
    if (
        !Number.isInteger(estoqueMinimo) ||
        estoqueMinimo < 0
    ) {
        alert("O estoque mínimo deve ser um número inteiro igual ou maior que zero.");
        return;
    }

    // Criar objeto do produto
    const novoProduto = {
        nome,
        categoria,
        quantidade,
        preco,
        estoqueMinimo
    };

    // Atualizar produto existente ou cadastrar novo
    if (produtoEmEdicao !== null) {
        const indice = produtos.indexOf(produtoEmEdicao);

        if (indice !== -1) {
            produtos[indice] = novoProduto;
        } else {
            alert("Não foi possível encontrar o produto para editar.");
            resetarFormulario();
            return;
        }
    } else {
        produtos.push(novoProduto);
    }

    // Salvar e atualizar a tabela
    salvarProdutos();
    carregarProdutos();

    // Limpar e fechar o formulário
    resetarFormulario();
});