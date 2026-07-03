"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { auth } from "../../../lib/firebase";

const ADMIN_EMAILS = [
  "ocimar0102@gmail.com",
  "creatinglab1@gmail.com",
];

function formatarMoeda(valor: number) {
  return `R$ ${Number(valor || 0).toFixed(2).replace(".", ",")}`;
}

function formatarData(valor: any) {
  if (!valor) return "-";

  if (typeof valor === "number") {
    return new Date(valor).toLocaleString("pt-BR");
  }

  if (typeof valor?.toDate === "function") {
    return valor.toDate().toLocaleString("pt-BR");
  }

  if (typeof valor?.seconds === "number") {
    return new Date(valor.seconds * 1000).toLocaleString("pt-BR");
  }

  return "-";
}

export default function AdminComissoesPage() {
  const [carregando, setCarregando] = useState(true);
  const [email, setEmail] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [comissoes, setComissoes] = useState<any[]>([]);
  const [atualizandoId, setAtualizandoId] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [erroCarregamento, setErroCarregamento] = useState("");

  async function obterToken() {
    const user = auth.currentUser;
    if (!user) throw new Error("user_not_authenticated");
    return user.getIdToken();
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      const emailAtual = String(user?.email || "").trim().toLowerCase();
      setEmail(emailAtual);

      const podeVer = ADMIN_EMAILS
        .map((e) => e.toLowerCase())
        .includes(emailAtual);

      setAutorizado(podeVer);

      if (podeVer) {
        try {
          await carregarComissoes();
        } catch (error) {
          const mensagem = String((error as any)?.message || "falha_ao_carregar_comissoes");
          setErroCarregamento(mensagem);
        }
      }

      setCarregando(false);
    });

    return () => unsub();
  }, []);

  async function carregarComissoes() {
    const token = await obterToken();
    const response = await fetch("/api/admin/comissoes", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const mensagem = String(payload?.error || "falha_ao_carregar_comissoes");
      setComissoes([]);
      setErroCarregamento(mensagem);
      return;
    }

    setErroCarregamento("");
    setComissoes(Array.isArray(payload?.comissoes) ? payload.comissoes : []);
  }

  async function alterarStatus(id: string, status: string) {
    try {
      setAtualizandoId(id);

      const token = await obterToken();
      const response = await fetch("/api/admin/comissoes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(String(payload?.error || "falha_ao_atualizar_comissao"));
      }

      await carregarComissoes();
    } catch (error) {
      const mensagem = String((error as any)?.message || "falha_ao_atualizar_comissao");
      setErroCarregamento(mensagem);
    } finally {
      setAtualizandoId("");
    }
  }

  const comissoesFiltradas = useMemo(() => {
    const texto = filtroTexto.trim().toLowerCase();

    return comissoes.filter((c) => {
      const status = String(c.status || "pendente");

      if (filtroStatus !== "todos" && status !== filtroStatus) {
        return false;
      }

      if (!texto) return true;

      const bloco = [
        c.uidIndicador,
        c.uidIndicado,
        c.codigoIndicacao,
        c.assinaturaProductId,
        c.orderId,
        c.status,
      ]
        .map((x) => String(x || "").toLowerCase())
        .join(" ");

      return bloco.includes(texto);
    });
  }, [comissoes, filtroStatus, filtroTexto]);

  const totaisGerais = useMemo(() => {
    return comissoes.reduce(
      (acc, c) => {
        const valor = Number(c.valorComissao || 0);
        const status = String(c.status || "pendente");

        acc.totalComissoes += 1;
        acc.totalGeral += valor;

        if (status === "pendente") acc.pendente += valor;
        if (status === "liberada") acc.liberada += valor;
        if (status === "aprovada") acc.aprovada += valor;
        if (status === "paga") acc.paga += valor;
        if (status === "cancelada") acc.cancelada += valor;
        if (["expirada_sem_pro", "expirada_por_plano", "expirada_por_tempo"].includes(status)) acc.expirada += valor;
        if (status === "bloqueada_pix_invalido") acc.bloqueadaPix += valor;

        return acc;
      },
      {
        totalComissoes: 0,
        totalGeral: 0,
        pendente: 0,
        liberada: 0,
        aprovada: 0,
        paga: 0,
        cancelada: 0,
        expirada: 0,
        bloqueadaPix: 0,
      }
    );
  }, [comissoes]);

  const divulgadores = useMemo(() => {
    const mapa: Record<string, any> = {};

    for (const c of comissoes) {
      const uid = String(c.uidIndicador || "sem_indicador");
      const valor = Number(c.valorComissao || 0);
      const status = String(c.status || "pendente");

      if (!mapa[uid]) {
        mapa[uid] = {
          uidIndicador: uid,
          codigoIndicacao: String(c.codigoIndicacao || ""),
          pendente: 0,
          liberada: 0,
          aprovada: 0,
          paga: 0,
          cancelada: 0,
          expirada: 0,
          bloqueadaPix: 0,
          total: 0,
          qtd: 0,
        };
      }

      mapa[uid].qtd += 1;
      mapa[uid].total += valor;

      if (status === "pendente") mapa[uid].pendente += valor;
      if (status === "liberada") mapa[uid].liberada += valor;
      if (status === "aprovada") mapa[uid].aprovada += valor;
      if (status === "paga") mapa[uid].paga += valor;
      if (status === "cancelada") mapa[uid].cancelada += valor;
      if (["expirada_sem_pro", "expirada_por_plano", "expirada_por_tempo"].includes(status)) mapa[uid].expirada += valor;
      if (status === "bloqueada_pix_invalido") mapa[uid].bloqueadaPix += valor;
    }

    return Object.values(mapa).sort((a: any, b: any) => {
      const aReceber = a.liberada + a.aprovada;
      const bReceber = b.liberada + b.aprovada;
      return bReceber - aReceber;
    });
  }, [comissoes]);

  const prontosParaPagamento = useMemo(() => {
    return divulgadores.filter((d: any) => {
      return Number(d.liberada || 0) + Number(d.aprovada || 0) > 0;
    });
  }, [divulgadores]);

  if (carregando) {
    return <Tela mensagem="Carregando painel financeiro..." />;
  }

  if (!autorizado) {
    return <Tela mensagem={`Acesso negado. Login atual: ${email || "sem login"}`} />;
  }

  return (
    <main style={styles.page}>
      <section style={styles.header}>
        <h1 style={styles.title}>Painel Financeiro — Divulgadores</h1>
        <p style={styles.subtitle}>Logado como: {email}</p>
        {!!erroCarregamento && (
          <p style={{ ...styles.subtitle, color: "#fecaca", marginTop: 6 }}>
            Erro ao carregar comissões: {erroCarregamento}
          </p>
        )}
      </section>

      <section style={styles.cards}>
        <Card titulo="⏳ Pendente" valor={totaisGerais.pendente} />
        <Card titulo="✅ Liberada" valor={totaisGerais.liberada} />
        <Card titulo="🟦 Aprovada" valor={totaisGerais.aprovada} />
        <Card titulo="💵 Paga" valor={totaisGerais.paga} />
        <Card titulo="❌ Expirada sem PRO" valor={totaisGerais.expirada} />
        <Card titulo="⛔ PIX bloqueado" valor={totaisGerais.bloqueadaPix} />
        <Card titulo="🚫 Cancelada" valor={totaisGerais.cancelada} />
      </section>

      <section style={styles.tableBox}>
        <h2 style={styles.sectionTitle}>Usuários prontos para pagamento</h2>

        {prontosParaPagamento.length === 0 ? (
          <p style={styles.empty}>Nenhum divulgador pronto para pagamento.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <Th>Divulgador</Th>
                  <Th>Código</Th>
                  <Th>Liberada</Th>
                  <Th>Aprovada</Th>
                  <Th>Total a pagar</Th>
                  <Th>Comissões</Th>
                </tr>
              </thead>

              <tbody>
                {prontosParaPagamento.map((d: any) => {
                  const totalPagar = Number(d.liberada || 0) + Number(d.aprovada || 0);

                  return (
                    <tr key={d.uidIndicador}>
                      <Td>{d.uidIndicador}</Td>
                      <Td>{d.codigoIndicacao || "-"}</Td>
                      <Td>{formatarMoeda(d.liberada)}</Td>
                      <Td>{formatarMoeda(d.aprovada)}</Td>
                      <Td>
                        <strong style={{ color: "#22c55e" }}>
                          {formatarMoeda(totalPagar)}
                        </strong>
                      </Td>
                      <Td>{d.qtd}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={styles.tableBox}>
        <h2 style={styles.sectionTitle}>Resumo por divulgador</h2>

        {divulgadores.length === 0 ? (
          <p style={styles.empty}>Nenhum divulgador encontrado.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <Th>Divulgador</Th>
                  <Th>Código</Th>
                  <Th>Pendente</Th>
                  <Th>Liberada</Th>
                  <Th>Aprovada</Th>
                  <Th>Paga</Th>
                  <Th>Expirada</Th>
                  <Th>Cancelada</Th>
                  <Th>Total</Th>
                  <Th>Qtd</Th>
                </tr>
              </thead>

              <tbody>
                {divulgadores.map((d: any) => (
                  <tr key={d.uidIndicador}>
                    <Td>{d.uidIndicador}</Td>
                    <Td>{d.codigoIndicacao || "-"}</Td>
                    <Td>{formatarMoeda(d.pendente)}</Td>
                    <Td>{formatarMoeda(d.liberada)}</Td>
                    <Td>{formatarMoeda(d.aprovada)}</Td>
                    <Td>{formatarMoeda(d.paga)}</Td>
                    <Td>{formatarMoeda(d.expirada)}</Td>
                    <Td>{formatarMoeda(d.cancelada)}</Td>
                    <Td>{formatarMoeda(d.total)}</Td>
                    <Td>{d.qtd}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={styles.tableBox}>
        <h2 style={styles.sectionTitle}>Histórico completo</h2>

        <div style={styles.filters}>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            style={styles.input}
          >
            <option value="todos">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="liberada">Liberada</option>
            <option value="aprovada">Aprovada</option>
            <option value="paga">Paga</option>
            <option value="expirada_sem_pro">Expirada sem PRO</option>
            <option value="expirada_por_plano">Expirada por plano</option>
            <option value="expirada_por_tempo">Expirada por tempo</option>
            <option value="bloqueada_pix_invalido">Bloqueada PIX invalido</option>
            <option value="cancelada">Cancelada</option>
          </select>

          <input
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            placeholder="Buscar por UID, código, produto, pedido..."
            style={styles.input}
          />
        </div>

        {comissoesFiltradas.length === 0 ? (
          <p style={styles.empty}>Nenhuma comissão encontrada.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <Th>Status</Th>
                  <Th>Valor</Th>
                  <Th>Indicador</Th>
                  <Th>Indicado</Th>
                  <Th>Código</Th>
                  <Th>Produto</Th>
                  <Th>Pedido</Th>
                  <Th>Criado</Th>
                  <Th>Liberável após</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>

              <tbody>
                {comissoesFiltradas.map((c) => {
                  const id = String(c.id);
                  const status = String(c.status || "pendente");
                  const valor = Number(c.valorComissao || 0);

                  return (
                    <tr key={id}>
                      <Td>{status}</Td>
                      <Td>{formatarMoeda(valor)}</Td>
                      <Td>{String(c.uidIndicador || "-")}</Td>
                      <Td>{String(c.uidIndicado || "-")}</Td>
                      <Td>{String(c.codigoIndicacao || "-")}</Td>
                      <Td>{String(c.assinaturaProductId || "-")}</Td>
                      <Td>{String(c.orderId || "-")}</Td>
                      <Td>{formatarData(c.criadoEmCliente || c.criadoEm)}</Td>
                      <Td>{formatarData(c.liberavelAposCliente || c.liberavelApos)}</Td>
                      <Td>
                        <div style={styles.actions}>
                          <button
                            style={styles.btn}
                            disabled={atualizandoId === id}
                            onClick={() => alterarStatus(id, "liberada")}
                          >
                            Liberar
                          </button>

                          <button
                            style={styles.btn}
                            disabled={atualizandoId === id}
                            onClick={() => alterarStatus(id, "aprovada")}
                          >
                            Aprovar
                          </button>

                          <button
                            style={styles.btnGreen}
                            disabled={atualizandoId === id}
                            onClick={() => alterarStatus(id, "paga")}
                          >
                            Paga
                          </button>

                          <button
                            style={styles.btnDanger}
                            disabled={atualizandoId === id}
                            onClick={() => alterarStatus(id, "cancelada")}
                          >
                            Cancelar
                          </button>

                          <button
                            style={styles.btnDanger}
                            disabled={atualizandoId === id}
                            onClick={() => alterarStatus(id, "expirada_por_plano")}
                          >
                            Expirar plano
                          </button>

                          <button
                            style={styles.btnDanger}
                            disabled={atualizandoId === id}
                            onClick={() => alterarStatus(id, "expirada_por_tempo")}
                          >
                            Expirar tempo
                          </button>

                          <button
                            style={styles.btnDanger}
                            disabled={atualizandoId === id}
                            onClick={() => alterarStatus(id, "bloqueada_pix_invalido")}
                          >
                            Bloquear PIX
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Tela({ mensagem }: { mensagem: string }) {
  return (
    <main style={styles.page}>
      <section style={styles.header}>
        <h1 style={styles.title}>INSANE GPS</h1>
        <p style={styles.subtitle}>{mensagem}</p>
      </section>
    </main>
  );
}

function Card({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{titulo}</div>
      <div style={styles.cardValue}>{formatarMoeda(valor)}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={styles.th}>{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={styles.td}>{children}</td>;
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    color: "#fff",
    padding: 24,
    fontFamily: "Arial, sans-serif",
  },
  header: {
    maxWidth: 1400,
    margin: "0 auto 24px",
    padding: 22,
    borderRadius: 18,
    background: "rgba(15,23,42,0.96)",
    border: "1px solid rgba(34,211,238,0.25)",
  },
  title: {
    margin: 0,
    fontSize: 28,
  },
  subtitle: {
    color: "#67e8f9",
    marginTop: 8,
  },
  cards: {
    maxWidth: 1400,
    margin: "0 auto 24px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 14,
  },
  card: {
    background: "rgba(15,23,42,0.96)",
    border: "1px solid rgba(34,211,238,0.22)",
    borderRadius: 16,
    padding: 18,
  },
  cardTitle: {
    color: "#cbd5e1",
    marginBottom: 8,
  },
  cardValue: {
    color: "#22c55e",
    fontSize: 24,
    fontWeight: 900,
  },
  tableBox: {
    maxWidth: 1400,
    margin: "0 auto 24px",
    background: "rgba(15,23,42,0.96)",
    border: "1px solid rgba(34,211,238,0.22)",
    borderRadius: 18,
    padding: 16,
  },
  sectionTitle: {
    marginTop: 0,
    color: "#e0f2fe",
  },
  filters: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  input: {
    background: "#020617",
    color: "#fff",
    border: "1px solid rgba(34,211,238,0.35)",
    borderRadius: 10,
    padding: "10px 12px",
    minWidth: 220,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1200,
  },
  th: {
    textAlign: "left",
    color: "#67e8f9",
    padding: "10px 8px",
    borderBottom: "1px solid rgba(148,163,184,0.25)",
    fontSize: 13,
  },
  td: {
    padding: "10px 8px",
    borderBottom: "1px solid rgba(148,163,184,0.12)",
    color: "#e5e7eb",
    fontSize: 13,
    verticalAlign: "top",
  },
  actions: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  btn: {
    background: "#0ea5e9",
    color: "#001018",
    border: 0,
    borderRadius: 8,
    padding: "7px 9px",
    fontWeight: 800,
    cursor: "pointer",
  },
  btnGreen: {
    background: "#22c55e",
    color: "#00180a",
    border: 0,
    borderRadius: 8,
    padding: "7px 9px",
    fontWeight: 800,
    cursor: "pointer",
  },
  btnDanger: {
    background: "#ef4444",
    color: "#fff",
    border: 0,
    borderRadius: 8,
    padding: "7px 9px",
    fontWeight: 800,
    cursor: "pointer",
  },
  empty: {
    color: "#94a3b8",
  },
};