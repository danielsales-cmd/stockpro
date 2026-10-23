// ========================================
// CHAVES DO LOCALSTORAGE
// ========================================

const CHAVE_PRODUTOS = "stockpro_produtos";
const CHAVE_MOVIMENTACOES = "stockpro_movimentacoes";

// ========================================
// ELEMENTOS DA PÁGINA
// ========================================

const totalProdutos = document.querySelector("#relatorio-total-produtos");
const totalUnidades = document.querySelector("#relatorio-total-unidades");
const totalEstoqueBaixo = document.querySelector("#relatorio-total-baixo");
const valorEstoque = document.querySelector("#relatorio-valor-estoque");

const tabelaProdutos = document.querySelector("#tabela-relatorio-produtos");
const tabelaEstoqueBaixo = document.querySelector("#tabela-relatorio-estoque-baixo");
const tabelaMovimentacoes = document.querySelector("#tabela-relatorio-movimentacoes");

const buscaProduto = document.querySelector("#filtro-busca-produto");
const filtroCategoria = document.querySelector("#filtro-categoria-relatorio");

const filtroTipoMovimentacao = document.querySelector("#filtro-tipo-movimentacao");
const buscaMovimentacao = document.querySelector("#filtro-busca-movimentacao");

const mensagemProdutos = document.querySelector("#mensagem-produtos");
const mensagemEstoqueBaixo = document.querySelector("#mensagem-estoque-baixo");
const mensagemMovimentacoes = document.querySelector("#mensagem-movimentacoes");

const botaoAtualizar = document.querySelector("#btn-atualizar-relatorios");
const botaoImprimir = document.querySelector("#btn-imprimir-relatorios");
const botaoExportar = document.querySelector("#btn-exportar-produtos");

const dataAtualizacao = document.querySelector("#data-atualizacao");

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

// Ler uma lista salva no localStorage.

function lerLista(chave) {
    try {
        const dados = localStorage.getItem(chave);

        if (dados === null) {
            return [];
        }

        const resultado = JSON.parse(dados);

        return Array.isArray(resultado) ? resultado : [];

    } catch (erro) {
        console.error(`Erro ao ler ${chave}:`, erro);
        return [];
    }
}

// Formatar valores como moeda brasileira.

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Formatar números.

function formatarNumero(valor) {
    return Number(valor || 0).toLocaleString("pt-BR");
}

// Normalizar texto para pesquisas.

function normalizarTexto(texto) {
    return String(texto || "")
        .trim()
        .toLocaleLowerCase("pt-BR");
}

// Criar uma célula de tabela com segurança.

function adicionarCelula(linha, valor) {
    const celula = document.createElement("td");

    celula.textContent = valor ?? "";

    linha.appendChild(celula);

    return celula;
}

// Criar uma linha com mensagem quando não existem resultados.

function mostrarMensagem(tabela, mensagemElemento, mensagem) {
    tabela.innerHTML = "";

    mensagemElemento.textContent = mensagem;
}

// ========================================
// CARREGAR DADOS
// ========================================

let produtos = [];
let movimentacoes = [];

function carregarDados() {
    produtos = lerLista(CHAVE_PRODUTOS);
    movimentacoes = lerLista(CHAVE_MOVIMENTACOES);
}

// ========================================
// INDICADORES
// ========================================

function atualizarIndicadores() {
    const quantidadeProdutos = produtos.length;

    const quantidadeUnidades = produtos.reduce((total, produto) => {
        return total + Math.max(0, Number(produto.quantidade) || 0);
    }, 0);

    const produtosBaixos = produtos.filter((produto) => {
        const quantidade = Number(produto.quantidade) || 0;
        const minimo = Number(produto.estoqueMinimo) || 0;

        return quantidade <= minimo;
    });

    const valorTotal = produtos.reduce((total, produto) => {
        const quantidade = Number(produto.quantidade) || 0;
        const preco = Number(produto.preco) || 0;

        return total + quantidade * preco;
    }, 0);

    totalProdutos.textContent = formatarNumero(quantidadeProdutos);
    totalUnidades.textContent = formatarNumero(quantidadeUnidades);
    totalEstoqueBaixo.textContent = formatarNumero(produtosBaixos.length);
    valorEstoque.textContent = formatarMoeda(valorTotal);
}

