const CHAVE_CATEGORIAS = "stockpro_categorias";
const CHAVE_PRODUTOS = "stockpro_produtos";

const formulario = document.querySelector("#form-categoria");
const campoId = document.querySelector("#categoria-id");
const campoNome = document.querySelector("#nome-categoria");
const campoDescricao = document.querySelector("#descricao-categoria");

const tituloFormulario = document.querySelector("#titulo-formulario");
const totalCategorias = document.querySelector("#total-categorias");
const buscarCategoria = document.querySelector("#buscar-categoria");
const tabelaCategorias = document.querySelector("#tabela-categorias");

const mensagemCategoria = document.querySelector("#mensagem-categoria");
const mensagemTabela = document.querySelector("#mensagem-tabela-categorias");
const botaoCancelar = document.querySelector("#btn-cancelar-categoria");

let categorias = carregarLista(CHAVE_CATEGORIAS);

function carregarLista(chave) {
    try {
        const dados = localStorage.getItem(chave);

        if (!dados) {
            return [];
        }

        const resultado = JSON.parse(dados);

        return Array.isArray(resultado) ? resultado : [];
    } catch (erro) {
        console.error(`Erro ao carregar ${chave}:`, erro);
        return [];
    }
}

function salvarCategorias() {
    try {
        localStorage.setItem(
            CHAVE_CATEGORIAS,
            JSON.stringify(categorias)
        );

        return true;
    } catch (erro) {
        console.error("Erro ao salvar categorias:", erro);
        alert("Não foi possível salvar as categorias no navegador.");
        return false;
    }
}

function gerarId() {
    return crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizarNome(nome) {
    return nome.trim().toLocaleLowerCase("pt-BR");
}

function mostrarMensagem(texto) {
    mensagemCategoria.textContent = texto;
}

function criarCelula(valor) {
    const celula = document.createElement("td");
    celula.textContent = valor || "—";
    return celula;
}

function renderizarCategorias() {
    const termo = buscarCategoria.value.trim().toLocaleLowerCase("pt-BR");

    const filtradas = categorias.filter((categoria) => {
        return (
            String(categoria.nome || "").toLocaleLowerCase("pt-BR").includes(termo) ||
            String(categoria.descricao || "").toLocaleLowerCase("pt-BR").includes(termo)
        );
    });

    tabelaCategorias.innerHTML = "";
    totalCategorias.textContent = categorias.length;

    mensagemTabela.hidden = filtradas.length > 0;

    mensagemTabela.textContent = termo
        ? "Nenhuma categoria encontrada."
        : "Nenhuma categoria cadastrada.";

    filtradas.forEach((categoria) => {
        const linha = document.createElement("tr");

        linha.appendChild(criarCelula(categoria.nome));
        linha.appendChild(criarCelula(categoria.descricao));

        const celulaAcoes = document.createElement("td");
        const grupoAcoes = document.createElement("div");

        grupoAcoes.className = "acoes-categoria";

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.className = "acao-categoria acao-editar-categoria";
        botaoEditar.textContent = "Editar";

        botaoEditar.addEventListener("click", () => {
            editarCategoria(categoria.id);
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.className = "acao-categoria acao-excluir-categoria";
        botaoExcluir.textContent = "Excluir";

        botaoExcluir.addEventListener("click", () => {
            excluirCategoria(categoria.id);
        });

        grupoAcoes.append(botaoEditar, botaoExcluir);
        celulaAcoes.appendChild(grupoAcoes);
        linha.appendChild(celulaAcoes);

        tabelaCategorias.appendChild(linha);
    });
}

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nome = campoNome.value.trim();
    const descricao = campoDescricao.value.trim();
    const idEdicao = campoId.value;

    if (!nome) {
        mostrarMensagem("Informe o nome da categoria.");
        return;
    }

    const nomeDuplicado = categorias.some((categoria) => {
        return (
            normalizarNome(categoria.nome) === normalizarNome(nome) &&
            categoria.id !== idEdicao
        );
    });

    if (nomeDuplicado) {
        mostrarMensagem("Já existe uma categoria com esse nome.");
        return;
    }

    const categoriasAnteriores = categorias.map((categoria) => ({
        ...categoria
    }));

    if (idEdicao) {
        const indice = categorias.findIndex(
            (categoria) => categoria.id === idEdicao
        );

        if (indice === -1) {
            mostrarMensagem("Categoria não encontrada.");
            return;
        }

        categorias[indice] = {
            ...categorias[indice],
            nome,
            descricao
        };
    } else {
        categorias.push({
            id: gerarId(),
            nome,
            descricao,
            criadaEm: new Date().toISOString()
        });
    }

    if (!salvarCategorias()) {
        categorias = categoriasAnteriores;
        return;
    }

    mostrarMensagem(
        idEdicao
            ? "Categoria atualizada com sucesso."
            : "Categoria cadastrada com sucesso."
    );

    limparFormulario();
    renderizarCategorias();
});

function editarCategoria(id) {
    const categoria = categorias.find(
        (item) => item.id === id
    );

    if (!categoria) {
        mostrarMensagem("Categoria não encontrada.");
        return;
    }

    campoId.value = categoria.id;
    campoNome.value = categoria.nome || "";
    campoDescricao.value = categoria.descricao || "";

    tituloFormulario.textContent = "Editar categoria";
    botaoCancelar.hidden = false;

    mostrarMensagem("");

    formulario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    campoNome.focus();
}

function excluirCategoria(id) {
    const categoria = categorias.find(
        (item) => item.id === id
    );

    if (!categoria) {
        mostrarMensagem("Categoria não encontrada.");
        return;
    }

    // Evita excluir uma categoria que ainda está sendo usada por produtos.
    const produtos = carregarLista(CHAVE_PRODUTOS);

    const categoriaEmUso = produtos.some((produto) => {
        return normalizarNome(produto.categoria || "") ===
            normalizarNome(categoria.nome);
    });

    if (categoriaEmUso) {
        mostrarMensagem(
            "Não é possível excluir esta categoria porque ela está associada a um ou mais produtos."
        );
        return;
    }

    const confirmar = confirm(
        `Deseja excluir a categoria "${categoria.nome}"?`
    );

    if (!confirmar) {
        return;
    }

    const categoriasAnteriores = categorias;

    categorias = categorias.filter(
        (item) => item.id !== id
    );

    if (!salvarCategorias()) {
        categorias = categoriasAnteriores;
        return;
    }

    if (campoId.value === id) {
        limparFormulario();
    }

    mostrarMensagem("Categoria excluída com sucesso.");
    renderizarCategorias();
}

function limparFormulario() {
    formulario.reset();
    campoId.value = "";
    tituloFormulario.textContent = "Cadastrar categoria";
    botaoCancelar.hidden = true;
}

botaoCancelar.addEventListener("click", () => {
    limparFormulario();
    mostrarMensagem("");
});

buscarCategoria.addEventListener("input", renderizarCategorias);

renderizarCategorias();