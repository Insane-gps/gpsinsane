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
  deliveryType: string;
deliveryObject: string;
deliveryRestaurant: string;
  restaurantDeliveryTitle: string;
  pizzeriaDeliveryTitle: string;
  burgerDeliveryTitle: string;
  snackBarDeliveryTitle: string;
  marketDeliveryTitle: string;

restaurantType: string;
restaurantName: string;
restaurantOrder: string;
restaurantCustomer: string;
restaurantPhone: string;

thermalBag: string;
thermalBagNotRequired: string;
thermalBagRequired: string;
thermalBagProvided: string;

orderSize: string;
smallOrder: string;
mediumOrder: string;
largeOrder: string;
veryLargeOrder: string;

fragileOrder: string;

deliveryCode: string;
confirmDelivery: string;
enterDeliveryCode: string;

driverRating: string;
restaurantRating: string;
sendReview: string;

priorityDrivers: string;

exclusiveRide: string;
sharedRide: string;

availableSeats: string;
reservedSeats: string;

bagProvidedByRestaurant: string;

customer: string;
restaurant: string;
establishment: string;
addressNotProvided: string;
restaurantPickupNoticeTitle: string;
restaurantPickupNoticeText: string;
restaurantDeliveryDescription: string;
commonDeliveryDescription: string;

placeholderRestaurantName: string;
placeholderCustomerName: string;
placeholderCustomerPhone: string;
placeholderRestaurantOrder: string;
placeholderDeliveryObject: string;
placeholderDriverVehicle: string;
placeholderPassengerName: string;

restaurantOptionRestaurant: string;
restaurantOptionSnackBar: string;
restaurantOptionPizza: string;
restaurantOptionBurger: string;
restaurantOptionMarket: string;
restaurantOptionOther: string;

fragile: string;
orderSummary: string;

deliveryVolume: string;

deliverySmallBox: string;
deliveryMediumBox: string;
deliveryLargeBox: string;
deliveryLargeVolume: string;

vehicleSaved: string;

tripMode: string;

sharedTrip: string;
exclusiveTrip: string;

sharedTripDescription: string;
exclusiveTripDescription: string;
largeBaggageWarning: string;

savedProfileData: string;
baggage: string;
noBaggage: string;
backpack: string;
smallSuitcase: string;
mediumSuitcase: string;
largeSuitcase: string;
smallBag: string;
mediumBag: string;
largeBag: string;
pickupAddress: string;
deliveryAddress: string;
departureAddress: string;
boardingAddress: string;
dropoffAddress: string;
destinationAddress: string;
requestRide: string;
offerRide: string;
requestDelivery: string;

freePlanOfferHelp: string;

peopleQuantity: string;
availableSeatsLabel: string;

rideDate: string;
deliveryDate: string;
departureDate: string;

desiredTime: string;
estimatedDeliveryTime: string;
estimatedDepartureTime: string;

deliveryNotesOptional: string;
passengerNotesOptional: string;

placeholderDeliveryNotes: string;
placeholderPassengerNotes: string;

offeredValue: string;
createOffer: string;
saveChanges: string;
wait: string;

street: string;
number: string;
district: string;
city: string;
state: string;
zipCode: string;
complement: string;

placeholderStreet: string;
placeholderNumber: string;
placeholderDistrict: string;
placeholderCity: string;
placeholderState: string;
placeholderZipCode: string;
placeholderComplement: string;
legalNotice:string;
fillAllFields:string;
invalidAddress:string;
selectDeliveryType:string;
premiumRequired:string;
offerCreated:string;
offerUpdated:string;
offerError:string;
intermediateStops:string;
intermediateStopsDescription:string;
placeholderStop:string;
add:string;
remove:string;
travelIntent:string;

travelDestination:string;
createdBy: string;
reservedValue: string;
valueLabel: string;
statusLabel: string;
loadingOrder: string;
orderUnavailable: string;
orderTrackedDescription: string;
inDeliveryStatus: string;
deliveredStatus: string;
orderCreatedStatus: string;
driverAcceptedStatus: string;
outForDeliveryStatus: string;
orderDeliveredStatus: string;
yourDriver: string;
driver: string;
vehicleNotProvided: string;
notInformed: string;
linkInvalid: string;
orderNotFound: string;
linkInvalidOrExpired: string;
loadOrderError: string;
rateDriverAndStore: string;
reviewWouldBuyAgain: string;
answerYes: string;
answerNo: string;
optionalCommentLabel: string;
sendReviewError: string;
toBeArranged: string;
receiveCodeInstruction: string;

travelDestinationPlaceholder:string;

saveTravelIntent:string;

removeTravelIntent:string;

travelIntentSaved:string;

travelIntentRemoved:string;

priorityDriversExplanation:string;
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
    deliveryType: "Tipo de entrega",
deliveryObject: "Objeto",
deliveryRestaurant: "Restaurante",
    restaurantDeliveryTitle: "Entrega de restaurante",
    pizzeriaDeliveryTitle: "Entrega de pizzería",
    burgerDeliveryTitle: "Entrega de hamburguesería",
    snackBarDeliveryTitle: "Entrega de cafetería",
    marketDeliveryTitle: "Entrega de mercado",

restaurantType: "Tipo de estabelecimento",
restaurantName: "Nome do estabelecimento",
restaurantOrder: "Pedido",
restaurantCustomer: "Cliente",
restaurantPhone: "Telefone",

thermalBag: "Bag térmica",
thermalBagNotRequired: "Não necessária",
thermalBagRequired: "Necessária",
thermalBagProvided: "Fornecemos bag",

orderSize: "Tamanho do pedido",
smallOrder: "Pedido pequeno",
mediumOrder: "Pedido médio",
largeOrder: "Pedido grande",
veryLargeOrder: "Pedido muito grande",

fragileOrder: "Pedido frágil",

deliveryCode: "Código da entrega",
confirmDelivery: "Confirmar entrega",
enterDeliveryCode: "Digite o código da entrega",

driverRating: "Avalie o entregador",
restaurantRating: "Avalie o estabelecimento",
sendReview: "Enviar avaliação",

