
const CHAVE_FORNECEDORES = "stockpro_fornecedores";

const formulario = document.querySelector("#form-fornecedor");
const campoId = document.querySelector("#fornecedor-id");
const campoNome = document.querySelector("#nome");
const campoEmpresa = document.querySelector("#empresa");
const campoTelefone = document.querySelector("#telefone");
const campoEmail = document.querySelector("#email");
const campoEndereco = document.querySelector("#endereco");

const tituloFormulario = document.querySelector("#titulo-formulario");
const totalFornecedores = document.querySelector("#total-fornecedores");
const pesquisaFornecedor = document.querySelector("#pesquisa-fornecedor");
const tabelaFornecedores = document.querySelector("#tabela-fornecedores");
const mensagemTabela = document.querySelector("#mensagem-tabela");
const mensagemFornecedor = document.querySelector("#mensagem-fornecedor");
const botaoCancelar = document.querySelector("#btn-cancelar");

let fornecedores = carregarFornecedores();

function carregarFornecedores() {
    try {
        const dados = localStorage.getItem(CHAVE_FORNECEDORES);

        if (!dados) {
            return [];
        }

        const resultado = JSON.parse(dados);

        return Array.isArray(resultado) ? resultado : [];
    } catch (erro) {
        console.error("Erro ao carregar fornecedores:", erro);
        return [];
    }
}

function salvarFornecedores() {
    try {
        localStorage.setItem(
            CHAVE_FORNECEDORES,
            JSON.stringify(fornecedores)
        );

        return true;
    } catch (erro) {
        console.error("Erro ao salvar fornecedores:", erro);

        alert("Não foi possível salvar os dados no navegador.");
        return false;
    }
}

function gerarId() {
    return crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function criarCelula(valor) {
    const celula = document.createElement("td");
    celula.textContent = valor || "—";
    return celula;
}

function mostrarMensagem(texto) {
    mensagemFornecedor.textContent = texto;
}

function renderizarFornecedores() {
    const termo = pesquisaFornecedor.value.trim().toLowerCase();

    const filtrados = fornecedores.filter((fornecedor) => {
        return [
            fornecedor.nome,
            fornecedor.empresa,
            fornecedor.telefone,
            fornecedor.email
        ].some((valor) =>
            String(valor || "").toLowerCase().includes(termo)
        );
    });

    tabelaFornecedores.innerHTML = "";

    totalFornecedores.textContent = fornecedores.length;

    mensagemTabela.hidden = filtrados.length > 0;

    mensagemTabela.textContent = termo
        ? "Nenhum fornecedor encontrado para essa pesquisa."
        : "Nenhum fornecedor cadastrado.";

    filtrados.forEach((fornecedor) => {
        const linha = document.createElement("tr");

        linha.appendChild(criarCelula(fornecedor.nome));
        linha.appendChild(criarCelula(fornecedor.empresa));
        linha.appendChild(criarCelula(fornecedor.telefone));
        linha.appendChild(criarCelula(fornecedor.email));

        const celulaAcoes = document.createElement("td");
        const grupoAcoes = document.createElement("div");
        grupoAcoes.className = "acoes-fornecedor";

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.className = "acao-fornecedor acao-editar";
        botaoEditar.textContent = "Editar";
        botaoEditar.setAttribute(
            "aria-label",
            `Editar fornecedor ${fornecedor.empresa}`
        );

        botaoEditar.addEventListener("click", () => {
            editarFornecedor(fornecedor.id);
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.className = "acao-fornecedor acao-excluir";
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.setAttribute(
            "aria-label",
            `Excluir fornecedor ${fornecedor.empresa}`
        );

        botaoExcluir.addEventListener("click", () => {
            excluirFornecedor(fornecedor.id);
        });

        grupoAcoes.append(botaoEditar, botaoExcluir);
        celulaAcoes.appendChild(grupoAcoes);
        linha.appendChild(celulaAcoes);

        tabelaFornecedores.appendChild(linha);
    });
}

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const dados = {
        nome: campoNome.value.trim(),
        empresa: campoEmpresa.value.trim(),
        telefone: campoTelefone.value.trim(),
        email: campoEmail.value.trim(),
        endereco: campoEndereco.value.trim()
    };

    if (!dados.nome || !dados.empresa || !dados.telefone) {
        mostrarMensagem("Preencha os campos obrigatórios.");
        return;
    }

    const idEdicao = campoId.value;

    if (idEdicao) {
        const indice = fornecedores.findIndex(
            (fornecedor) => fornecedor.id === idEdicao
        );

        if (indice === -1) {
            mostrarMensagem("Fornecedor não encontrado.");
            return;
        }

        fornecedores[indice] = {
            ...fornecedores[indice],
            ...dados
        };

        if (!salvarFornecedores()) {
            fornecedores = carregarFornecedores();
            return;
        }

        mostrarMensagem("Fornecedor atualizado com sucesso.");
    } else {
        const novoFornecedor = {
            id: gerarId(),
            ...dados,
            criadoEm: new Date().toISOString()
        };

        fornecedores.push(novoFornecedor);

        if (!salvarFornecedores()) {
            fornecedores = carregarFornecedores();
            return;
        }

        mostrarMensagem("Fornecedor cadastrado com sucesso.");
    }

    formulario.reset();
    campoId.value = "";
    tituloFormulario.textContent = "Cadastrar fornecedor";
    botaoCancelar.hidden = true;

    renderizarFornecedores();
});

function editarFornecedor(id) {
    const fornecedor = fornecedores.find(
        (item) => item.id === id
    );

    if (!fornecedor) {
        mostrarMensagem("Fornecedor não encontrado.");
        return;
    }

    campoId.value = fornecedor.id;
    campoNome.value = fornecedor.nome || "";
    campoEmpresa.value = fornecedor.empresa || "";
    campoTelefone.value = fornecedor.telefone || "";
    campoEmail.value = fornecedor.email || "";
    campoEndereco.value = fornecedor.endereco || "";

    tituloFormulario.textContent = "Editar fornecedor";
    botaoCancelar.hidden = false;

    mostrarMensagem("");

    formulario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    campoNome.focus();
}

function excluirFornecedor(id) {
    const fornecedor = fornecedores.find(
        (item) => item.id === id
    );

    if (!fornecedor) {
        mostrarMensagem("Fornecedor não encontrado.");
        return;
    }

    const confirmar = confirm(
        `Deseja excluir o fornecedor "${fornecedor.empresa}"?`
    );

    if (!confirmar) {
        return;
    }

    const anteriores = fornecedores;

    fornecedores = fornecedores.filter(
        (item) => item.id !== id
    );

    if (!salvarFornecedores()) {
        fornecedores = anteriores;
        return;
    }

    if (campoId.value === id) {
        formulario.reset();
        campoId.value = "";
        tituloFormulario.textContent = "Cadastrar fornecedor";
        botaoCancelar.hidden = true;
    }

    mostrarMensagem("Fornecedor excluído com sucesso.");
    renderizarFornecedores();
}

botaoCancelar.addEventListener("click", () => {
    formulario.reset();
    campoId.value = "";
    tituloFormulario.textContent = "Cadastrar fornecedor";
    botaoCancelar.hidden = true;

    mostrarMensagem("");
});

pesquisaFornecedor.addEventListener("input", () => {
    renderizarFornecedores();
});

renderizarFornecedores();
