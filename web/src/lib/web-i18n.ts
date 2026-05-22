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
  offerPageSubtitle: string;
  searchPlaceholder: string;
  mapTitle: string;
  mapSubtitle: string;
  mapSelectedOffer: string;
  mapNoSelection: string;
  mapLegendRide: string;
  mapLegendRequest: string;
  mapLegendDelivery: string;
  mapNoCoords: string;
  loadingSession: string;
  noOffers: string;
  openChat: string;
  reserve: string;
  offerNoDescription: string;
  offerOrigin: string;
  offerDestination: string;
  offerValue: string;
  offerSeats: string;
  offerReservations: string;
  offerWhen: string;
  chatTitle: string;
  chatEmpty: string;
  chatDeleteConversation: string;
  chatDeleting: string;
  chatPlaceholder: string;
  myTripsTitle: string;
  myTripsEmpty: string;
  tripsSubtitle: string;
  inboxTitle: string;
  inboxEmpty: string;
  inboxSubtitle: string;
  profileTitle: string;
  profileSubtitle: string;
  profileVehiclesTitle: string;
  profileSave: string;
  profileAddVehicle: string;
  profileRemoveVehicle: string;
  profileStoredLocal: string;
  loginToReserve: string;
  loginToChat: string;
  reserveSuccess: string;
  reserveFail: string;
  premiumLockTitle: string;
  premiumLockSubtitle: string;
  premiumBackToOffers: string;
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
    oferecer: "Ofertar",
    viagens: "Viagens",
    mensagens: "Mensagens",
    perfil: "Perfil",
    login: "Entrar / criar conta",
    logout: "Sair",
    heroTitle: "Aba Ofertas no Web, com energia futurista",
    heroSubtitle: "Procurar, ofertar, viagens, mensagens e perfil em uma experiencia viva, conectada ao mesmo Firebase do app.",
    heroCta1: "Ir para procurar",
    heroCta2: "Ofertar carona",
    heroCta3: "Minhas viagens",
    heroCta4: "Mensagens",
    offersTitle: "Procurar ofertas",
    offersSubtitle: "Colecao compartilhada com o mobile: ofertas",
    offerPageSubtitle: "Mapa OSM grande, cards neon e chat na mesma tela.",
    searchPlaceholder: "Buscar por rota, descricao ou criador",
    mapTitle: "Mapa de ofertas",
    mapSubtitle: "Toque em um marcador para destacar o card correspondente.",
    mapSelectedOffer: "Oferta selecionada",
    mapNoSelection: "Nenhuma oferta selecionada ainda.",
    mapLegendRide: "Carona oferecida",
    mapLegendRequest: "Carona solicitada",
    mapLegendDelivery: "Entrega",
    mapNoCoords: "Esta oferta nao possui coordenadas para o mapa.",
    loadingSession: "Carregando sessao...",
    noOffers: "Nenhuma oferta ativa encontrada.",
    openChat: "Abrir conversa",
    reserve: "Solicitar reserva",
    offerNoDescription: "Oferta sem descricao",
    offerOrigin: "Origem",
    offerDestination: "Destino",
    offerValue: "Valor",
    offerSeats: "Vagas",
    offerReservations: "Reservas",
    offerWhen: "Quando",
    chatTitle: "Conversa da oferta",
    chatEmpty: "Selecione uma oferta para abrir o chat.",
    chatDeleteConversation: "Excluir conversa",
    chatDeleting: "Excluindo...",
    chatPlaceholder: "Digite sua mensagem",
    myTripsTitle: "Minhas viagens",
    myTripsEmpty: "Voce ainda nao participa de nenhuma viagem.",
    tripsSubtitle: "Historico de ofertas criadas e reservas ativas.",
    inboxTitle: "Mensagens",
    inboxEmpty: "Nenhuma conversa encontrada ainda.",
    inboxSubtitle: "Central de conversa das suas ofertas e reservas.",
    profileTitle: "Perfil",
    profileSubtitle: "Dados locais da web para acelerar seu uso no desktop.",
    profileVehiclesTitle: "Veiculos",
    profileSave: "Salvar perfil",
    profileAddVehicle: "Adicionar veiculo",
    profileRemoveVehicle: "Remover",
    profileStoredLocal: "Perfil salvo no navegador.",
    loginToReserve: "Faca login para solicitar reserva.",
    loginToChat: "Faca login para enviar mensagens no chat.",
    reserveSuccess: "Reserva solicitada com sucesso.",
    reserveFail: "Falha ao solicitar reserva.",
    premiumLockTitle: "Desbloqueie Ofertar Carona",
    premiumLockSubtitle: "No mobile, este fluxo abre os planos. Escolha um plano para liberar o modo motorista.",
    premiumBackToOffers: "Voltar para ofertas",
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
    offerPageSubtitle: "Large OSM map, neon cards and chat on one screen.",
    searchPlaceholder: "Search by route, description or creator",
    mapTitle: "Offers map",
    mapSubtitle: "Tap a marker to highlight the matching card.",
    mapSelectedOffer: "Selected offer",
    mapNoSelection: "No offer selected yet.",
    mapLegendRide: "Ride offered",
    mapLegendRequest: "Ride requested",
    mapLegendDelivery: "Delivery",
    mapNoCoords: "This offer has no coordinates for the map.",
    loadingSession: "Loading session...",
    noOffers: "No active offers found.",
    openChat: "Open chat",
    reserve: "Request booking",
    offerNoDescription: "Offer without description",
    offerOrigin: "Origin",
    offerDestination: "Destination",
    offerValue: "Value",
    offerSeats: "Seats",
    offerReservations: "Reservations",
    offerWhen: "When",
    chatTitle: "Offer conversation",
    chatEmpty: "Select an offer to open chat.",
    chatDeleteConversation: "Delete conversation",
    chatDeleting: "Deleting...",
    chatPlaceholder: "Type your message",
    myTripsTitle: "My trips",
    myTripsEmpty: "You are not part of any trip yet.",
    tripsSubtitle: "History of created offers and active bookings.",
    inboxTitle: "Messages",
    inboxEmpty: "No conversations yet.",
    inboxSubtitle: "Conversation hub for your offers and bookings.",
    profileTitle: "Profile",
    profileSubtitle: "Local web profile data for faster desktop usage.",
    profileVehiclesTitle: "Vehicles",
    profileSave: "Save profile",
    profileAddVehicle: "Add vehicle",
    profileRemoveVehicle: "Remove",
    profileStoredLocal: "Profile saved in the browser.",
    loginToReserve: "Sign in to request booking.",
    loginToChat: "Sign in to send messages in chat.",
    reserveSuccess: "Booking requested successfully.",
    reserveFail: "Failed to request booking.",
    premiumLockTitle: "Unlock Ride Offering",
    premiumLockSubtitle: "On mobile this action opens plan cards. Choose a plan to enable driver mode.",
    premiumBackToOffers: "Back to offers",
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
    offerPageSubtitle: "Mapa OSM grande, tarjetas neon y chat en la misma pantalla.",
    searchPlaceholder: "Buscar por ruta, descripcion o creador",
    mapTitle: "Mapa de ofertas",
    mapSubtitle: "Toca un marcador para resaltar la tarjeta correspondiente.",
    mapSelectedOffer: "Oferta seleccionada",
    mapNoSelection: "Aun no hay oferta seleccionada.",
    mapLegendRide: "Carona ofrecida",
    mapLegendRequest: "Carona solicitada",
    mapLegendDelivery: "Entrega",
    mapNoCoords: "Esta oferta no tiene coordenadas para el mapa.",
    loadingSession: "Cargando sesion...",
    noOffers: "No se encontraron ofertas activas.",
    openChat: "Abrir chat",
    reserve: "Solicitar reserva",
    offerNoDescription: "Oferta sin descripcion",
    offerOrigin: "Origen",
    offerDestination: "Destino",
    offerValue: "Valor",
    offerSeats: "Plazas",
    offerReservations: "Reservas",
    offerWhen: "Cuando",
    chatTitle: "Conversacion de la oferta",
    chatEmpty: "Selecciona una oferta para abrir el chat.",
    chatDeleteConversation: "Eliminar conversacion",
    chatDeleting: "Eliminando...",
    chatPlaceholder: "Escribe tu mensaje",
    myTripsTitle: "Mis viajes",
    myTripsEmpty: "Todavia no participas en ningun viaje.",
    tripsSubtitle: "Historial de ofertas creadas y reservas activas.",
    inboxTitle: "Mensajes",
    inboxEmpty: "Todavia no hay conversaciones.",
    inboxSubtitle: "Centro de conversaciones de tus ofertas y reservas.",
    profileTitle: "Perfil",
    profileSubtitle: "Datos locales del perfil web para uso rapido en desktop.",
    profileVehiclesTitle: "Vehiculos",
    profileSave: "Guardar perfil",
    profileAddVehicle: "Agregar vehiculo",
    profileRemoveVehicle: "Eliminar",
    profileStoredLocal: "Perfil guardado en el navegador.",
    loginToReserve: "Inicia sesion para solicitar reserva.",
    loginToChat: "Inicia sesion para enviar mensajes en el chat.",
    reserveSuccess: "Reserva solicitada con exito.",
    reserveFail: "No se pudo solicitar la reserva.",
    premiumLockTitle: "Desbloquear Ofrecer Viaje",
    premiumLockSubtitle: "En mobile esta accion abre tarjetas de planes. Elige un plan para habilitar modo conductor.",
    premiumBackToOffers: "Volver a ofertas",
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
    offerPageSubtitle: "Grande carte OSM, cartes neon et chat sur un seul ecran.",
    searchPlaceholder: "Chercher par trajet, description ou createur",
    mapTitle: "Carte des offres",
    mapSubtitle: "Touchez un marqueur pour mettre en avant la carte correspondante.",
    mapSelectedOffer: "Offre selectionnee",
    mapNoSelection: "Aucune offre selectionnee pour le moment.",
    mapLegendRide: "Trajet propose",
    mapLegendRequest: "Trajet demande",
    mapLegendDelivery: "Livraison",
    mapNoCoords: "Cette offre n'a pas de coordonnees pour la carte.",
    loadingSession: "Chargement de session...",
    noOffers: "Aucune offre active trouvee.",
    openChat: "Ouvrir le chat",
    reserve: "Demander une reservation",
    offerNoDescription: "Offre sans description",
    offerOrigin: "Origine",
    offerDestination: "Destination",
    offerValue: "Valeur",
    offerSeats: "Places",
    offerReservations: "Reservations",
    offerWhen: "Quand",
    chatTitle: "Conversation de l'offre",
    chatEmpty: "Selectionnez une offre pour ouvrir le chat.",
    chatDeleteConversation: "Supprimer la conversation",
    chatDeleting: "Suppression...",
    chatPlaceholder: "Tapez votre message",
    myTripsTitle: "Mes trajets",
    myTripsEmpty: "Vous ne participez a aucun trajet pour le moment.",
    tripsSubtitle: "Historique des offres creees et des reservations actives.",
    inboxTitle: "Messages",
    inboxEmpty: "Aucune conversation pour le moment.",
    inboxSubtitle: "Centre de conversation de vos offres et reservations.",
    profileTitle: "Profil",
    profileSubtitle: "Donnees locales du profil web pour un usage desktop plus rapide.",
    profileVehiclesTitle: "Vehicules",
    profileSave: "Enregistrer le profil",
    profileAddVehicle: "Ajouter un vehicule",
    profileRemoveVehicle: "Supprimer",
    profileStoredLocal: "Profil enregistre dans le navigateur.",
    loginToReserve: "Connectez-vous pour demander une reservation.",
    loginToChat: "Connectez-vous pour envoyer des messages dans le chat.",
    reserveSuccess: "Reservation demandee avec succes.",
    reserveFail: "Echec de la demande de reservation.",
    premiumLockTitle: "Debloquer Proposer un trajet",
    premiumLockSubtitle: "Sur mobile cette action ouvre les cartes de plans. Choisissez un plan pour activer le mode conducteur.",
    premiumBackToOffers: "Retour aux offres",
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
    offerPageSubtitle: "Grosse OSM-Karte, Neon-Karten und Chat auf einem Bildschirm.",
    searchPlaceholder: "Nach Route, Beschreibung oder Ersteller suchen",
    mapTitle: "Angebotskarte",
    mapSubtitle: "Tippe auf einen Marker, um die passende Karte hervorzuheben.",
    mapSelectedOffer: "Ausgewaehltes Angebot",
    mapNoSelection: "Noch kein Angebot ausgewaehlt.",
    mapLegendRide: "Fahrt angeboten",
    mapLegendRequest: "Fahrt angefragt",
    mapLegendDelivery: "Lieferung",
    mapNoCoords: "Dieses Angebot hat keine Koordinaten fuer die Karte.",
    loadingSession: "Sitzung wird geladen...",
    noOffers: "Keine aktiven Angebote gefunden.",
    openChat: "Chat offnen",
    reserve: "Reservierung anfragen",
    offerNoDescription: "Angebot ohne Beschreibung",
    offerOrigin: "Start",
    offerDestination: "Ziel",
    offerValue: "Preis",
    offerSeats: "Plaetze",
    offerReservations: "Reservierungen",
    offerWhen: "Wann",
    chatTitle: "Angebots-Chat",
    chatEmpty: "Wahle ein Angebot, um den Chat zu offnen.",
    chatDeleteConversation: "Unterhaltung loeschen",
    chatDeleting: "Wird geloescht...",
    chatPlaceholder: "Nachricht eingeben",
    myTripsTitle: "Meine Fahrten",
    myTripsEmpty: "Du bist noch in keiner Fahrt.",
    tripsSubtitle: "Verlauf der erstellten Angebote und aktiven Buchungen.",
    inboxTitle: "Nachrichten",
    inboxEmpty: "Noch keine Unterhaltungen.",
    inboxSubtitle: "Konversationszentrale fuer deine Angebote und Buchungen.",
    profileTitle: "Profil",
    profileSubtitle: "Lokale Web-Profildaten fur schnellere Desktop-Nutzung.",
    profileVehiclesTitle: "Fahrzeuge",
    profileSave: "Profil speichern",
    profileAddVehicle: "Fahrzeug hinzufuegen",
    profileRemoveVehicle: "Entfernen",
    profileStoredLocal: "Profil im Browser gespeichert.",
    loginToReserve: "Melde dich an, um eine Reservierung anzufragen.",
    loginToChat: "Melde dich an, um Nachrichten im Chat zu senden.",
    reserveSuccess: "Reservierung erfolgreich angefragt.",
    reserveFail: "Reservierung konnte nicht angefragt werden.",
    premiumLockTitle: "Fahrt anbieten freischalten",
    premiumLockSubtitle: "In der Mobile-App offnet diese Aktion die Plan-Karten. Wahle einen Plan fur den Fahrer-Modus.",
    premiumBackToOffers: "Zurueck zu Angeboten",
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