priorityDrivers: "Prioridade para motoristas na mesma direção",

exclusiveRide: "Carona exclusiva",
sharedRide: "Carona compartilhada",

availableSeats: "Vagas disponíveis",
reservedSeats: "Vagas reservadas",

bagProvidedByRestaurant: "Estabelecimento fornece bag térmica",

customer: "Cliente",
restaurant: "Restaurante",
establishment: "Estabelecimento",
addressNotProvided: "Endereço não informado",
restaurantPickupNoticeTitle: "✓ Usando endereço de retirada como endereço do estabelecimento",
restaurantPickupNoticeText: "Preencha o endereço de retirada com o endereço da pizzaria, restaurante, lanchonete ou mercado.",
restaurantDeliveryDescription: "🍔 Pedido de restaurante, pizzaria, lanchonete ou mercado para entregador Premium aceitar.",
commonDeliveryDescription: "📦 Entrega comum de objeto, caixa ou volume.",

placeholderRestaurantName: "Ex: Lanchonete do João",
placeholderCustomerName: "Ex: Maria Silva",
placeholderCustomerPhone: "Ex: (47) 99999-9999",
placeholderRestaurantOrder: "Ex: Pedido 243 - 2 hambúrgueres e 1 refrigerante",
placeholderDeliveryObject: "Ex: Caixa média, 10kg",
placeholderDriverVehicle: "Ex: Carlos - Sedan prata",
placeholderPassengerName: "Ex: João da Silva",

restaurantOptionRestaurant: "Restaurante",
restaurantOptionSnackBar: "Lanchonete",
restaurantOptionPizza: "Pizzaria",
restaurantOptionBurger: "Hamburgueria",
restaurantOptionMarket: "Mercado pequeno",
restaurantOptionOther: "Outro",

fragile: "Frágil",
orderSummary:"Resumo do pedido",

deliveryVolume:"Volume da entrega",

deliverySmallBox:"Caixa pequena",
deliveryMediumBox:"Caixa média",
deliveryLargeBox:"Caixa grande",
deliveryLargeVolume:"Volume grande",

vehicleSaved:"Veículos salvos no perfil",

tripMode:"Modo da viagem",

sharedTrip:"Compartilhada",
exclusiveTrip:"Exclusiva",

sharedTripDescription:"💺 Menor custo, podendo dividir a viagem.",
exclusiveTripDescription:"🚗 Viagem só para você.",
largeBaggageWarning:"Bagagens grandes costumam ser mais confortáveis em uma viagem Exclusiva. Mesmo assim, você pode criar a oferta compartilhada. O motorista decide se aceita ou não.",

savedProfileData:"Usar dados salvos do perfil",
baggage:"Bagagem",
noBaggage:"Sem bagagem",
backpack:"Mochila",
smallSuitcase:"Mala pequena",
mediumSuitcase:"Mala média",
largeSuitcase:"Mala grande",
smallBag:"Bagagem pequena",
mediumBag:"Bagagem média",
largeBag:"Bagagem grande",
pickupAddress:"Endereço de retirada",
deliveryAddress:"Endereço de entrega",

street:"Rua",
number:"Número",
district:"Bairro",
city:"Cidade",
state:"UF",
zipCode:"CEP",
complement:"Complemento",

placeholderStreet:"Rua",
placeholderNumber:"Número",
placeholderDistrict:"Bairro",
placeholderCity:"Cidade",
placeholderState:"UF",
placeholderZipCode:"CEP",
placeholderComplement:"Complemento (opcional)",

departureAddress:"Endereço de saída",
boardingAddress:"Endereço de embarque",
dropoffAddress:"Endereço de desembarque",
destinationAddress:"Endereço de destino",
requestRide:"Solicitar carona",
offerRide:"Ofertar carona",
requestDelivery:"Solicitar entrega",

freePlanOfferHelp:"Plano free/pro: pode solicitar carona e entrega. Para oferecer carona e ganhar dinheiro, ative Premium.",

peopleQuantity:"Quantidade de pessoas",
availableSeatsLabel:"Vagas disponíveis",

rideDate:"Data da carona",
deliveryDate:"Data da entrega",
departureDate:"Data de saída",

desiredTime:"Horário desejado",
estimatedDeliveryTime:"Horário da entrega (estimado)",
estimatedDepartureTime:"Horário de saída (estimado)",

deliveryNotesOptional:"Observações da entrega (opcional)",
passengerNotesOptional:"Observações para passageiro (opcional)",

placeholderDeliveryNotes:"Ex: Entregar na portaria, interfone apto 23, pacote frágil.",
placeholderPassengerNotes:"Ex: Saio no horário, parada apenas em pontos da rota principal.",

offeredValue:"Valor oferecido (R$)",
createOffer:"Criar oferta",
saveChanges:"Salvar alterações",
wait:"Aguarde...",
legalNotice:"Aviso legal: esta plataforma conecta usuários. Transações e combinações são responsabilidade das partes.",

fillAllFields:"Preencha todos os campos obrigatórios.",
invalidAddress:"Informe um endereço válido.",
selectDeliveryType:"Selecione um tipo de entrega.",
premiumRequired:"Esta função está disponível apenas para usuários Premium.",
offerCreated:"Oferta criada com sucesso.",
offerUpdated:"Oferta atualizada com sucesso.",
offerError:"Não foi possível salvar a oferta.",
intermediateStops:"Paradas intermediárias",
intermediateStopsDescription:"Depois de definir saída e destino, adicione cidades ou bairros para parada.",
placeholderStop:"Ex: Betim, MG",
add:"Adicionar",
remove:"Remover",
travelIntent:"Estou indo para outra cidade",

travelDestination:"Destino da viagem",

travelDestinationPlaceholder:"Ex: Florianópolis",

saveTravelIntent:"Salvar",

removeTravelIntent:"Remover",

travelIntentSaved:"Destino salvo com sucesso.",

travelIntentRemoved:"Destino removido.",

