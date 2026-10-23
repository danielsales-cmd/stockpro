// ========================================
// ELEMENTOS DA PÁGINA
// ========================================

const campoBusca = document.querySelector("#buscar-produto");
const botaoAdicionar = document.querySelector("#btn-adicionar");
const formularioProduto = document.querySelector("#formulario-produto");
const formProduto = document.querySelector("#form-produto");
const tabelaProdutos = document.querySelector("tbody");

const totalProdutos = document.querySelector("#total-produtos");
const produtosEstoqueBaixo = document.querySelector("#produtos-estoque-baixo");
const valorTotalEstoque = document.querySelector("#valor-total-estoque");

const tituloFormulario = document.querySelector("#titulo-formulario");
const botaoSalvar = document.querySelector("#btn-salvar");
const botaoCancelar = document.querySelector("#btn-cancelar");

const campoNome = document.querySelector("#nome-produto");
const campoCategoria = document.querySelector("#categoria-produto");
const campoQuantidade = document.querySelector("#quantidade-produto");
const campoPreco = document.querySelector("#preco-produto");
const campoEstoqueMinimo = document.querySelector("#estoque-minimo");

// ========================================
// CHAVES DO LOCALSTORAGE
// ========================================

const chaveProdutos = "stockpro_produtos";
const chaveCategorias = "stockpro_categorias";

let produtoEmEdicao = null;

// ========================================
// CARREGAR DADOS
// ========================================

function lerLista(chave) {
    try {
        const dados = localStorage.getItem(chave);

        if (dados === null) {
            return null;
        }

        const resultado = JSON.parse(dados);

        return Array.isArray(resultado) ? resultado : [];

    } catch (erro) {
        console.error(`Erro ao ler ${chave}:`, erro);
        return [];
    }
}

let produtos = lerLista(chaveProdutos);

// Criar produtos iniciais somente na primeira utilização.
// Se o usuário excluir todos os produtos, eles não reaparecerão.

