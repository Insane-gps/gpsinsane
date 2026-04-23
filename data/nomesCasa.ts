import type { IdiomaId } from "./idiomas";

export const NOMES_CASA_ZOEIRA_POR_IDIOMA: Record<IdiomaId, string[]> = {
	pt: [
		"Voltar pro cativeiro",
		"Base operacional",
		"Casa (infelizmente)",
		"Lar questionavel",
		"Deposito humano",
		"Ponto de vergonha",
		"Retorno inevitavel",
		"Centro de fracasso",
		"QG do caos",
		"Residencia duvidosa",
		"Caverna do erro",
		"Fortaleza da solidao",
		"Base da derrota",
		"Refugio questionavel",
		"Zona de arrependimento"
	],
	en: [
		"Back to base",
		"Home base",
		"Home (unfortunately)",
		"Questionable nest",
		"Human storage",
		"Shame point",
		"Inevitable return",
		"Failure center",
		"Chaos HQ",
		"Doubtful residence",
		"Cave of mistakes",
		"Fortress of solitude",
		"Defeat base",
		"Questionable shelter",
		"Regret zone"
	],
	es: [
		"Volver al cautiverio",
		"Base operativa",
		"Casa (por desgracia)",
		"Hogar cuestionable",
		"Deposito humano",
		"Punto de verguenza",
		"Regreso inevitable",
		"Centro del fracaso",
		"Cuartel del caos",
		"Residencia dudosa",
		"Cueva del error",
		"Fortaleza de soledad",
		"Base de derrota",
		"Refugio cuestionable",
		"Zona de arrepentimiento"
	],
	fr: [
		"Retour a la base",
		"Base operationnelle",
		"Maison (helas)",
		"Foyer discutable",
		"Depot humain",
		"Point de honte",
		"Retour inevitable",
		"Centre de l'echec",
		"QG du chaos",
		"Residence douteuse",
		"Caverne de l'erreur",
		"Forteresse de solitude",
		"Base de defaite",
		"Refuge discutable",
		"Zone de regret"
	],
	de: [
		"Zuruck zur Basis",
		"Einsatzbasis",
		"Zuhause (leider)",
		"Fragwurdiges Heim",
		"Menschenlager",
		"Schampunkt",
		"Unvermeidliche Ruckkehr",
		"Zentrum des Scheiterns",
		"Chaos-HQ",
		"Fragwurdiger Wohnort",
		"Fehlerhohle",
		"Festung der Einsamkeit",
		"Basis der Niederlage",
		"Fragwurdiger Zufluchtsort",
		"Zone der Reue"
	]
};

export const NOMES_CASA_ZOEIRA = NOMES_CASA_ZOEIRA_POR_IDIOMA.pt;

export function getNomesCasaZoeira(idioma: IdiomaId) {
	return NOMES_CASA_ZOEIRA_POR_IDIOMA[idioma] || NOMES_CASA_ZOEIRA_POR_IDIOMA.pt;
}