priorityDriversExplanation:"Enquanto sua viagem estiver ativa, entregas e caronas exclusivas na mesma direção terão prioridade para você.",
createdBy:"Criado por",
reservedValue:"Valor reservado",
valueLabel:"Valor",
statusLabel:"Status",
loadingOrder:"Carregando pedido...",
orderUnavailable:"Pedido indisponível",
orderTrackedDescription:"Seu pedido está sendo acompanhado pelo INSANE GPS.",
inDeliveryStatus:"Em entrega",
deliveredStatus:"Entregue",
orderCreatedStatus:"Pedido criado",
driverAcceptedStatus:"Entregador aceitou",
outForDeliveryStatus:"Saiu para entrega",
orderDeliveredStatus:"Pedido entregue",
yourDriver:"Seu entregador",
driver:"Entregador",
vehicleNotProvided:"Veículo não informado",
notInformed:"Não informado",
linkInvalid:"Link inválido.",
orderNotFound:"Pedido não encontrado.",
linkInvalidOrExpired:"Link inválido ou expirado.",
loadOrderError:"Não foi possível carregar o pedido.",
rateDriverAndStore:"Dê uma nota para o entregador e para o estabelecimento.",
reviewWouldBuyAgain:"Você voltaria a comprar neste estabelecimento?",
answerYes:"Sim",
answerNo:"Não",
optionalCommentLabel:"Comentário opcional",
sendReviewError:"Não foi possível enviar sua avaliação agora.",
toBeArranged:"A combinar",
receiveCodeInstruction:"Informe este código somente quando receber o pedido.",

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
    deliveryType: "Delivery type",
deliveryObject: "Object",
deliveryRestaurant: "Restaurant",
    restaurantDeliveryTitle: "Restaurant delivery",
    pizzeriaDeliveryTitle: "Pizzeria delivery",
    burgerDeliveryTitle: "Burger delivery",
    snackBarDeliveryTitle: "Snack bar delivery",
    marketDeliveryTitle: "Market delivery",

restaurantType: "Business type",
restaurantName: "Business name",
restaurantOrder: "Order",
restaurantCustomer: "Customer",
restaurantPhone: "Phone",

thermalBag: "Thermal bag",
thermalBagNotRequired: "Not required",
thermalBagRequired: "Required",
thermalBagProvided: "Provided by restaurant",

orderSize: "Order size",
smallOrder: "Small order",
mediumOrder: "Medium order",
largeOrder: "Large order",
veryLargeOrder: "Very large order",

fragileOrder: "Fragile order",

deliveryCode: "Delivery code",
confirmDelivery: "Confirm delivery",
enterDeliveryCode: "Enter delivery code",

driverRating: "Rate the driver",
restaurantRating: "Rate the restaurant",
sendReview: "Send review",

priorityDrivers: "Priority for drivers already heading that way",

exclusiveRide: "Exclusive ride",
sharedRide: "Shared ride",

availableSeats: "Available seats",
reservedSeats: "Reserved seats",

bagProvidedByRestaurant: "Restaurant provides thermal bag",

customer: "Customer",
restaurant: "Restaurant",
establishment: "Business",
addressNotProvided: "Address not provided",
restaurantPickupNoticeTitle: "✓ Using the pickup address as the business address",
restaurantPickupNoticeText: "Fill in the pickup address with the pizza place, restaurant, snack bar, or market address.",
restaurantDeliveryDescription: "🍔 Order from a restaurant, pizza place, snack bar, or market for a Premium courier to accept.",
commonDeliveryDescription: "📦 Regular delivery of an item, box, or package.",

placeholderRestaurantName: "Example: John's Snack Bar",
placeholderCustomerName: "Example: Maria Silva",
placeholderCustomerPhone: "Example: +1 555 000 0000",
placeholderRestaurantOrder: "Example: Order 243 - 2 burgers and 1 soda",
placeholderDeliveryObject: "Example: Medium box, 10kg",
placeholderDriverVehicle: "Example: Carlos - Silver sedan",
placeholderPassengerName: "Example: John Smith",

restaurantOptionRestaurant: "Restaurant",
restaurantOptionSnackBar: "Snack bar",
restaurantOptionPizza: "Pizza place",
restaurantOptionBurger: "Burger place",
restaurantOptionMarket: "Small market",
restaurantOptionOther: "Other",

fragile: "Fragile",
orderSummary:"Order summary",

deliveryVolume:"Delivery volume",

deliverySmallBox:"Small box",
deliveryMediumBox:"Medium box",
deliveryLargeBox:"Large box",
deliveryLargeVolume:"Large package",

vehicleSaved:"Saved vehicles",

tripMode:"Trip type",

sharedTrip:"Shared",
exclusiveTrip:"Exclusive",

sharedTripDescription:"💺 Lower cost by sharing the ride.",
exclusiveTripDescription:"🚗 Private ride just for you.",
largeBaggageWarning:"Large baggage is usually more comfortable on an exclusive ride. Even so, you can create the shared offer. The driver decides whether to accept it.",

savedProfileData:"Use saved profile data",
baggage:"Baggage",
noBaggage:"No baggage",
backpack:"Backpack",
smallSuitcase:"Small suitcase",
mediumSuitcase:"Medium suitcase",
largeSuitcase:"Large suitcase",
smallBag:"Small baggage",
mediumBag:"Medium baggage",
largeBag:"Large baggage",

pickupAddress:"Pickup address",
deliveryAddress:"Delivery address",

street:"Street",
number:"Number",
district:"District",
city:"City",
state:"State",
zipCode:"ZIP Code",
complement:"Complement",

placeholderStreet:"Street",
placeholderNumber:"Number",
placeholderDistrict:"District",
placeholderCity:"City",
placeholderState:"State",
placeholderZipCode:"ZIP Code",
placeholderComplement:"Complement (optional)",

departureAddress:"Departure address",
boardingAddress:"Pickup address",
dropoffAddress:"Drop-off address",
destinationAddress:"Destination address",
requestRide:"Request ride",
offerRide:"Offer ride",
requestDelivery:"Request delivery",

freePlanOfferHelp:"Free/Pro plan: you can request rides and deliveries. To offer rides and earn money, activate Premium.",

peopleQuantity:"Number of people",
availableSeatsLabel:"Available seats",

rideDate:"Ride date",
deliveryDate:"Delivery date",
departureDate:"Departure date",

