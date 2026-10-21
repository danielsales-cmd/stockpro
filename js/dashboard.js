
const CHAVE_PRODUTOS = "stockpro_produtos";
const CHAVE_MOVIMENTACOES = "stockpro_movimentacoes";

// Recupera os dados salvos no navegador.
function lerDados(chave) {
    try {
        const dados = localStorage.getItem(chave);

        if (!dados) {
            return [];
        }

        const resultado = JSON.parse(dados);

        return Array.isArray(resultado) ? resultado : [];
    } catch (erro) {
        console.error(`Erro ao ler ${chave}:`, erro);
        return [];
    }
}

// Elementos dos cards.
const totalUnidades = document.querySelector("#total-unidades");
const totalEstoqueBaixo = document.querySelector("#total-estoque-baixo");
const totalProdutos = document.querySelector("#total-produtos-dashboard");
const valorEstoque = document.querySelector("#valor-estoque");

// Elementos das tabelas.
const tabelaEstoqueBaixo = document.querySelector("#tabela-estoque-baixo");
const tabelaMovimentacoes = document.querySelector("#tabela-movimentacoes");

const mensagemEstoqueVazio = document.querySelector("#mensagem-estoque-vazio");
const mensagemMovimentacoesVazias = document.querySelector(
    "#mensagem-movimentacoes-vazias"
);

// Formata valores monetários.
function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Cria uma célula de tabela usando texto, sem inserir HTML recebido dos dados.
function criarCelula(valor) {
    const celula = document.createElement("td");
    celula.textContent = valor;
    return celula;
}

// Atualiza os quatro cards.
function carregarIndicadores(produtos) {
    const unidades = produtos.reduce((total, produto) => {
        const quantidade = Number(produto.quantidade);
        return total + (Number.isFinite(quantidade) ? quantidade : 0);
    }, 0);

    const produtosBaixos = produtos.filter((produto) => {
        const quantidade = Number(produto.quantidade);
        const minimo = Number(produto.estoqueMinimo);

        return Number.isFinite(quantidade) &&
            Number.isFinite(minimo) &&
            quantidade <= minimo;
    });

    const valorTotal = produtos.reduce((total, produto) => {
        const quantidade = Number(produto.quantidade);
        const preco = Number(produto.preco);

        if (
            !Number.isFinite(quantidade) ||
            !Number.isFinite(preco)
        ) {
            return total;
        }

        return total + quantidade * preco;
    }, 0);

    totalUnidades.textContent = unidades;
    totalEstoqueBaixo.textContent = produtosBaixos.length;
    totalProdutos.textContent = produtos.length;
    valorEstoque.textContent = formatarMoeda(valorTotal);
}

// Mostra os produtos que atingiram ou ficaram abaixo do estoque mínimo.
function carregarEstoqueBaixo(produtos) {
    tabelaEstoqueBaixo.innerHTML = "";

    const produtosBaixos = produtos.filter((produto) => {
        const quantidade = Number(produto.quantidade);
        const minimo = Number(produto.estoqueMinimo);

        return Number.isFinite(quantidade) &&
            Number.isFinite(minimo) &&
            quantidade <= minimo;
    });

    mensagemEstoqueVazio.hidden = produtosBaixos.length > 0;

    produtosBaixos.forEach((produto) => {
        const linha = document.createElement("tr");

        linha.appendChild(criarCelula(produto.nome ?? "Produto sem nome"));
        linha.appendChild(criarCelula(produto.quantidade));

        const celulaStatus = document.createElement("td");
        const status = document.createElement("span");

        status.className = "status status-baixo";
        status.textContent = "Estoque baixo";

        celulaStatus.appendChild(status);
        linha.appendChild(celulaStatus);

        tabelaEstoqueBaixo.appendChild(linha);
    });
}

// Mostra as cinco movimentações mais recentes.
function carregarMovimentacoes() {
    const movimentacoes = lerDados(CHAVE_MOVIMENTACOES);

    tabelaMovimentacoes.innerHTML = "";

    const recentes = movimentacoes
        .filter((movimentacao) => {
            return movimentacao &&
                typeof movimentacao.data === "string" &&
                !Number.isNaN(new Date(movimentacao.data).getTime());
        })
        .sort((a, b) => {
            return new Date(b.data).getTime() -
                new Date(a.data).getTime();
        })
        .slice(0, 5);

    mensagemMovimentacoesVazias.hidden = recentes.length > 0;

    recentes.forEach((movimentacao) => {
        const linha = document.createElement("tr");

        linha.appendChild(
            criarCelula(movimentacao.produto ?? "Produto sem nome")
        );

        const celulaTipo = document.createElement("td");
        const status = document.createElement("span");

        const ehEntrada = movimentacao.tipo === "entrada";

        status.className = ehEntrada
            ? "status status-entrada"
            : "status status-saida";

        status.textContent = ehEntrada ? "Entrada" : "Saída";

        celulaTipo.appendChild(status);
        linha.appendChild(celulaTipo);

        const quantidade = Number(movimentacao.quantidade);
        const quantidadeValida = Number.isFinite(quantidade)
            ? quantidade
            : 0;

        const sinal = ehEntrada ? "+" : "-";

        linha.appendChild(
            criarCelula(`${sinal}${quantidadeValida}`)
        );

        tabelaMovimentacoes.appendChild(linha);
    });
}

// Carrega todas as informações da Dashboard.
function carregarDashboard() {
    const produtos = lerDados(CHAVE_PRODUTOS);

    carregarIndicadores(produtos);
    carregarEstoqueBaixo(produtos);
    carregarMovimentacoes();
}

// Atualiza os dados ao abrir a página.
carregarDashboard();

// Atualiza a Dashboard se outra página ou aba alterar os dados salvos.
window.addEventListener("storage", (evento) => {
    if (
        evento.key === CHAVE_PRODUTOS ||
        evento.key === CHAVE_MOVIMENTACOES ||
        evento.key === null
    ) {
        carregarDashboard();
    }
});

// Atualiza também quando o usuário volta para a Dashboard.
window.addEventListener("pageshow", carregarDashboard);

