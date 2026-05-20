export type WebLang = "pt" | "en" | "es" | "fr" | "de";

export const LANG_OPTIONS: Array<{ id: WebLang; label: string; short: string }> = [
  { id: "pt", label: "Portugues", short: "PT" },
  { id: "en", label: "English", short: "EN" },
  { id: "es", label: "Espanol", short: "ES" },
  { id: "fr", label: "Francais", short: "FR" },
  { id: "de", label: "Deutsch", short: "DE" },
];

type WebTexts = {
  brand: string;
  home: string;
  procurar: string;
  oferecer: string;
  viagens: string;
  mensagens: string;
  perfil: string;
  login: string;
  logout: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta1: string;
  heroCta2: string;
  heroCta3: string;
  heroCta4: string;
  offersTitle: string;
  offersSubtitle: string;
  loadingSession: string;
  noOffers: string;
  openChat: string;
  reserve: string;
  chatTitle: string;
  chatEmpty: string;
  myTripsTitle: string;
  myTripsEmpty: string;
  inboxTitle: string;
  inboxEmpty: string;
  profileTitle: string;
  profileSubtitle: string;
  loginToReserve: string;
  loginToChat: string;
  reserveSuccess: string;
  reserveFail: string;
  premiumLockTitle: string;
  premiumLockSubtitle: string;
  planPremiumFree: string;
  planPro: string;
  planPremium: string;
  planCurrent: string;
  planAction: string;
};