desiredTime:"Desired time",
estimatedDeliveryTime:"Estimated delivery time",
estimatedDepartureTime:"Estimated departure time",

deliveryNotesOptional:"Delivery notes (optional)",
passengerNotesOptional:"Passenger notes (optional)",

placeholderDeliveryNotes:"Example: Leave at the front desk, apartment intercom 23, fragile package.",
placeholderPassengerNotes:"Example: I leave on time, stops only along the main route.",

offeredValue:"Offered amount (R$)",
createOffer:"Create offer",
saveChanges:"Save changes",
wait:"Please wait...",
legalNotice:"Legal notice: this platform connects users. Transactions and agreements are the responsibility of the parties involved.",
fillAllFields:"Please fill in all required fields.",
invalidAddress:"Please enter a valid address.",
selectDeliveryType:"Select a delivery type.",
premiumRequired:"This feature is available only for Premium users.",
offerCreated:"Offer created successfully.",
offerUpdated:"Offer updated successfully.",
offerError:"Unable to save the offer.",
intermediateStops:"Intermediate stops",
intermediateStopsDescription:"After choosing departure and destination, add cities or neighborhoods as stops.",
placeholderStop:"Example: Miami, FL",
add:"Add",
remove:"Remove",

travelIntent:"I'm traveling to another city",

travelDestination:"Trip destination",

travelDestinationPlaceholder:"Example: Miami",

saveTravelIntent:"Save",

removeTravelIntent:"Remove",

travelIntentSaved:"Destination saved successfully.",

travelIntentRemoved:"Destination removed.",

priorityDriversExplanation:"While your trip is active, exclusive rides and deliveries in the same direction will be shown to you first.",
createdBy:"Created by",
reservedValue:"Reserved value",
valueLabel:"Value",
statusLabel:"Status",
loadingOrder:"Loading order...",
orderUnavailable:"Order unavailable",
orderTrackedDescription:"Your order is being tracked by INSANE GPS.",
inDeliveryStatus:"Out for delivery",
deliveredStatus:"Delivered",
orderCreatedStatus:"Order created",
driverAcceptedStatus:"Courier accepted",
outForDeliveryStatus:"Out for delivery",
orderDeliveredStatus:"Order delivered",
yourDriver:"Your courier",
driver:"Courier",
vehicleNotProvided:"Vehicle not provided",
notInformed:"Not informed",
linkInvalid:"Invalid link.",
orderNotFound:"Order not found.",
linkInvalidOrExpired:"Invalid or expired link.",
loadOrderError:"Could not load the order.",
rateDriverAndStore:"Rate the courier and the business.",
reviewWouldBuyAgain:"Would you buy again from this business?",
answerYes:"Yes",
answerNo:"No",
optionalCommentLabel:"Optional comment",
sendReviewError:"Could not send your review right now.",
toBeArranged:"To be arranged",
receiveCodeInstruction:"Share this code only when you receive the order.",

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
    deliveryType: "Type de livraison",
  deliveryObject: "Objet",
  deliveryRestaurant: "Restaurant",
  restaurantDeliveryTitle: "Livraison de restaurant",
  pizzeriaDeliveryTitle: "Livraison de pizzeria",
  burgerDeliveryTitle: "Livraison de burger",
  snackBarDeliveryTitle: "Livraison de snack",
  marketDeliveryTitle: "Livraison de marché",

  restaurantType: "Type d'établissement",
  restaurantName: "Nom de l'établissement",
  restaurantOrder: "Commande",
  restaurantCustomer: "Client",
  restaurantPhone: "Téléphone",

  thermalBag: "Sac thermique",
  thermalBagNotRequired: "Non nécessaire",
  thermalBagRequired: "Nécessaire",
  thermalBagProvided: "Fourni par l'établissement",

  orderSize: "Taille de la commande",
  smallOrder: "Petite commande",
  mediumOrder: "Commande moyenne",
  largeOrder: "Grande commande",
  veryLargeOrder: "Très grande commande",

  fragileOrder: "Commande fragile",

  deliveryCode: "Code de livraison",
  confirmDelivery: "Confirmer la livraison",
  enterDeliveryCode: "Entrez le code de livraison",

  driverRating: "Notez le livreur",
  restaurantRating: "Notez l'établissement",
  sendReview: "Envoyer l'avis",

  priorityDrivers: "Priorité pour les conducteurs déjà dans la même direction",

  exclusiveRide: "Trajet exclusif",
  sharedRide: "Trajet partagé",

  availableSeats: "Places disponibles",
  reservedSeats: "Places réservées",

  bagProvidedByRestaurant: "L'établissement fournit un sac thermique",

  customer: "Client",
  restaurant: "Restaurant",
  establishment: "Établissement",
addressNotProvided: "Dirección no informada",
restaurantPickupNoticeTitle: "✓ Usando la dirección de recogida como dirección del establecimiento",
restaurantPickupNoticeText: "Completa la dirección de recogida con la dirección de la pizzería, restaurante, cafetería o mercado.",
restaurantDeliveryDescription: "🍔 Pedido de restaurante, pizzería, cafetería o mercado para que lo acepte un repartidor Premium.",
commonDeliveryDescription: "📦 Entrega común de objeto, caja o paquete.",

placeholderRestaurantName: "Ej: Cafetería de Juan",
placeholderCustomerName: "Ej: María Silva",
placeholderCustomerPhone: "Ej: +34 600 000 000",
placeholderRestaurantOrder: "Ej: Pedido 243 - 2 hamburguesas y 1 refresco",
placeholderDeliveryObject: "Ej: Caja mediana, 10kg",
placeholderDriverVehicle: "Ej: Carlos - Sedán plateado",
placeholderPassengerName: "Ej: Juan Pérez",

restaurantOptionRestaurant: "Restaurante",
restaurantOptionSnackBar: "Cafetería",
restaurantOptionPizza: "Pizzería",
restaurantOptionBurger: "Hamburguesería",
restaurantOptionMarket: "Mercado pequeño",
restaurantOptionOther: "Otro",

fragile: "Frágil",
orderSummary:"Resumen del pedido",