// ========================================
// FILTRO DE CATEGORIAS
// ========================================

function atualizarFiltroCategorias() {
    const categoriaSelecionada = filtroCategoria.value;

    const categorias = [
        ...new Set(
            produtos
                .map((produto) => String(produto.categoria || "").trim())
                .filter(Boolean)
        )
    ].sort((a, b) => a.localeCompare(b, "pt-BR"));

    filtroCategoria.innerHTML = "";

    const opcaoTodas = document.createElement("option");

    opcaoTodas.value = "";
    opcaoTodas.textContent = "Todas as categorias";

    filtroCategoria.appendChild(opcaoTodas);

    categorias.forEach((categoria) => {
        const opcao = document.createElement("option");

        opcao.value = categoria;
        opcao.textContent = categoria;

        filtroCategoria.appendChild(opcao);
    });

    if (categorias.includes(categoriaSelecionada)) {
        filtroCategoria.value = categoriaSelecionada;
    }
}

// ========================================
// RELATÓRIO DE PRODUTOS
// ========================================

function obterProdutosFiltrados() {
    const busca = normalizarTexto(buscaProduto.value);
    const categoria = filtroCategoria.value;

    return produtos.filter((produto) => {
        const nome = normalizarTexto(produto.nome);
        const categoriaProduto = String(produto.categoria || "");

        const correspondeBusca =
            nome.includes(busca) ||
            normalizarTexto(categoriaProduto).includes(busca);

        const correspondeCategoria =
            !categoria || categoriaProduto === categoria;

        return correspondeBusca && correspondeCategoria;
    });
}

function renderizarRelatorioProdutos() {
    const produtosFiltrados = obterProdutosFiltrados();

    tabelaProdutos.innerHTML = "";
    mensagemProdutos.textContent = "";

    if (produtosFiltrados.length === 0) {
        mostrarMensagem(
            tabelaProdutos,
            mensagemProdutos,
            produtos.length === 0
                ? "Nenhum produto cadastrado."
                : "Nenhum produto encontrado com esses filtros."
        );

        return;
    }

    produtosFiltrados.forEach((produto) => {
        const linha = document.createElement("tr");

        const quantidade = Number(produto.quantidade) || 0;
        const preco = Number(produto.preco) || 0;
        const valorTotalProduto = quantidade * preco;

        adicionarCelula(linha, produto.nome || "Sem nome");
        adicionarCelula(linha, produto.categoria || "Sem categoria");
        adicionarCelula(linha, formatarNumero(quantidade));
        adicionarCelula(linha, formatarMoeda(preco));
        adicionarCelula(linha, formatarMoeda(valorTotalProduto));

        tabelaProdutos.appendChild(linha);
    });

    mensagemProdutos.textContent =
        `${formatarNumero(produtosFiltrados.length)} produto(s) encontrado(s).`;
}

// ========================================
// RELATÓRIO DE ESTOQUE BAIXO
// ========================================

function renderizarRelatorioEstoqueBaixo() {
    const produtosBaixos = produtos.filter((produto) => {
        const quantidade = Number(produto.quantidade) || 0;
        const minimo = Number(produto.estoqueMinimo) || 0;

        return quantidade <= minimo;
    });

    tabelaEstoqueBaixo.innerHTML = "";
    mensagemEstoqueBaixo.textContent = "";

    if (produtosBaixos.length === 0) {
        mostrarMensagem(
            tabelaEstoqueBaixo,
            mensagemEstoqueBaixo,
            "Nenhum produto está com estoque baixo."
        );

        return;
    }

    produtosBaixos.forEach((produto) => {
        const linha = document.createElement("tr");

        const quantidade = Number(produto.quantidade) || 0;
        const minimo = Number(produto.estoqueMinimo) || 0;

        const quantidadeParaMinimo = Math.max(0, minimo - quantidade);

        adicionarCelula(linha, produto.nome || "Sem nome");
        adicionarCelula(linha, produto.categoria || "Sem categoria");
        adicionarCelula(linha, formatarNumero(quantidade));
        adicionarCelula(linha, formatarNumero(minimo));
        adicionarCelula(linha, formatarNumero(quantidadeParaMinimo));

        tabelaEstoqueBaixo.appendChild(linha);
    });

    mensagemEstoqueBaixo.textContent =
        `${formatarNumero(produtosBaixos.length)} produto(s) precisam de atenção.`;
}