const TEXTS: Record<WebLang, WebTexts> = {
  pt: {
    brand: "INSANE GPS WEB",
    home: "Inicio",
    procurar: "Procurar",
    oferecer: "Oferecer",
    viagens: "Viagens",
    mensagens: "Mensagens",
    perfil: "Perfil",
    login: "Entrar / criar conta",
    logout: "Sair",
    heroTitle: "Aba Ofertas no Web, com energia futurista",
    heroSubtitle: "Procurar, oferecer, viagens, mensagens e perfil em uma experiencia viva, conectada ao mesmo Firebase do app.",
    heroCta1: "Ir para procurar",
    heroCta2: "Oferecer carona",
    heroCta3: "Minhas viagens",
    heroCta4: "Mensagens",
    offersTitle: "Procurar ofertas",
    offersSubtitle: "Colecao compartilhada com o mobile: ofertas",
    loadingSession: "Carregando sessao...",
    noOffers: "Nenhuma oferta ativa encontrada.",
    openChat: "Abrir conversa",
    reserve: "Solicitar reserva",
    chatTitle: "Conversa da oferta",
    chatEmpty: "Selecione uma oferta para abrir o chat.",
    myTripsTitle: "Minhas viagens",
    myTripsEmpty: "Voce ainda nao participa de nenhuma viagem.",
    inboxTitle: "Mensagens",
    inboxEmpty: "Nenhuma conversa encontrada ainda.",
    profileTitle: "Perfil",
    profileSubtitle: "Dados locais da web para acelerar seu uso no desktop.",
    loginToReserve: "Faca login para solicitar reserva.",
    loginToChat: "Faca login para enviar mensagens no chat.",
    reserveSuccess: "Reserva solicitada com sucesso.",
    reserveFail: "Falha ao solicitar reserva.",
    premiumLockTitle: "Desbloqueie Oferecer Carona",
    premiumLockSubtitle: "No mobile, este fluxo abre os planos. Escolha um plano para liberar o modo motorista.",
    planPremiumFree: "Premium Free",
    planPro: "Pro",
    planPremium: "Premium",
    planCurrent: "Plano atual",
    planAction: "Quero este plano",
  },
  en: {
    brand: "INSANE GPS WEB",
    home: "Home",
    procurar: "Explore",
    oferecer: "Offer",
    viagens: "Trips",
    mensagens: "Messages",
    perfil: "Profile",
    login: "Sign in / register",
    logout: "Sign out",
    heroTitle: "Offers Tab on Web, now futuristic",
    heroSubtitle: "Explore, offer, trips, messages and profile in one vivid web flow connected to the same Firebase backend.",
    heroCta1: "Go to explore",
    heroCta2: "Offer ride",
    heroCta3: "My trips",
    heroCta4: "Messages",
    offersTitle: "Explore offers",
    offersSubtitle: "Shared collection with mobile: ofertas",
    loadingSession: "Loading session...",
    noOffers: "No active offers found.",
    openChat: "Open chat",
    reserve: "Request booking",
    chatTitle: "Offer conversation",
    chatEmpty: "Select an offer to open chat.",
    myTripsTitle: "My trips",
    myTripsEmpty: "You are not part of any trip yet.",
    inboxTitle: "Messages",
    inboxEmpty: "No conversations yet.",
    profileTitle: "Profile",
    profileSubtitle: "Local web profile data for faster desktop usage.",
    loginToReserve: "Sign in to request booking.",
    loginToChat: "Sign in to send messages in chat.",
    reserveSuccess: "Booking requested successfully.",
    reserveFail: "Failed to request booking.",
    premiumLockTitle: "Unlock Ride Offering",
    premiumLockSubtitle: "On mobile this action opens plan cards. Choose a plan to enable driver mode.",
    planPremiumFree: "Premium Free",
    planPro: "Pro",
    planPremium: "Premium",
    planCurrent: "Current plan",
    planAction: "Choose this plan",
  },
  es: {
    brand: "INSANE GPS WEB",
    home: "Inicio",
    procurar: "Buscar",
    oferecer: "Ofrecer",
    viagens: "Viajes",
    mensagens: "Mensajes",
    perfil: "Perfil",
    login: "Entrar / crear cuenta",
    logout: "Salir",
    heroTitle: "Pestana Ofertas en la web, ahora futurista",
    heroSubtitle: "Buscar, ofrecer, viajes, mensajes y perfil en una experiencia viva conectada al mismo Firebase.",
    heroCta1: "Ir a buscar",
    heroCta2: "Ofrecer viaje",
    heroCta3: "Mis viajes",
    heroCta4: "Mensajes",
    offersTitle: "Buscar ofertas",
    offersSubtitle: "Coleccion compartida con mobile: ofertas",
    loadingSession: "Cargando sesion...",
    noOffers: "No se encontraron ofertas activas.",
    openChat: "Abrir chat",
    reserve: "Solicitar reserva",
    chatTitle: "Conversacion de la oferta",
    chatEmpty: "Selecciona una oferta para abrir el chat.",
    myTripsTitle: "Mis viajes",
    myTripsEmpty: "Todavia no participas en ningun viaje.",
    inboxTitle: "Mensajes",
    inboxEmpty: "Todavia no hay conversaciones.",
    profileTitle: "Perfil",
    profileSubtitle: "Datos locales del perfil web para uso rapido en desktop.",
    loginToReserve: "Inicia sesion para solicitar reserva.",
    loginToChat: "Inicia sesion para enviar mensajes en el chat.",
    reserveSuccess: "Reserva solicitada con exito.",
    reserveFail: "No se pudo solicitar la reserva.",
    premiumLockTitle: "Desbloquear Ofrecer Viaje",
    premiumLockSubtitle: "En mobile esta accion abre tarjetas de planes. Elige un plan para habilitar modo conductor.",
    planPremiumFree: "Premium Free",
    planPro: "Pro",
    planPremium: "Premium",
    planCurrent: "Plan actual",
    planAction: "Quiero este plan",
  },
  fr: {
    brand: "INSANE GPS WEB",
    home: "Accueil",
    procurar: "Chercher",
    oferecer: "Proposer",
    viagens: "Trajets",
    mensagens: "Messages",
    perfil: "Profil",
    login: "Connexion / compte",
    logout: "Quitter",
    heroTitle: "Onglet Offres sur le web, style futuriste",
    heroSubtitle: "Chercher, proposer, trajets, messages et profil dans une experience web vive connectee au meme Firebase.",
    heroCta1: "Aller chercher",
    heroCta2: "Proposer un trajet",
    heroCta3: "Mes trajets",
    heroCta4: "Messages",
    offersTitle: "Chercher des offres",
    offersSubtitle: "Collection partagee avec mobile: ofertas",
    loadingSession: "Chargement de session...",
    noOffers: "Aucune offre active trouvee.",
    openChat: "Ouvrir le chat",
    reserve: "Demander une reservation",
    chatTitle: "Conversation de l'offre",
    chatEmpty: "Selectionnez une offre pour ouvrir le chat.",
    myTripsTitle: "Mes trajets",
    myTripsEmpty: "Vous ne participez a aucun trajet pour le moment.",
    inboxTitle: "Messages",
    inboxEmpty: "Aucune conversation pour le moment.",
    profileTitle: "Profil",
    profileSubtitle: "Donnees locales du profil web pour un usage desktop plus rapide.",
    loginToReserve: "Connectez-vous pour demander une reservation.",
    loginToChat: "Connectez-vous pour envoyer des messages dans le chat.",
    reserveSuccess: "Reservation demandee avec succes.",
    reserveFail: "Echec de la demande de reservation.",
    premiumLockTitle: "Debloquer Proposer un trajet",
    premiumLockSubtitle: "Sur mobile cette action ouvre les cartes de plans. Choisissez un plan pour activer le mode conducteur.",
    planPremiumFree: "Premium Free",
    planPro: "Pro",
    planPremium: "Premium",
    planCurrent: "Plan actuel",
    planAction: "Choisir ce plan",
  },
  de: {
    brand: "INSANE GPS WEB",
    home: "Start",
    procurar: "Suchen",
    oferecer: "Anbieten",
    viagens: "Fahrten",
    mensagens: "Nachrichten",
    perfil: "Profil",
    login: "Anmelden / Konto",
    logout: "Abmelden",
    heroTitle: "Angebote-Tab im Web, jetzt futuristisch",
    heroSubtitle: "Suchen, anbieten, fahrten, nachrichten und profil in einem lebendigen Web-Flow mit demselben Firebase.",
    heroCta1: "Zum Suchen",
    heroCta2: "Fahrt anbieten",
    heroCta3: "Meine Fahrten",
    heroCta4: "Nachrichten",
    offersTitle: "Angebote suchen",
    offersSubtitle: "Gemeinsame Sammlung mit mobile: ofertas",
    loadingSession: "Sitzung wird geladen...",
    noOffers: "Keine aktiven Angebote gefunden.",
    openChat: "Chat offnen",
    reserve: "Reservierung anfragen",
    chatTitle: "Angebots-Chat",
    chatEmpty: "Wahle ein Angebot, um den Chat zu offnen.",
    myTripsTitle: "Meine Fahrten",
    myTripsEmpty: "Du bist noch in keiner Fahrt.",
    inboxTitle: "Nachrichten",
    inboxEmpty: "Noch keine Unterhaltungen.",
    profileTitle: "Profil",
    profileSubtitle: "Lokale Web-Profildaten fur schnellere Desktop-Nutzung.",
    loginToReserve: "Melde dich an, um eine Reservierung anzufragen.",
    loginToChat: "Melde dich an, um Nachrichten im Chat zu senden.",
    reserveSuccess: "Reservierung erfolgreich angefragt.",
    reserveFail: "Reservierung konnte nicht angefragt werden.",
    premiumLockTitle: "Fahrt anbieten freischalten",
    premiumLockSubtitle: "In der Mobile-App offnet diese Aktion die Plan-Karten. Wahle einen Plan fur den Fahrer-Modus.",
    planPremiumFree: "Premium Free",
    planPro: "Pro",
    planPremium: "Premium",
    planCurrent: "Aktueller Plan",
    planAction: "Diesen Plan wahlen",
  },
};

export function detectLang(value: string | null | undefined): WebLang {
  const raw = String(value || "").toLowerCase();
  if (raw.startsWith("pt")) return "pt";
  if (raw.startsWith("en")) return "en";
  if (raw.startsWith("es")) return "es";
  if (raw.startsWith("fr")) return "fr";
  if (raw.startsWith("de")) return "de";
  return "pt";
}

export function getTexts(lang: WebLang): WebTexts {
  return TEXTS[lang] || TEXTS.pt;
}