deliveryVolume:"Volumen de la entrega",

deliverySmallBox:"Caja pequeña",
deliveryMediumBox:"Caja mediana",
deliveryLargeBox:"Caja grande",
deliveryLargeVolume:"Volumen grande",

vehicleSaved:"Vehículos guardados",

tripMode:"Tipo de viaje",

sharedTrip:"Compartido",
exclusiveTrip:"Exclusivo",

sharedTripDescription:"💺 Menor costo al compartir el viaje.",
exclusiveTripDescription:"🚗 Viaje privado solo para ti.",
largeBaggageWarning:"El equipaje grande suele ser más cómodo en un viaje exclusivo. Aun así, puedes crear la oferta compartida. El conductor decide si la acepta.",

savedProfileData:"Usar datos guardados del perfil",

baggage:"Equipaje",
noBaggage:"Sin equipaje",
backpack:"Mochila",
smallSuitcase:"Maleta pequeña",
mediumSuitcase:"Maleta mediana",
largeSuitcase:"Maleta grande",
smallBag:"Equipaje pequeño",
mediumBag:"Equipaje mediano",
largeBag:"Equipaje grande",

pickupAddress:"Dirección de recogida",
deliveryAddress:"Dirección de entrega",

street:"Calle",
number:"Número",
district:"Barrio",
city:"Ciudad",
state:"Provincia",
zipCode:"Código postal",
complement:"Complemento",

placeholderStreet:"Calle",
placeholderNumber:"Número",
placeholderDistrict:"Barrio",
placeholderCity:"Ciudad",
placeholderState:"Provincia",
placeholderZipCode:"Código postal",
placeholderComplement:"Complemento (opcional)",

departureAddress:"Dirección de salida",
boardingAddress:"Dirección de embarque",
dropoffAddress:"Dirección de bajada",
destinationAddress:"Dirección de destino",

requestRide:"Solicitar viaje",
offerRide:"Ofrecer viaje",
requestDelivery:"Solicitar entrega",

freePlanOfferHelp:"Plan Free/Pro: puedes solicitar viajes y entregas. Para ofrecer viajes y ganar dinero, activa Premium.",

peopleQuantity:"Cantidad de personas",
availableSeatsLabel:"Plazas disponibles",

rideDate:"Fecha del viaje",
deliveryDate:"Fecha de la entrega",
departureDate:"Fecha de salida",

desiredTime:"Hora deseada",
estimatedDeliveryTime:"Hora estimada de entrega",
estimatedDepartureTime:"Hora estimada de salida",

deliveryNotesOptional:"Observaciones de la entrega (opcional)",
passengerNotesOptional:"Observaciones para el pasajero (opcional)",

placeholderDeliveryNotes:"Ej: Entregar en recepción, interfono apto 23, paquete frágil.",
placeholderPassengerNotes:"Ej: Salgo puntual, paradas solo en puntos de la ruta principal.",

offeredValue:"Valor ofrecido (R$)",
createOffer:"Crear oferta",
saveChanges:"Guardar cambios",
wait:"Espera...",
legalNotice:"Aviso legal: esta plataforma conecta usuarios. Las transacciones y los acuerdos son responsabilidad de las partes.",
 fillAllFields:"Complete todos los campos obligatorios.",
invalidAddress:"Introduzca una dirección válida.",
selectDeliveryType:"Seleccione un tipo de entrega.",
premiumRequired:"Esta función solo está disponible para usuarios Premium.",
offerCreated:"Oferta creada correctamente.",
offerUpdated:"Oferta actualizada correctamente.",
offerError:"No fue posible guardar la oferta.",
intermediateStops:"Paradas intermedias",
intermediateStopsDescription:"Después de definir origen y destino, agregue ciudades o barrios como paradas.",
placeholderStop:"Ej.: Madrid",
add:"Agregar",
remove:"Eliminar",

travelIntent:"Voy a otra ciudad",

travelDestination:"Destino del viaje",

travelDestinationPlaceholder:"Ej.: Madrid",

saveTravelIntent:"Guardar",

removeTravelIntent:"Eliminar",

travelIntentSaved:"Destino guardado correctamente.",

travelIntentRemoved:"Destino eliminado.",

priorityDriversExplanation:"Mientras tu viaje esté activo, los viajes y entregas exclusivas en la misma dirección tendrán prioridad para ti.",
createdBy:"Creado por",
reservedValue:"Valor reservado",
valueLabel:"Valor",
statusLabel:"Estado",
loadingOrder:"Cargando pedido...",
orderUnavailable:"Pedido no disponible",
orderTrackedDescription:"Tu pedido está siendo seguido por INSANE GPS.",
inDeliveryStatus:"En entrega",
deliveredStatus:"Entregado",
orderCreatedStatus:"Pedido creado",
driverAcceptedStatus:"El repartidor aceptó",
outForDeliveryStatus:"Salió para entrega",
orderDeliveredStatus:"Pedido entregado",
yourDriver:"Tu repartidor",
driver:"Repartidor",
vehicleNotProvided:"Vehículo no informado",
notInformed:"No informado",
linkInvalid:"Enlace inválido.",
orderNotFound:"Pedido no encontrado.",
linkInvalidOrExpired:"Enlace inválido o vencido.",
loadOrderError:"No fue posible cargar el pedido.",
rateDriverAndStore:"Da una nota al repartidor y al establecimiento.",
reviewWouldBuyAgain:"¿Volverías a comprar en este establecimiento?",
answerYes:"Sí",
answerNo:"No",
optionalCommentLabel:"Comentario opcional",
sendReviewError:"No fue posible enviar tu evaluación ahora.",
toBeArranged:"A convenir",
receiveCodeInstruction:"Comparte este código solo cuando recibas el pedido.",

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
    deliveryType: "Delivery type",
deliveryObject: "Object",
deliveryRestaurant: "Restaurant",
  restaurantDeliveryTitle: "Restaurant delivery",
  pizzeriaDeliveryTitle: "Pizzeria delivery",
  burgerDeliveryTitle: "Burger delivery",
  snackBarDeliveryTitle: "Snack bar delivery",
  marketDeliveryTitle: "Market delivery",

