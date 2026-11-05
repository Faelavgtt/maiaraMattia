import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ShieldCheck, UserCheck, UserPlus, Users } from "lucide-react";
import { createAdminUser, listAdminUsers, type AdminUserRole } from "@/lib/admin-api";

const initialForm = {
  username: "",
  email: "",
  password: "",
  role: "admin" as AdminUserRole,
};

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: listAdminUsers,
    retry: false,
  });

  const createUser = useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      setForm(initialForm);
      setMessage("Usuário cadastrado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : "Não foi possível cadastrar o usuário.");
    },
  });

  const submitUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    createUser.mutate(form);
  };

  const users = data?.users ?? [];

  return (
    <section className="px-3 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#eef4f0] px-2.5 py-1 text-xs font-medium text-[#2d523a]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Segurança & Permissões</span>
          </div>
          <h1 className="mt-2 font-sans text-2xl font-light tracking-tight text-[#8b4114] sm:text-3xl">
            Usuários do Painel
          </h1>
          <p className="mt-1 font-sans text-xs sm:text-sm font-light text-[#8b4114]/70">
            Controle de acessos administrativos autorizados para gerenciar o ateliê.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] xl:items-start">
          {/* Create User Form */}
          <form
            onSubmit={submitUser}
            className="rounded-2xl border border-[#8b4114]/10 bg-white p-6 shadow-[0_4px_20px_rgba(93,51,29,0.03)]"
          >
            <div className="mb-5 flex items-center gap-3 border-b border-[#8b4114]/10 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbeee7] text-[#8b4114] border border-[#ebd2c3]">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-sans text-lg font-medium text-[#8b4114]">Cadastrar Novo Acesso</h2>
                <p className="font-sans text-xs font-light text-[#76877e]">
                  Crie credenciais exclusivas com permissão de administrador.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#76877e]">
                  Nome de Usuário
                </span>
                <input
                  required
                  value={form.username}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, username: event.target.value }))
                  }
                  className="h-10 w-full rounded-xl border border-[#8b4114]/15 bg-white px-3 font-sans text-xs sm:text-sm font-light text-[#8b4114] outline-none shadow-2xs transition-all placeholder:text-[#76877e]/60 focus:border-[#8b4114]"
                  placeholder="Ex: maiara"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#76877e]">
                  E-mail de Acesso
                </span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  className="h-10 w-full rounded-xl border border-[#8b4114]/15 bg-white px-3 font-sans text-xs sm:text-sm font-light text-[#8b4114] outline-none shadow-2xs transition-all placeholder:text-[#76877e]/60 focus:border-[#8b4114]"
                  placeholder="contato@atelie.com"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#76877e]">
                  Senha Inicial
                </span>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                  className="h-10 w-full rounded-xl border border-[#8b4114]/15 bg-white px-3 font-sans text-xs sm:text-sm font-light text-[#8b4114] outline-none shadow-2xs transition-all placeholder:text-[#76877e]/60 focus:border-[#8b4114]"
                  placeholder="Mínimo 8 caracteres"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#76877e]">
                  Nível de Permissão
                </span>
                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, role: event.target.value as AdminUserRole }))
                  }
                  className="h-10 w-full rounded-xl border border-[#8b4114]/15 bg-white px-3 font-sans text-xs sm:text-sm font-light text-[#8b4114] outline-none shadow-2xs transition-all focus:border-[#8b4114]"
                >
                  <option value="admin">Administrador Regular</option>
                  <option value="owner">Admin Principal (Owner)</option>
                </select>
              </label>
            </div>

            {message && (
              <div
                className={`mt-4 flex items-center gap-2 rounded-xl p-3 font-sans text-xs font-light ${
                  message.includes("sucesso")
                    ? "bg-[#eef4f0] text-[#2d523a] border border-[#d6e5dc]"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.includes("sucesso") && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                <span>{message}</span>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={createUser.isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#8b4114] px-5 font-sans text-xs font-medium text-white shadow-sm transition-all hover:bg-[#72340e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserCheck className="h-4 w-4" />
                <span>{createUser.isPending ? "Cadastrando..." : "Salvar Usuário"}</span>
              </button>
            </div>
          </form>

          {/* User List Panel */}
          <aside className="rounded-2xl border border-[#8b4114]/10 bg-white p-5 shadow-[0_4px_20px_rgba(93,51,29,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#8b4114]/10 pb-3">
              <div>
                <h3 className="font-sans text-base font-medium text-[#8b4114]">Usuários Autorizados</h3>
                <p className="font-sans text-xs font-light text-[#76877e]">{users.length} cadastrados</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8f1e9] text-[#76877e]">
                <Users className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-2.5">
              {isLoading ? (
                <div className="py-8 text-center font-sans text-xs font-light text-[#76877e]">
                  Carregando usuários...
                </div>
              ) : users.length === 0 ? (
                <div className="py-8 text-center font-sans text-xs font-light text-[#76877e]">
                  Nenhum usuário cadastrado.
                </div>
              ) : (
                users.map((user) => {
                  const initial = (user.username || user.email || "A").slice(0, 1).toUpperCase();
                  const isOwner = user.role === "owner";

                  return (
                    <article
                      key={user.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#8b4114]/10 bg-[#fffaf5] p-3 shadow-2xs transition-colors hover:bg-white"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-sans text-xs font-bold ${
                            isOwner ? "bg-[#fbeee7] text-[#8b4114]" : "bg-[#eef4f0] text-[#2d523a]"
                          }`}
                        >
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate font-sans text-xs font-medium text-[#8b4114]">
                            {user.username}
                          </h4>
                          <p className="truncate font-sans text-[11px] font-light text-[#76877e]">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-lg px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider ${
                          isOwner
                            ? "bg-[#fbeee7] text-[#8b4114] border border-[#8b4114]/20"
                            : "bg-[#eef4f0] text-[#2d523a] border border-[#2d523a]/20"
                        }`}
                      >
                        {isOwner ? "Principal" : "Admin"}
                      </span>
                    </article>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default AdminUsers;

