import type { IdiomaId } from "./idiomas";

export const NOMES_AMIGO_ZOEIRA_POR_IDIOMA: Record<IdiomaId, string[]> = {
	pt: [
		"Problema ambulante",
		"Cumplice de erro",
		"Amigo questionavel",
		"Influencia ruim",
		"Parceiro do caos",
		"Testemunha das suas decisoes",
		"Comparsa",
		"Elemento suspeito",
		"Aliado duvidoso",
		"Amigo que nao ajuda",
		"Fonte de problema",
		"Pessoa a ser evitada",
		"Conexao perigosa",
		"Amigo... ainda",
		"Contato duvidoso"
	],
	en: [
		"Walking problem",
		"Error partner",
		"Questionable friend",
		"Bad influence",
		"Chaos buddy",
		"Witness of your decisions",
		"Sidekick",
		"Suspicious element",
		"Doubtful ally",
		"Friend that never helps",
		"Source of trouble",
		"Person to avoid",
		"Risky connection",
		"Friend... still",
		"Questionable contact"
	],
	es: [
		"Problema ambulante",
		"Complice del error",
		"Amigo cuestionable",
		"Mala influencia",
		"Companero del caos",
		"Testigo de tus decisiones",
		"Compinche",
		"Elemento sospechoso",
		"Aliado dudoso",
		"Amigo que no ayuda",
		"Fuente de problemas",
		"Persona a evitar",
		"Conexion peligrosa",
		"Amigo... aun",
		"Contacto dudoso"
	],
	fr: [
		"Probleme ambulant",
		"Complice de l'erreur",
		"Ami discutable",
		"Mauvaise influence",
		"Partenaire du chaos",
		"Temoin de tes decisions",
		"Acolyte",
		"Element suspect",
		"Allie douteux",
		"Ami qui n'aide jamais",
		"Source de problemes",
		"Personne a eviter",
		"Connexion risquee",
		"Ami... quand meme",
		"Contact douteux"
	],
	de: [
		"Laufendes Problem",
		"Fehler-Komplize",
		"Fragwurdiger Freund",
		"Schlechter Einfluss",
		"Chaos-Partner",
		"Zeuge deiner Entscheidungen",
		"Kumpel",
		"Verdachtiges Element",
		"Zweifelhafter Verbundeter",
		"Freund der nie hilft",
		"Quelle von Problemen",
		"Person zum Vermeiden",
		"Riskante Verbindung",
		"Freund... trotzdem",
		"Fragwurdiger Kontakt"
	]
};

export const NOMES_AMIGO_ZOEIRA = NOMES_AMIGO_ZOEIRA_POR_IDIOMA.pt;

export function getNomesAmigoZoeira(idioma: IdiomaId) {
	return NOMES_AMIGO_ZOEIRA_POR_IDIOMA[idioma] || NOMES_AMIGO_ZOEIRA_POR_IDIOMA.pt;
}