restaurantType: "Business type",
restaurantName: "Business name",
restaurantOrder: "Order",
restaurantCustomer: "Customer",
restaurantPhone: "Phone",

thermalBag: "Thermal bag",
thermalBagNotRequired: "Not required",
thermalBagRequired: "Required",
thermalBagProvided: "Provided by restaurant",

orderSize: "Order size",
smallOrder: "Small order",
mediumOrder: "Medium order",
largeOrder: "Large order",
veryLargeOrder: "Very large order",

fragileOrder: "Fragile order",

deliveryCode: "Delivery code",
confirmDelivery: "Confirm delivery",
enterDeliveryCode: "Enter delivery code",

driverRating: "Rate the driver",
restaurantRating: "Rate the restaurant",
sendReview: "Send review",

priorityDrivers: "Priority for drivers already heading that way",

exclusiveRide: "Exclusive ride",
sharedRide: "Shared ride",

availableSeats: "Available seats",
reservedSeats: "Reserved seats",

bagProvidedByRestaurant: "Restaurant provides thermal bag",

customer: "Customer",
restaurant: "Restaurant",
establishment: "Business",
addressNotProvided: "Adresse non renseignée",
restaurantPickupNoticeTitle: "✓ L’adresse de retrait est utilisée comme adresse de l’établissement",
restaurantPickupNoticeText: "Renseignez l’adresse de retrait avec l’adresse de la pizzeria, du restaurant, du snack ou du marché.",
restaurantDeliveryDescription: "🍔 Commande de restaurant, pizzeria, snack ou marché à accepter par un livreur Premium.",
commonDeliveryDescription: "📦 Livraison classique d’un objet, d’une boîte ou d’un colis.",

placeholderRestaurantName: "Ex : Snack de Jean",
placeholderCustomerName: "Ex : Maria Silva",
placeholderCustomerPhone: "Ex : +33 6 00 00 00 00",
placeholderRestaurantOrder: "Ex : Commande 243 - 2 burgers et 1 soda",
placeholderDeliveryObject: "Ex : Boîte moyenne, 10kg",
placeholderDriverVehicle: "Ex : Carlos - Berline argentée",
placeholderPassengerName: "Ex : Jean Dupont",

restaurantOptionRestaurant: "Restaurant",
restaurantOptionSnackBar: "Snack",
restaurantOptionPizza: "Pizzeria",
restaurantOptionBurger: "Burger",
restaurantOptionMarket: "Petit marché",
restaurantOptionOther: "Autre",

fragile: "Fragile",
orderSummary:"Résumé de la commande",

deliveryVolume:"Volume de la livraison",

deliverySmallBox:"Petite boîte",
deliveryMediumBox:"Boîte moyenne",
deliveryLargeBox:"Grande boîte",
deliveryLargeVolume:"Grand volume",

vehicleSaved:"Véhicules enregistrés",

tripMode:"Type de trajet",

sharedTrip:"Partagé",
exclusiveTrip:"Exclusif",

sharedTripDescription:"💺 Coût réduit en partageant le trajet.",
exclusiveTripDescription:"🚗 Trajet privé rien que pour vous.",
largeBaggageWarning:"Les gros bagages sont généralement plus confortables dans un trajet exclusif. Vous pouvez quand même créer l’offre partagée. Le conducteur décide s’il l’accepte.",

savedProfileData:"Utiliser les données enregistrées du profil",

baggage:"Bagages",
noBaggage:"Sans bagage",
backpack:"Sac à dos",
smallSuitcase:"Petite valise",
mediumSuitcase:"Valise moyenne",
largeSuitcase:"Grande valise",
smallBag:"Petit bagage",
mediumBag:"Bagage moyen",
largeBag:"Grand bagage",
pickupAddress:"Adresse de retrait",
deliveryAddress:"Adresse de livraison",

street:"Rue",
number:"Numéro",
district:"Quartier",
city:"Ville",
state:"Région",
zipCode:"Code postal",
complement:"Complément",

placeholderStreet:"Rue",
placeholderNumber:"Numéro",
placeholderDistrict:"Quartier",
placeholderCity:"Ville",
placeholderState:"Région",
placeholderZipCode:"Code postal",
placeholderComplement:"Complément (optionnel)",

departureAddress:"Adresse de départ",
boardingAddress:"Adresse de prise en charge",
dropoffAddress:"Adresse de dépôt",
destinationAddress:"Adresse de destination",
requestRide:"Demander un trajet",
offerRide:"Proposer un trajet",
requestDelivery:"Demander une livraison",

freePlanOfferHelp:"Plan Free/Pro : vous pouvez demander des trajets et des livraisons. Pour proposer des trajets et gagner de l’argent, activez Premium.",

peopleQuantity:"Nombre de personnes",
availableSeatsLabel:"Places disponibles",

rideDate:"Date du trajet",
deliveryDate:"Date de livraison",
departureDate:"Date de départ",

desiredTime:"Heure souhaitée",
estimatedDeliveryTime:"Heure estimée de livraison",
estimatedDepartureTime:"Heure estimée de départ",

deliveryNotesOptional:"Observations de livraison (optionnel)",
passengerNotesOptional:"Observations pour le passager (optionnel)",

placeholderDeliveryNotes:"Ex : Livrer à l’accueil, interphone apt. 23, colis fragile.",
placeholderPassengerNotes:"Ex : Je pars à l’heure, arrêts uniquement sur l’itinéraire principal.",

offeredValue:"Montant proposé (R$)",
createOffer:"Créer l’offre",
saveChanges:"Enregistrer les modifications",
wait:"Veuillez patienter...",
legalNotice:"Avis juridique : cette plateforme met en relation des utilisateurs. Les transactions et accords sont sous la responsabilité des parties.",
fillAllFields:"Remplissez tous les champs obligatoires.",
invalidAddress:"Saisissez une adresse valide.",
selectDeliveryType:"Sélectionnez un type de livraison.",
premiumRequired:"Cette fonction est réservée aux utilisateurs Premium.",
offerCreated:"Offre créée avec succès.",
offerUpdated:"Offre mise à jour avec succès.",
offerError:"Impossible d'enregistrer l'offre.",
intermediateStops:"Arrêts intermédiaires",
intermediateStopsDescription:"Après avoir défini le départ et la destination, ajoutez des villes ou quartiers comme arrêts.",
placeholderStop:"Ex. : Paris",
add:"Ajouter",
remove:"Supprimer",
travelIntent:"Je vais dans une autre ville",