// ========================================
// NORMALIZAR MOVIMENTAÇÕES
// ========================================

// A estrutura abaixo aceita alguns nomes de propriedades comuns.
// Se o seu movimentacoes.js usar outros nomes, ajustaremos depois.

function obterTipoMovimentacao(movimentacao) {
    const tipoOriginal =
        movimentacao.tipo ??
        movimentacao.tipoMovimentacao ??
        movimentacao.operacao ??
        movimentacao.movimento ??
        "";

    const tipo = normalizarTexto(tipoOriginal);

    if (tipo.includes("entrada") || tipo === "ent") {
        return "entrada";
    }

    if (
        tipo.includes("saida") ||
        tipo.includes("saída") ||
        tipo === "sai"
    ) {
        return "saida";
    }

    return tipo || "não informado";
}

function obterNomeProdutoMovimentacao(movimentacao) {
    const produto = movimentacao.produto;

    if (produto && typeof produto === "object") {
        return (
            produto.nome ||
            produto.nomeProduto ||
            movimentacao.produtoNome ||
            movimentacao.nomeProduto ||
            "Produto não identificado"
        );
    }

    return (
        movimentacao.produtoNome ||
        movimentacao.nomeProduto ||
        (typeof produto === "string" ? produto : "") ||
        movimentacao.nome ||
        "Produto não identificado"
    );
}

function obterQuantidadeMovimentacao(movimentacao) {
    return Number(
        movimentacao.quantidade ??
        movimentacao.qtd ??
        movimentacao.quantidadeMovimentada ??
        0
    ) || 0;
}

function obterDataMovimentacao(movimentacao) {
    const valor =
        movimentacao.data ??
        movimentacao.dataMovimentacao ??
        movimentacao.criadaEm ??
        movimentacao.createdAt ??
        movimentacao.dataHora ??
        "";

    if (!valor) {
        return "Não informada";
    }

    // Datas no formato brasileiro: DD/MM/AAAA.

    const dataBrasileira = String(valor).match(
        /^(\d{2})\/(\d{2})\/(\d{4})$/
    );

    if (dataBrasileira) {
        return valor;
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return String(valor);
    }

    return data.toLocaleDateString("pt-BR");
}

// ========================================
// RELATÓRIO DE MOVIMENTAÇÕES
// ========================================

function obterMovimentacoesFiltradas() {
    const tipoSelecionado = filtroTipoMovimentacao.value;
    const busca = normalizarTexto(buscaMovimentacao.value);

    return movimentacoes
        .filter((movimentacao) => {
            const tipo = obterTipoMovimentacao(movimentacao);
            const nomeProduto = normalizarTexto(
                obterNomeProdutoMovimentacao(movimentacao)
            );

            const correspondeTipo =
                !tipoSelecionado || tipo === tipoSelecionado;

            const correspondeBusca = nomeProduto.includes(busca);

            return correspondeTipo && correspondeBusca;
        })
        .slice()
        .reverse();
}