if (produtos === null) {
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

// ========================================
// CATEGORIAS
// ========================================

function normalizarNome(nome) {
    return String(nome || "")
        .trim()
        .toLocaleLowerCase("pt-BR");
}

function gerarId() {
    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function carregarCategorias() {
    const categoriasSalvas = lerLista(chaveCategorias);

    let categorias = categoriasSalvas || [];

    // Aproveitar as categorias dos produtos existentes.
    // Isso evita perder as categorias dos produtos antigos.

    let houveAlteracao = false;

    produtos.forEach((produto) => {
        const nomeCategoria = String(produto.categoria || "").trim();

        if (!nomeCategoria) {
            return;
        }

        const jaExiste = categorias.some((categoria) => {
            return normalizarNome(categoria.nome) ===
                normalizarNome(nomeCategoria);
        });

        if (!jaExiste) {
            categorias.push({
                id: gerarId(),
                nome: nomeCategoria,
                descricao: "",
                criadaEm: new Date().toISOString()
            });

            houveAlteracao = true;
        }
    });

    if (categoriasSalvas === null || houveAlteracao) {
        localStorage.setItem(
            chaveCategorias,
            JSON.stringify(categorias)
        );
    }

    return categorias;
}

function atualizarOpcoesCategoria(categoriaSelecionada = "") {
    const categorias = carregarCategorias();

    campoCategoria.innerHTML = "";

    const opcaoInicial = document.createElement("option");

    opcaoInicial.value = "";
    opcaoInicial.textContent = "Selecione uma categoria";

    campoCategoria.appendChild(opcaoInicial);

    categorias
        .filter((categoria) => categoria && categoria.nome)
        .sort((a, b) => {
            return a.nome.localeCompare(b.nome, "pt-BR");
        })
        .forEach((categoria) => {
            const opcao = document.createElement("option");

            opcao.value = categoria.nome;
            opcao.textContent = categoria.nome;

            campoCategoria.appendChild(opcao);
        });

    campoCategoria.value = categoriaSelecionada;
}

// ========================================
// SALVAR PRODUTOS
// ========================================

function salvarProdutos() {
    try {
        localStorage.setItem(
            chaveProdutos,
            JSON.stringify(produtos)
        );

        return true;

    } catch (erro) {
        console.error("Erro ao salvar produtos:", erro);

        alert("Não foi possível salvar os produtos no navegador.");

        return false;
    }
}

// ========================================
// RESETAR FORMULÁRIO
// ========================================

function resetarFormulario() {
    produtoEmEdicao = null;

    formProduto.reset();

    atualizarOpcoesCategoria();

    tituloFormulario.textContent = "Adicionar produto";
    botaoSalvar.textContent = "Salvar produto";

    formularioProduto.hidden = true;
}

// ========================================
// BOTÕES DE AÇÃO
// ========================================

function adicionarBotoesAcao(linha, produto) {
    const colunaAcoes = linha.insertCell(-1);

    // Organizar os botões de ação.

    colunaAcoes.classList.add("acoes-tabela");

    // ------------------------------------
    // BOTÃO EDITAR
    // ------------------------------------

    const botaoEditar = document.createElement("button");

    botaoEditar.type = "button";
    botaoEditar.textContent = "Editar";

    // Classe utilizada pelo CSS.
    botaoEditar.classList.add("btn-editar");

    botaoEditar.addEventListener("click", () => {
        produtoEmEdicao = produto;

        atualizarOpcoesCategoria(produto.categoria);

        campoNome.value = produto.nome;
        campoQuantidade.value = produto.quantidade;
        campoPreco.value = produto.preco;
        campoEstoqueMinimo.value = produto.estoqueMinimo;

        tituloFormulario.textContent = "Editar produto";
        botaoSalvar.textContent = "Salvar alterações";

        formularioProduto.hidden = false;

        formularioProduto.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    // ------------------------------------
    // BOTÃO EXCLUIR
    // ------------------------------------

    const botaoExcluir = document.createElement("button");

    botaoExcluir.type = "button";
    botaoExcluir.textContent = "Excluir";

    // Classe utilizada pelo CSS.
    botaoExcluir.classList.add("btn-excluir");

    botaoExcluir.addEventListener("click", () => {
        const confirmar = confirm(
            `Tem certeza que deseja excluir "${produto.nome}"?`
        );

        if (!confirmar) {
            return;
        }

        const produtosAnteriores = produtos;

        produtos = produtos.filter((item) => item !== produto);

        if (!salvarProdutos()) {
            produtos = produtosAnteriores;
            return;
        }

        if (produtoEmEdicao === produto) {
            resetarFormulario();
        }

        carregarProdutos();
    });

    // Adicionar os botões à tabela.

    colunaAcoes.appendChild(botaoEditar);
    colunaAcoes.appendChild(botaoExcluir);
}

// ========================================
// CRIAR LINHA DA TABELA
// ========================================

function criarLinhaProduto(produto) {
    const linha = document.createElement("tr");

    const quantidade = Number(produto.quantidade);
    const estoqueMinimo = Number(produto.estoqueMinimo);
    const preco = Number(produto.preco);

    const estoqueBaixo = quantidade <= estoqueMinimo;

    const status = estoqueBaixo
        ? "Estoque baixo"
        : "Disponível";

    const classeStatus = estoqueBaixo
        ? "status-baixo"
        : "status-entrada";

    function adicionarCelula(valor) {
        const celula = document.createElement("td");

        celula.textContent = valor;

        linha.appendChild(celula);
    }

    adicionarCelula(produto.nome);
    adicionarCelula(produto.categoria);
    adicionarCelula(quantidade);

    adicionarCelula(
        preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
    );

    // Coluna de status.

    const celulaStatus = document.createElement("td");
    const indicadorStatus = document.createElement("span");

    indicadorStatus.className = classeStatus;
    indicadorStatus.textContent = status;

    celulaStatus.appendChild(indicadorStatus);
    linha.appendChild(celulaStatus);

    // Coluna com os botões de ação.

    adicionarBotoesAcao(linha, produto);

    return linha;
}

// ========================================
// CARREGAR E ATUALIZAR A TABELA
// ========================================

function carregarProdutos() {
    tabelaProdutos.innerHTML = "";

    produtos.forEach((produto) => {
        const linha = criarLinhaProduto(produto);

        tabelaProdutos.appendChild(linha);
    });

    // Total de produtos cadastrados.

    totalProdutos.textContent = produtos.length;

    // Produtos com estoque baixo.

    const quantidadeEstoqueBaixo = produtos.filter((produto) => {
        return Number(produto.quantidade) <=
            Number(produto.estoqueMinimo);
    }).length;

    produtosEstoqueBaixo.textContent = quantidadeEstoqueBaixo;

    // Valor total do estoque.

    const valorTotal = produtos.reduce((total, produto) => {
        return total +
            Number(produto.quantidade) * Number(produto.preco);
    }, 0);

    valorTotalEstoque.textContent = valorTotal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    // Manter a pesquisa aplicada após atualizar a tabela.

    aplicarBusca();
}

// ========================================
// PESQUISAR PRODUTOS
// ========================================

function aplicarBusca() {
    const busca = campoBusca.value
        .trim()
        .toLocaleLowerCase("pt-BR");

    const linhasProdutos = tabelaProdutos.querySelectorAll("tr");

    linhasProdutos.forEach((linha) => {
        const textoLinha = linha.textContent
            .toLocaleLowerCase("pt-BR");

        linha.style.display = textoLinha.includes(busca)
            ? ""
            : "none";
    });
}

campoBusca.addEventListener("input", aplicarBusca);

// ========================================
// ABRIR FORMULÁRIO
// ========================================

botaoAdicionar.addEventListener("click", () => {
    if (!formularioProduto.hidden && produtoEmEdicao !== null) {
        resetarFormulario();
        return;
    }

    produtoEmEdicao = null;

    formProduto.reset();

    atualizarOpcoesCategoria();

    tituloFormulario.textContent = "Adicionar produto";
    botaoSalvar.textContent = "Salvar produto";

    formularioProduto.hidden = !formularioProduto.hidden;
});

// ========================================
// CANCELAR CADASTRO OU EDIÇÃO
// ========================================

botaoCancelar.addEventListener("click", () => {
    resetarFormulario();
});

// ========================================
// CADASTRAR OU EDITAR PRODUTO
// ========================================

formProduto.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nome = campoNome.value.trim();
    const categoria = campoCategoria.value;

    const quantidade = Number(campoQuantidade.value);
    const preco = Number(campoPreco.value);
    const estoqueMinimo = Number(campoEstoqueMinimo.value);

    // Validar nome e categoria.

    if (!nome || !categoria) {
        alert("Preencha o nome e selecione uma categoria.");
        return;
    }

    // Garantir que a categoria ainda esteja cadastrada.

    const categorias = carregarCategorias();

    const categoriaValida = categorias.some((item) => {
        return normalizarNome(item.nome) === normalizarNome(categoria);
    });

    if (!categoriaValida) {
        alert("Essa categoria não está mais cadastrada. Selecione outra.");

        atualizarOpcoesCategoria();

        return;
    }

    // Validar quantidade.

    if (!Number.isInteger(quantidade) || quantidade < 0) {
        alert(
            "A quantidade deve ser um número inteiro igual ou maior que zero."
        );

        return;
    }

    // Validar preço.

    if (!Number.isFinite(preco) || preco < 0) {
        alert(
            "O preço deve ser um número válido igual ou maior que zero."
        );

        return;
    }

    // Validar estoque mínimo.

    if (!Number.isInteger(estoqueMinimo) || estoqueMinimo < 0) {
        alert(
            "O estoque mínimo deve ser um número inteiro igual ou maior que zero."
        );

        return;
    }

    // Criar objeto do produto.

    const novoProduto = {
        nome,
        categoria,
        quantidade,
        preco,
        estoqueMinimo
    };

    const produtosAnteriores = produtos;

    // Atualizar produto existente ou cadastrar novo.

    if (produtoEmEdicao !== null) {
        const indice = produtos.indexOf(produtoEmEdicao);

        if (indice === -1) {
            alert("Não foi possível encontrar o produto para editar.");

            resetarFormulario();

            return;
        }

        produtos = [...produtos];

        produtos[indice] = novoProduto;

    } else {
        produtos = [...produtos, novoProduto];
    }

    // Salvar e atualizar a tabela.

    if (!salvarProdutos()) {
        produtos = produtosAnteriores;
        return;
    }

    carregarProdutos();

    resetarFormulario();
});

// ========================================
// INICIALIZAÇÃO
// ========================================

// Carregar as categorias e a tabela ao abrir a página.

atualizarOpcoesCategoria();
carregarProdutos();

// ========================================
// SINCRONIZAÇÃO ENTRE ABAS
// ========================================

// Atualizar as opções se as categorias forem alteradas
// em outra aba do navegador.

window.addEventListener("storage", (evento) => {
    if (evento.key === chaveCategorias || evento.key === null) {
        atualizarOpcoesCategoria(campoCategoria.value);
    }
});

// ========================================
// ATUALIZAR AO RETORNAR À PÁGINA
// ========================================

window.addEventListener("pageshow", () => {
    produtos = lerLista(chaveProdutos) || [];

    atualizarOpcoesCategoria(campoCategoria.value);

    carregarProdutos();
});