travelDestination:"Destination du trajet",

travelDestinationPlaceholder:"Ex. : Paris",

saveTravelIntent:"Enregistrer",

removeTravelIntent:"Supprimer",

travelIntentSaved:"Destination enregistrée avec succès.",

travelIntentRemoved:"Destination supprimée.",

priorityDriversExplanation:"Pendant que votre trajet est actif, les trajets et livraisons exclusifs dans la même direction vous seront proposés en priorité.",
createdBy:"Créé par",
reservedValue:"Valeur réservée",
valueLabel:"Valeur",
statusLabel:"Statut",
loadingOrder:"Chargement de la commande...",
orderUnavailable:"Commande indisponible",
orderTrackedDescription:"Votre commande est suivie par INSANE GPS.",
inDeliveryStatus:"En livraison",
deliveredStatus:"Livrée",
orderCreatedStatus:"Commande créée",
driverAcceptedStatus:"Le livreur a accepté",
outForDeliveryStatus:"Partie en livraison",
orderDeliveredStatus:"Commande livrée",
yourDriver:"Votre livreur",
driver:"Livreur",
vehicleNotProvided:"Véhicule non renseigné",
notInformed:"Non renseigné",
linkInvalid:"Lien invalide.",
orderNotFound:"Commande introuvable.",
linkInvalidOrExpired:"Lien invalide ou expiré.",
loadOrderError:"Impossible de charger la commande.",
rateDriverAndStore:"Attribuez une note au livreur et à l’établissement.",
reviewWouldBuyAgain:"Recommanderiez-vous cet établissement ?",
answerYes:"Oui",
answerNo:"Non",
optionalCommentLabel:"Commentaire facultatif",
sendReviewError:"Impossible d’envoyer votre avis pour le moment.",
toBeArranged:"À convenir",
receiveCodeInstruction:"Communiquez ce code uniquement lorsque vous recevez la commande.",


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
    deliveryType: "Lieferart",
  deliveryObject: "Objekt",
  deliveryRestaurant: "Restaurant",
  restaurantDeliveryTitle: "Restaurant-Lieferung",
  pizzeriaDeliveryTitle: "Pizzeria-Lieferung",
  burgerDeliveryTitle: "Burger-Lieferung",
  snackBarDeliveryTitle: "Imbiss-Lieferung",
  marketDeliveryTitle: "Markt-Lieferung",

  restaurantType: "Geschäftstyp",
  restaurantName: "Name des Geschäfts",
  restaurantOrder: "Bestellung",
  restaurantCustomer: "Kunde",
  restaurantPhone: "Telefon",

  thermalBag: "Thermotasche",
  thermalBagNotRequired: "Nicht erforderlich",
  thermalBagRequired: "Erforderlich",
  thermalBagProvided: "Vom Geschäft bereitgestellt",

  orderSize: "Bestellgröße",
  smallOrder: "Kleine Bestellung",
  mediumOrder: "Mittlere Bestellung",
  largeOrder: "Große Bestellung",
  veryLargeOrder: "Sehr große Bestellung",

  fragileOrder: "Zerbrechliche Bestellung",

  deliveryCode: "Liefercode",
  confirmDelivery: "Lieferung bestätigen",
  enterDeliveryCode: "Liefercode eingeben",

  driverRating: "Fahrer bewerten",
  restaurantRating: "Geschäft bewerten",
  sendReview: "Bewertung senden",

priorityDrivers: "Priorität für Fahrer in derselben Richtung",

exclusiveRide: "Exklusive Fahrt",
sharedRide: "Geteilte Fahrt",

availableSeats: "Verfügbare Plätze",
reservedSeats: "Reservierte Plätze",

bagProvidedByRestaurant: "Geschäft stellt Thermotasche bereit",

customer: "Kunde",
restaurant: "Restaurant",
establishment: "Geschäft",
addressNotProvided: "Adresse nicht angegeben",
restaurantPickupNoticeTitle: "✓ Abholadresse wird als Geschäftsadresse verwendet",
restaurantPickupNoticeText: "Trage als Abholadresse die Adresse der Pizzeria, des Restaurants, Imbisses oder Marktes ein.",
restaurantDeliveryDescription: "🍔 Bestellung von Restaurant, Pizzeria, Imbiss oder Markt für Premium-Kuriere.",
commonDeliveryDescription: "📦 Normale Lieferung eines Gegenstands, Kartons oder Pakets.",

placeholderRestaurantName: "Beispiel: Johns Imbiss",
placeholderCustomerName: "Beispiel: Maria Silva",
placeholderCustomerPhone: "Beispiel: +49 170 0000000",
placeholderRestaurantOrder: "Beispiel: Bestellung 243 - 2 Burger und 1 Getränk",
placeholderDeliveryObject: "Beispiel: Mittlere Box, 10kg",
placeholderDriverVehicle: "Beispiel: Carlos - Silberne Limousine",
placeholderPassengerName: "Beispiel: Max Müller",

restaurantOptionRestaurant: "Restaurant",
restaurantOptionSnackBar: "Imbiss",
restaurantOptionPizza: "Pizzeria",
restaurantOptionBurger: "Burgerladen",
restaurantOptionMarket: "Kleiner Markt",
restaurantOptionOther: "Andere",

fragile: "Zerbrechlich",
orderSummary:"Bestellübersicht",

deliveryVolume:"Lieferumfang",

deliverySmallBox:"Kleine Box",
deliveryMediumBox:"Mittlere Box",
deliveryLargeBox:"Große Box",
deliveryLargeVolume:"Großes Paket",

vehicleSaved:"Gespeicherte Fahrzeuge",

tripMode:"Fahrtart",

sharedTrip:"Geteilt",
exclusiveTrip:"Exklusiv",

