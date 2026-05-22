"use client";

import { useAuth } from "@/components/AuthProvider";
import { useWebI18n } from "@/components/WebI18nProvider";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Vehicle = {
  tipo: "carro" | "moto" | "van";
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  placa: string;
};

type ProfileData = {
  nome: string;
  cidade: string;
  telefone: string;
  foto: string;
  veiculos: Vehicle[];
};

const emptyProfile: ProfileData = {
  nome: "",
  cidade: "",
  telefone: "",
  foto: "",
  veiculos: [],
};

export function ProfilePanel() {
  const { t } = useWebI18n();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [tipo, setTipo] = useState<Vehicle["tipo"]>("carro");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [cor, setCor] = useState("");
  const [placa, setPlaca] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    const raw = window.localStorage.getItem(`perfil_${user.uid}`);
    if (raw) {
      try {
        setProfile({ ...emptyProfile, ...(JSON.parse(raw) as ProfileData) });
      } catch {
        setProfile(emptyProfile);
      }
    }
  }, [user]);

  function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    window.localStorage.setItem(`perfil_${user.uid}`, JSON.stringify(profile));
    setMsg("Perfil salvo no navegador.");
  }

  function addVehicle() {
    if (!marca.trim() || !modelo.trim()) {
      setMsg("Informe marca e modelo do veiculo.");
      return;
    }
    const next: Vehicle = {
      tipo,
      marca: marca.trim(),
      modelo: modelo.trim(),
      ano: ano.trim(),
      cor: cor.trim(),
      placa: placa.trim().toUpperCase(),
    };
    setProfile((prev) => ({ ...prev, veiculos: [...prev.veiculos, next] }));
    setMarca("");
    setModelo("");
    setAno("");
    setCor("");
    setPlaca("");
  }

  function removeVehicle(index: number) {
    setProfile((prev) => ({
      ...prev,
      veiculos: prev.veiculos.filter((_, i) => i !== index),
    }));
  }

  if (loading) return <section className="sectionPane neoPane profilePage">{t.loadingSession}</section>;

  if (!user) {
    return (
      <section className="sectionPane neoPane profilePage">
        <h1>{t.profileTitle}</h1>
        <p className="muted">Faca login para editar seu perfil.</p>
        <Link href="/login" className="btnPrimary" style={{ display: "inline-flex", width: "fit-content" }}>
          {t.login}
        </Link>
      </section>
    );
  }

  return (
    <section className="sectionPane neoPane profilePage">
      <h1>{t.profileTitle}</h1>
      <p className="muted">{t.profileSubtitle}</p>

      <form className="formGrid" onSubmit={saveProfile}>
        <label>
          Nome
          <input value={profile.nome} onChange={(e) => setProfile((p) => ({ ...p, nome: e.target.value }))} />
        </label>
        <label>
          Cidade
          <input value={profile.cidade} onChange={(e) => setProfile((p) => ({ ...p, cidade: e.target.value }))} />
        </label>
        <label>
          Telefone
          <input value={profile.telefone} onChange={(e) => setProfile((p) => ({ ...p, telefone: e.target.value }))} />
        </label>
        <label>
          Foto (URL)
          <input value={profile.foto} onChange={(e) => setProfile((p) => ({ ...p, foto: e.target.value }))} />
        </label>

        <div className="vehicleBuilder">
          <h3>{t.profileVehiclesTitle}</h3>
          <div className="vehicleGrid">
            <select value={tipo} onChange={(e) => setTipo(e.target.value as Vehicle["tipo"])}>
              <option value="carro">Carro</option>
              <option value="moto">Moto</option>
              <option value="van">Van</option>
            </select>
            <input placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
            <input placeholder="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} />
            <input placeholder="Ano" value={ano} onChange={(e) => setAno(e.target.value)} />
            <input placeholder="Cor" value={cor} onChange={(e) => setCor(e.target.value)} />
            <input placeholder="Placa" value={placa} onChange={(e) => setPlaca(e.target.value)} />
          </div>
          <button className="btnSecondary" type="button" onClick={addVehicle}>{t.profileAddVehicle}</button>

          <div className="tripGrid">
            {profile.veiculos.map((item, index) => (
              <article key={`${item.placa}-${index}`} className="tripCard">
                <header>
                  <strong>{item.marca} {item.modelo}</strong>
                  <button className="ghost" type="button" onClick={() => removeVehicle(index)}>{t.profileRemoveVehicle}</button>
                </header>
                <p><strong>Tipo:</strong> {item.tipo}</p>
                <p><strong>Ano:</strong> {item.ano || "-"}</p>
                <p><strong>Cor:</strong> {item.cor || "-"}</p>
                <p><strong>Placa:</strong> {item.placa || "-"}</p>
              </article>
            ))}
          </div>
        </div>

        {msg && <p className="noticeLine">{msg || t.profileStoredLocal}</p>}
        <button className="btnPrimary" type="submit">{t.profileSave}</button>
      </form>
    </section>
  );
}