function renderizarRelatorioMovimentacoes() {
    const movimentacoesFiltradas = obterMovimentacoesFiltradas();

    tabelaMovimentacoes.innerHTML = "";
    mensagemMovimentacoes.textContent = "";

    if (movimentacoesFiltradas.length === 0) {
        mostrarMensagem(
            tabelaMovimentacoes,
            mensagemMovimentacoes,
            movimentacoes.length === 0
                ? "Nenhuma movimentação registrada."
                : "Nenhuma movimentação encontrada com esses filtros."
        );

        return;
    }

    movimentacoesFiltradas.forEach((movimentacao) => {
        const linha = document.createElement("tr");

        const data = obterDataMovimentacao(movimentacao);
        const nomeProduto = obterNomeProdutoMovimentacao(movimentacao);
        const tipo = obterTipoMovimentacao(movimentacao);
        const quantidade = obterQuantidadeMovimentacao(movimentacao);

        const tipoExibido =
            tipo === "entrada"
                ? "Entrada"
                : tipo === "saida"
                    ? "Saída"
                    : tipo;

        adicionarCelula(linha, data);
        adicionarCelula(linha, nomeProduto);
        adicionarCelula(linha, tipoExibido);
        adicionarCelula(linha, formatarNumero(quantidade));

        tabelaMovimentacoes.appendChild(linha);
    });

    mensagemMovimentacoes.textContent =
        `${formatarNumero(movimentacoesFiltradas.length)} movimentação(ões) encontrada(s).`;
}

// ========================================
// ATUALIZAR RELATÓRIOS
// ========================================

function atualizarDataAtualizacao() {
    const agora = new Date();

    dataAtualizacao.textContent =
        "Atualizado em " +
        agora.toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
        });
}

function atualizarRelatorios() {
    carregarDados();

    atualizarIndicadores();
    atualizarFiltroCategorias();

    renderizarRelatorioProdutos();
    renderizarRelatorioEstoqueBaixo();
    renderizarRelatorioMovimentacoes();

    atualizarDataAtualizacao();
}

// ========================================
// IMPRIMIR OU SALVAR EM PDF
// ========================================

botaoImprimir.addEventListener("click", () => {
    window.print();
});

// ========================================
// EXPORTAR PRODUTOS PARA CSV
// ========================================

function protegerValorCSV(valor) {
    let texto = String(valor ?? "");

    // Evita interpretar valores iniciados por operadores
    // como fórmulas em alguns programas de planilha.

    if (/^[\s]*[=+\-@]/.test(texto)) {
        texto = "'" + texto;
    }

    return `"${texto.replace(/"/g, '""')}"`;
}

function exportarProdutosCSV() {
    const cabecalho = [
        "Produto",
        "Categoria",
        "Quantidade",
        "Preço unitário",
        "Valor total"
    ];

    const linhas = produtos.map((produto) => {
        const quantidade = Number(produto.quantidade) || 0;
        const preco = Number(produto.preco) || 0;

        return [
            produto.nome || "",
            produto.categoria || "",
            quantidade,
            preco.toFixed(2).replace(".", ","),
            (quantidade * preco).toFixed(2).replace(".", ",")
        ];
    });

    const conteudo = [
        cabecalho,
        ...linhas
    ]
        .map((linha) => linha.map(protegerValorCSV).join(";"))
        .join("\r\n");

    // BOM UTF-8 para melhorar a compatibilidade com acentos.

    const arquivo = new Blob(
        ["\uFEFF" + conteudo],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");

    link.href = url;
    link.download = "relatorio-produtos-stockpro.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

botaoExportar.addEventListener("click", exportarProdutosCSV);

// ========================================
// EVENTOS DOS FILTROS
// ========================================

buscaProduto.addEventListener("input", renderizarRelatorioProdutos);

filtroCategoria.addEventListener("change", renderizarRelatorioProdutos);

filtroTipoMovimentacao.addEventListener(
    "change",
    renderizarRelatorioMovimentacoes
);

buscaMovimentacao.addEventListener(
    "input",
    renderizarRelatorioMovimentacoes
);

botaoAtualizar.addEventListener("click", atualizarRelatorios);

// ========================================
// SINCRONIZAÇÃO COM OUTRAS ABAS
// ========================================

window.addEventListener("storage", (evento) => {
    if (
        evento.key === CHAVE_PRODUTOS ||
        evento.key === CHAVE_MOVIMENTACOES ||
        evento.key === null
    ) {
        atualizarRelatorios();
    }
});

window.addEventListener("pageshow", () => {
    atualizarRelatorios();
});

// ========================================
// INICIALIZAÇÃO
// ========================================

atualizarRelatorios();