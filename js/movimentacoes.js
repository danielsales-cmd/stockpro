
const formMovimentacao = document.querySelector("#form-movimentacao");

const selectProduto = document.querySelector("#produto-movimentacao");
const selectTipo = document.querySelector("#tipo-movimentacao");
const campoQuantidade = document.querySelector("#quantidade-movimentacao");
const campoMotivo = document.querySelector("#motivo-movimentacao");

const tabelaHistorico = document.querySelector("#historico-movimentacoes");
const mensagemHistorico = document.querySelector("#mensagem-historico");

const chaveProdutos = "stockpro_produtos";
const chaveMovimentacoes = "stockpro_movimentacoes";

// Carregar produtos e histórico
function obterProdutos() {
    const dados = localStorage.getItem(chaveProdutos);
    const produtos = dados ? JSON.parse(dados) : [];

    return Array.isArray(produtos) ? produtos : [];
}

function obterMovimentacoes() {
    const dados = localStorage.getItem(chaveMovimentacoes);
    const movimentacoes = dados ? JSON.parse(dados) : [];

    return Array.isArray(movimentacoes) ? movimentacoes : [];
}

// Salvar dados
function salvarProdutos(produtos) {
    localStorage.setItem(chaveProdutos, JSON.stringify(produtos));
}

function salvarMovimentacoes(movimentacoes) {
    localStorage.setItem(
        chaveMovimentacoes,
        JSON.stringify(movimentacoes)
    );
}

// Preencher o seletor de produtos
function carregarProdutos() {
    const produtos = obterProdutos();

    selectProduto.innerHTML = "";

    const opcaoInicial = document.createElement("option");
    opcaoInicial.value = "";
    opcaoInicial.textContent = "Selecione um produto";

    selectProduto.appendChild(opcaoInicial);

    produtos.forEach((produto, indice) => {
        const opcao = document.createElement("option");

        opcao.value = indice;
        opcao.textContent = `${produto.nome} — Estoque: ${produto.quantidade}`;

        selectProduto.appendChild(opcao);
    });

    selectProduto.disabled = produtos.length === 0;
}

// Mostrar o histórico
function carregarHistorico() {
    const movimentacoes = obterMovimentacoes();

    tabelaHistorico.innerHTML = "";

    mensagemHistorico.hidden = movimentacoes.length > 0;

    const historicoOrdenado = [...movimentacoes].sort((a, b) => {
        return new Date(b.data).getTime() - new Date(a.data).getTime();
    });

    historicoOrdenado.forEach((movimentacao) => {
        const linha = document.createElement("tr");

        const data = new Date(movimentacao.data);
        const dataValida = !Number.isNaN(data.getTime());

        const valores = [
            dataValida ? data.toLocaleString("pt-BR") : "Data indisponível",
            movimentacao.produto,
            movimentacao.tipo === "entrada" ? "Entrada" : "Saída",
            movimentacao.quantidade,
            movimentacao.motivo
        ];

        valores.forEach((valor) => {
            const celula = document.createElement("td");
            celula.textContent = valor;
            linha.appendChild(celula);
        });

        tabelaHistorico.appendChild(linha);
    });
}

// Registrar entrada ou saída
formMovimentacao.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const produtos = obterProdutos();

    const indiceProduto = Number(selectProduto.value);
    const tipo = selectTipo.value;
    const quantidade = Number(campoQuantidade.value);
    const motivo = campoMotivo.value.trim();

    // Validar o produto selecionado
    if (
        selectProduto.value === "" ||
        !Number.isInteger(indiceProduto) ||
        indiceProduto < 0 ||
        indiceProduto >= produtos.length
    ) {
        alert("Selecione um produto válido.");
        return;
    }

    // Validar o tipo de movimentação
    if (tipo !== "entrada" && tipo !== "saida") {
        alert("Selecione um tipo de movimentação válido.");
        return;
    }

    // Validar quantidade e motivo
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
        alert("Informe uma quantidade inteira maior que zero.");
        return;
    }

    if (motivo === "") {
        alert("Informe o motivo da movimentação.");
        return;
    }

    const produto = produtos[indiceProduto];

    // Impedir saída maior que o estoque disponível
    if (tipo === "saida" && quantidade > produto.quantidade) {
        alert(
            `Estoque insuficiente. Disponível: ${produto.quantidade} unidade(s).`
        );
        return;
    }

    // Calcular a nova quantidade
    const novaQuantidade = tipo === "entrada"
        ? produto.quantidade + quantidade
        : produto.quantidade - quantidade;

    // Criar o registro da movimentação
    const movimentacao = {
        produto: produto.nome,
        tipo: tipo,
        quantidade: quantidade,
        motivo: motivo,
        data: new Date().toISOString()
    };

    // Atualizar o estoque
    produto.quantidade = novaQuantidade;

    // Salvar as alterações
    const movimentacoes = obterMovimentacoes();

    movimentacoes.push(movimentacao);

    salvarProdutos(produtos);
    salvarMovimentacoes(movimentacoes);

    // Atualizar a tela
    formMovimentacao.reset();

    carregarProdutos();
    carregarHistorico();

    alert("Movimentação registrada com sucesso!");
});

// Inicializar a página
carregarProdutos();
carregarHistorico();
