export const productSource = 'https://r1eletricos.com.br/catalogo/scooters-eletricas/scooter-eletrica-n7-1000w';
export const comparisonSource = 'https://b2b.marcafcf.com.br/ciclismo/bicicleta-eletrica/bike-eletrica-san-yang-t9-x12-1000w-com-carplay-e-bluetooth-preto-1779';
export const lightingSource = 'https://eletronmotosebike.com.br/';

export const partLabels: Record<string, string> = {
  overview: 'Vista geral',
  frame: 'Perfil e estrutura',
  front: 'Farol e dianteira',
  cockpit: 'Painel e comandos',
  rear: 'Assento e traseira',
};

export const productParts = [
  {
    id: 'overview', number: '00', eyebrow: 'San Yang · N7',
    title: 'Mobilidade urbana, com presença.',
    description: 'A N7 combina estrutura reforçada, bateria removível e motor de 1.000 W para acompanhar os trajetos do dia a dia.',
    detail: 'A ficha e os recursos variam entre as configurações anunciadas pelos revendedores. Confirme a unidade disponível com a MOV.',
    stat: '1.000 W', statLabel: 'Motor anunciado',
  },
  {
    id: 'frame', number: '01', eyebrow: 'Perfil e estrutura',
    title: 'Uma silhueta feita para a rotina.',
    description: 'O quadro de aço reforçado desenha o perfil urbano da N7. A vista lateral revela como o assento, a base e as rodas formam um conjunto compacto.',
    detail: 'As páginas consultadas descrevem quadro em aço reforçado, pneus 2.15-10 e carga máxima anunciada de 150 kg. Confirme a configuração com a equipe MOV.',
    stat: 'Aço', statLabel: 'Quadro reforçado',
  },
  {
    id: 'front', number: '02', eyebrow: 'Farol e dianteira',
    title: 'Luz e desenho na mesma linha.',
    description: 'O farol full LED e as linhas da carenagem dão identidade à dianteira da N7 — o detalhe que conduz o olhar para o próximo trecho.',
    detail: 'O farol full LED é informado pela Eletron Motos & Bike. Consulte a unidade MOV para confirmar a configuração de iluminação.',
    stat: 'Full LED', statLabel: 'Farol dianteiro',
  },
  {
    id: 'cockpit', number: '03', eyebrow: 'Painel e comandos',
    title: 'Tudo o que você precisa, à mão.',
    description: 'Guidão, manoplas e painel digital ficam reunidos no cockpit. O vídeo se aproxima dos comandos para mostrar esse ponto de contato com a N7.',
    detail: 'As fontes listam partida por chave e controle remoto e mencionam Bluetooth integrado, sem detalhar a função. Confirme os recursos da unidade antes da compra.',
    stat: 'No guidão', statLabel: 'Painel e comandos',
  },
  {
    id: 'rear', number: '04', eyebrow: 'Assento e traseira',
    title: 'Conforto que completa o conjunto.',
    description: 'O assento alongado e o acabamento traseiro fecham o perfil da scooter. No final do filme, a câmera recua para revelar a N7 por inteiro.',
    detail: 'Baú e acessórios podem variar. A listagem consultada recomenda confirmar se esses itens acompanham a unidade.',
    stat: 'N7', statLabel: 'Vista completa',
  },
];

export const productSpecs: [string, string][] = [
  ['Motor', '1.000 W'],
  ['Velocidade máxima anunciada', 'Até 32 km/h'],
  ['Autonomia anunciada', 'Até 50 km por carga'],
  ['Bateria', 'Lítio removível; uma listagem informa 60 V / 20 Ah'],
  ['Tempo de recarga anunciado', '6 a 8 horas'],
  ['Pneus', '2.15-10'],
  ['Quadro', 'Aço reforçado'],
  ['Freios', 'A disco hidráulico'],
  ['Carga máxima anunciada', '150 kg'],
  ['Partida', 'Chave e controle remoto'],
  ['Bluetooth', 'Integrado; função não detalhada'],
];

export const productPhotos = [
  { name: 'geral', alt: 'Vista lateral da scooter elétrica San Yang N7', caption: 'A N7 por inteiro.', width: 2000, height: 1116 },
  { name: 'farol', alt: 'Farol LED e carenagem dianteira da San Yang N7', caption: 'Luz e desenho na dianteira.', width: 2000, height: 1493 },
  { name: 'painel', alt: 'Painel digital, guidão e comandos da San Yang N7', caption: 'O cockpit, visto de perto.', width: 2000, height: 1116 },
  { name: 'traseira', alt: 'Assento e acabamento traseiro da San Yang N7', caption: 'Linhas que completam o perfil.', width: 2000, height: 1116 },
];