sharedTripDescription:"💺 Günstiger durch geteilte Fahrt.",
exclusiveTripDescription:"🚗 Private Fahrt nur für dich.",
largeBaggageWarning:"Großes Gepäck ist in einer exklusiven Fahrt meistens bequemer. Du kannst trotzdem ein geteiltes Angebot erstellen. Der Fahrer entscheidet, ob er es annimmt.",

savedProfileData:"Gespeicherte Profildaten verwenden",

baggage:"Gepäck",
noBaggage:"Kein Gepäck",
backpack:"Rucksack",
smallSuitcase:"Kleiner Koffer",
mediumSuitcase:"Mittlerer Koffer",
largeSuitcase:"Großer Koffer",
smallBag:"Kleines Gepäck",
mediumBag:"Mittleres Gepäck",
largeBag:"Großes Gepäck",
pickupAddress:"Abholadresse",
deliveryAddress:"Lieferadresse",

street:"Straße",
number:"Hausnummer",
district:"Stadtteil",
city:"Stadt",
state:"Bundesland",
zipCode:"Postleitzahl",
complement:"Zusatz",

placeholderStreet:"Straße",
placeholderNumber:"Hausnummer",
placeholderDistrict:"Stadtteil",
placeholderCity:"Stadt",
placeholderState:"Bundesland",
placeholderZipCode:"Postleitzahl",
placeholderComplement:"Zusatz (optional)",

departureAddress:"Abfahrtsadresse",
boardingAddress:"Abholadresse",
dropoffAddress:"Ausstiegsadresse",
destinationAddress:"Zieladresse",
requestRide:"Fahrt anfragen",
offerRide:"Fahrt anbieten",
requestDelivery:"Lieferung anfragen",

freePlanOfferHelp:"Free/Pro-Plan: Du kannst Fahrten und Lieferungen anfragen. Um Fahrten anzubieten und Geld zu verdienen, aktiviere Premium.",

peopleQuantity:"Anzahl der Personen",
availableSeatsLabel:"Verfügbare Plätze",

rideDate:"Fahrtdatum",
deliveryDate:"Lieferdatum",
departureDate:"Abfahrtsdatum",

desiredTime:"Gewünschte Uhrzeit",
estimatedDeliveryTime:"Geschätzte Lieferzeit",
estimatedDepartureTime:"Geschätzte Abfahrtszeit",

deliveryNotesOptional:"Lieferhinweise (optional)",
passengerNotesOptional:"Hinweise für Passagiere (optional)",

placeholderDeliveryNotes:"Beispiel: An der Rezeption abgeben, Gegensprechanlage Wohnung 23, zerbrechliches Paket.",
placeholderPassengerNotes:"Beispiel: Ich fahre pünktlich los, Stopps nur entlang der Hauptroute.",

offeredValue:"Angebotener Betrag (R$)",
createOffer:"Angebot erstellen",
saveChanges:"Änderungen speichern",
wait:"Bitte warten...",
legalNotice:"Rechtlicher Hinweis: Diese Plattform verbindet Nutzer. Transaktionen und Vereinbarungen liegen in der Verantwortung der beteiligten Parteien.",
fillAllFields:"Bitte füllen Sie alle Pflichtfelder aus.",
invalidAddress:"Bitte geben Sie eine gültige Adresse ein.",
selectDeliveryType:"Wählen Sie eine Lieferart aus.",
premiumRequired:"Diese Funktion ist nur für Premium-Benutzer verfügbar.",
offerCreated:"Angebot erfolgreich erstellt.",
offerUpdated:"Angebot erfolgreich aktualisiert.",
offerError:"Das Angebot konnte nicht gespeichert werden.",
intermediateStops:"Zwischenstopps",
intermediateStopsDescription:"Nachdem Start und Ziel festgelegt wurden, können Städte oder Stadtteile als Zwischenstopps hinzugefügt werden.",
placeholderStop:"z. B. Berlin",
add:"Hinzufügen",
remove:"Entfernen",
travelIntent:"Ich fahre in eine andere Stadt",

travelDestination:"Fahrtziel",

travelDestinationPlaceholder:"z. B. Berlin",

saveTravelIntent:"Speichern",

removeTravelIntent:"Entfernen",

travelIntentSaved:"Ziel erfolgreich gespeichert.",

travelIntentRemoved:"Ziel entfernt.",

priorityDriversExplanation:"Während deine Fahrt aktiv ist, werden dir exklusive Fahrten und Lieferungen in derselben Richtung bevorzugt angezeigt.",
createdBy:"Erstellt von",
reservedValue:"Reservierter Wert",
valueLabel:"Wert",
statusLabel:"Status",
loadingOrder:"Bestellung wird geladen...",
orderUnavailable:"Bestellung nicht verfügbar",
orderTrackedDescription:"Deine Bestellung wird von INSANE GPS verfolgt.",
inDeliveryStatus:"In Lieferung",
deliveredStatus:"Geliefert",
orderCreatedStatus:"Bestellung erstellt",
driverAcceptedStatus:"Lieferfahrer hat angenommen",
outForDeliveryStatus:"Unterwegs zur Lieferung",
orderDeliveredStatus:"Bestellung geliefert",
yourDriver:"Dein Lieferfahrer",
driver:"Lieferfahrer",
vehicleNotProvided:"Fahrzeug nicht angegeben",
notInformed:"Nicht angegeben",
linkInvalid:"Ungültiger Link.",
orderNotFound:"Bestellung nicht gefunden.",
linkInvalidOrExpired:"Ungültiger oder abgelaufener Link.",
loadOrderError:"Die Bestellung konnte nicht geladen werden.",
rateDriverAndStore:"Bewerte den Lieferfahrer und das Geschäft.",
reviewWouldBuyAgain:"Würdest du bei diesem Geschäft wieder bestellen?",
answerYes:"Ja",
answerNo:"Nein",
optionalCommentLabel:"Optionaler Kommentar",
sendReviewError:"Deine Bewertung konnte gerade nicht gesendet werden.",
toBeArranged:"Nach Vereinbarung",
receiveCodeInstruction:"Diesen Code erst mitteilen, wenn du die Bestellung erhältst.",

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
