// Ported verbatim from the Claude Design prototype "Slime Test.dc.html".
// Booth-info strings (orgName / boothName / ...) are configurable — see config.ts.

export type AnimalKey = 'dog' | 'cat' | 'rabbit' | 'fox';

export interface AnimalType {
  key: AnimalKey;
  species: string;
  name: string;
  tint: string;
  ink: string;
  color: string;
  tagline: string;
  sub: string;
  desc: string;
  keywords: string[];
  best: AnimalKey;
  recipe: string;
  share: string;
}

export const TYPES: Record<AnimalKey, AnimalType> = {
  dog: {
    key: 'dog',
    species: '🐶 골든 리트리버',
    name: '번개 강아지 일렉',
    tint: '#FFF2E0',
    ink: '#C07A2E',
    color: '#FFC98A',
    tagline: '친구가 곧 에너지!',
    sub: '에너지 넘치고 빠르게 행동하는 아이',
    desc: '사람들과 어울리는 걸 좋아하고 분위기를 밝게 만드는 타입. 처음 만난 사람과도 금방 친해지는 편이고, 친구의 기분도 잘 살펴주는 편이에요.',
    keywords: ['친화력', '활발함', '긍정', '공감'],
    best: 'cat',
    recipe: '번개 크런치 슬라임',
    share: '31%',
  },
  cat: {
    key: 'cat',
    species: '🐱 고양이',
    name: '설계냥 아키',
    tint: '#F1ECFF',
    ink: '#6C5CE7',
    color: '#C3B4F5',
    tagline: '혼자 있어도 하나도 안 심심해!',
    sub: '자기만의 공간과 아이디어가 확실한 아이',
    desc: '남들이 뭐라고 하든 자신의 취향과 속도를 중요하게 생각하는 타입. 혼자만의 시간도 잘 즐기고, 좋아하는 것이 확실한 편이에요.',
    keywords: ['독립적', '자기주관', '취향', '여유'],
    best: 'dog',
    recipe: '투명 클리어 슬라임',
    share: '21%',
  },
  rabbit: {
    key: 'rabbit',
    species: '🐰 토끼',
    name: '마음토끼 모아',
    tint: '#FFEFF6',
    ink: '#C4568B',
    color: '#FFC6DF',
    tagline: '너의 마음까지 생각하는 중!',
    sub: '친구의 마음을 잘 이해하고 공감하는 아이',
    desc: '상대방의 감정을 잘 살피고 주변 사람들을 세심하게 챙기는 타입. 친구와의 관계에서 배려와 조화를 중요하게 생각해요.',
    keywords: ['배려', '공감', '섬세함', '안정'],
    best: 'fox',
    recipe: '폭신 구름 슬라임',
    share: '26%',
  },
  fox: {
    key: 'fox',
    species: '🦊 여우',
    name: '설계여우 코디',
    tint: '#E6F6FD',
    ink: '#2C7FA8',
    color: '#8FD3F0',
    tagline: '새로운 건 못 참지!',
    sub: '호기심 많고 새로운 기술을 좋아하는 아이',
    desc: '새로운 아이디어와 경험을 좋아하고, 남들과 조금 다른 방법을 찾는 타입. "왜?" "만약에?"라는 생각이 많아서 예상하지 못한 아이디어를 잘 떠올려요.',
    keywords: ['호기심', '창의력', '도전', '유연함'],
    best: 'rabbit',
    recipe: '야광 오로라 슬라임',
    share: '22%',
  },
};

export const ORDER: AnimalKey[] = ['dog', 'cat', 'rabbit', 'fox'];

export const CHIPS = ['#FFE3C2', '#E4DBFF', '#FFD9E9', '#CFEEFB'];
export const KW_BG = ['#E8F1FF', '#EFE8FF', '#FFE7F3', '#E1F7F5'];
export const KW_INK = ['#2F6BB0', '#6C5CE7', '#C4568B', '#268A82'];

export interface Question {
  text: string;
  opts: { text: string; w: Partial<Record<AnimalKey, number>> }[];
}

