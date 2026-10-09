const campoBusca = document.querySelector("#buscar-produto");
const botaoAdicionar = document.querySelector("#btn-adicionar");
const formularioProduto = document.querySelector("#formulario-produto");
const formProduto = document.querySelector("#form-produto");
const tabelaProdutos = document.querySelector("tbody");

const chaveProdutos = "stockpro_produtos";

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

    localStorage.setItem(chaveProdutos, JSON.stringify(produtos));
}

// Salvar produtos
function salvarProdutos() {
    localStorage.setItem(
        chaveProdutos,
        JSON.stringify(produtos)
    );
}

// Criar botão de exclusão
function adicionarBotaoExcluir(linha, produto) {
    const colunaAcoes = linha.insertCell(-1);
    const botaoExcluir = document.createElement("button");

    botaoExcluir.type = "button";
    botaoExcluir.textContent = "Excluir";

    colunaAcoes.appendChild(botaoExcluir);

    botaoExcluir.addEventListener("click", () => {
        linha.remove();

        produtos = produtos.filter((item) => item !== produto);
        salvarProdutos();
    });
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

    adicionarBotaoExcluir(linha, produto);

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

carregarProdutos();

// Buscar produtos
campoBusca.addEventListener("input", () => {
    const busca = campoBusca.value.toLowerCase();
    const linhasProdutos = document.querySelectorAll("tbody tr");

    linhasProdutos.forEach((linha) => {
        const nomeProduto = linha.textContent.toLowerCase();

        linha.style.display = nomeProduto.includes(busca)
            ? ""
            : "none";
    });
});

// Mostrar ou esconder o formulário
botaoAdicionar.addEventListener("click", () => {
    formularioProduto.hidden = !formularioProduto.hidden;
});

// Cadastrar produto
formProduto.addEventListener("submit", (evento) => {
    evento.preventDefault();

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

    const novoProduto = {
        nome,
        categoria,
        quantidade,
        preco,
        estoqueMinimo
    };

    produtos.push(novoProduto);
    salvarProdutos();

    const novaLinha = criarLinhaProduto(novoProduto);
    tabelaProdutos.appendChild(novaLinha);

    formProduto.reset();
    formularioProduto.hidden = true;
});