export const QUESTIONS: Question[] = [
  {
    text: '처음 만난 사람이 나에게 먼저 말을 걸었다.',
    opts: [
      { text: '나도 반갑게 바로 대화를 이어간다.', w: { dog: 1 } },
      { text: '짧게 응대하고 내 할 일이나 내 페이스를 유지한다.', w: { cat: 1 } },
      { text: '일단 어떤 사람인지 조금 지켜본다.', w: { rabbit: 1 } },
      { text: '갑자기 친해질 생각에 이것저것 궁금해진다.', w: { fox: 1 } },
    ],
  },
  {
    text: '친구들과 만나기로 했는데 갑자기 약속 장소가 바뀌었다!',
    opts: [
      { text: '“오히려 좋아! 새로운 곳 가보자.”', w: { dog: 1 } },
      { text: '“난 어디든 상관없어~” 하고 내 할 거 하면서 따라간다.', w: { cat: 1 } },
      { text: '갑작스러운 변경은 조금 당황스럽다.', w: { rabbit: 1 } },
      { text: '새로운 장소가 어떤 곳인지 바로 찾아본다.', w: { fox: 1 } },
    ],
  },
  {
    text: '친구가 "나 오늘 진짜 힘든 일 있었어"라고 연락했다.',
    opts: [
      { text: '"무슨 일인데?" 바로 전화한다.', w: { dog: 1 } },
      { text: '해결책을 제시해준다.', w: { cat: 1 } },
      { text: '"많이 힘들었겠다…" 진심으로 감정에 공감하고 위로해준다.', w: { rabbit: 1 } },
      { text: '"잠깐만, 내가 맛있는 거 추천해줄게!" 분위기를 바꿔준다.', w: { fox: 1 } },
    ],
  },
  {
    text: 'SNS를 보다가 완전 취향인 콘텐츠를 발견했다!',
    opts: [
      { text: '친구들에게 바로 공유한다.', w: { dog: 1 } },
      { text: '혼자 저장해두고 나중에 천천히 본다.', w: { cat: 1 } },
      { text: '댓글이나 후기까지 꼼꼼하게 읽어본다.', w: { rabbit: 1 } },
      { text: '"이걸 직접 해보면 어떨까?" 새로운 생각을 한다.', w: { fox: 1 } },
    ],
  },
  {
    text: '수행평가가 일주일 뒤다. 나는?',
    opts: [
      { text: '친구들과 모여서 같이 준비하거나 서로 물어본다.', w: { dog: 1 } },
      { text: '내 컨디션과 필에 맞춰서 내 속도대로 진행한다.', w: { cat: 1 } },
      { text: '차근차근 계획을 세워 미리 안전하게 준비한다.', w: { rabbit: 1 } },
      { text: '갑자기 영감이 떠오르면 그때 집중해서 한다.', w: { fox: 1 } },
    ],
  },
  {
    text: '친구들과 단체사진을 찍기로 했다.',
    opts: [
      { text: '"우리 여기서 찍자!" 내가 먼저 포즈를 제안한다.', w: { dog: 1 } },
      { text: '내가 편한 자리나 잘 나오는 각도를 알아서 잡는다.', w: { cat: 1 } },
      { text: '친구들이 원하는 포즈와 자리에 맞춰준다.', w: { rabbit: 1 } },
      { text: '평범한 포즈 말고 재밌는 포즈를 생각한다.', w: { fox: 1 } },
    ],
  },
];

export interface Compat {
  s: string;
  t: string;
  l: string;
  g: string;
}

// Key = [myKey, friendKey].sort().join('-')
export const COMPAT: Record<string, Compat> = {
  'cat-dog': {
    s: '95%',
    t: '최고의 짝꿍',
    l: '강아지가 먼저 다가오고 고양이가 슬쩍 받아주는, 보기만 해도 흐뭇한 조합!',
    g: '서로 색 골라주기 챌린지',
  },
  'dog-dog': {
    s: '90%',
    t: '하루 종일 신남',
    l: '서로 리액션해주느라 시간 순삭. 대신 재료가 빨리 떨어질 수도 있어!',
    g: '서로 만든 거 바꿔 갖기',
  },
  'dog-rabbit': {
    s: '93%',
    t: '따뜻한 에너지 팀',
    l: '강아지가 신나게 이끌고 토끼가 다정하게 챙겨줘. 제일 편안한 조합이야.',
    g: '커플 키링 만들기',
  },
  'dog-fox': {
    s: '88%',
    t: '실험 정신 폭발',
    l: '여우가 아이디어 내고 강아지가 바로 실행. 뭐가 나올지 아무도 몰라!',
    g: '제일 튀는 색 대결',
  },
  'cat-cat': {
    s: '72%',
    t: '서로 거리 딱 지키는 사이',
    l: '말 안 해도 편한 사이. 각자 만들다 가끔 서로 거 구경하는 그림이 그려져.',
    g: '각자 자리에서 조용히 집 만들기',
  },
  'cat-rabbit': {
    s: '86%',
    t: '조용한 다정함',
    l: '토끼가 먼저 마음 열고 고양이가 천천히 다가와. 오래 가는 조합이야.',
    g: '파스텔 톤 맞춰 만들기',
  },
  'cat-fox': {
    s: '84%',
    t: '취향 저격 콤비',
    l: '둘 다 남들과 다른 걸 좋아해. 결과물 퀄리티는 이 조합이 제일 높아.',
    g: '2인 합작 대형 캐릭터 집',
  },
  'rabbit-rabbit': {
    s: '89%',
    t: '서로 챙기다 하루 끝',
    l: '둘 다 배려왕이라 재료 양보하느라 시간 다 갈지도!',
    g: '서로 이름 넣은 키링',
  },
  'fox-rabbit': {
    s: '91%',
    t: '상상 + 마음',
    l: '여우가 엉뚱하게 던지면 토끼가 예쁘게 다듬어. 균형이 좋은 팀이야.',
    g: '이야기 있는 캐릭터 집 만들기',
  },
  'fox-fox': {
    s: '80%',
    t: '통제 불가 아이디어',
    l: '둘 다 새로운 것만 찾다가 완성이 늦어질 수 있어. 그래도 제일 재밌어!',
    g: '레시피 무시하고 섞어보기',
  },
};

export const STATS: { k: AnimalKey; p: string }[] = [
  { k: 'dog', p: '31%' },
  { k: 'rabbit', p: '26%' },
  { k: 'fox', p: '22%' },
  { k: 'cat', p: '21%' },
];
