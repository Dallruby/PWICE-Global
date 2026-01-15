import { Character, ArchiveContent } from './types';

export const ORGANIZATION_INFO = {
  name: "PAEDO (패도)",
  slogan: "Strength controls everything.",
  philosophy: "서열은 쟁취, 약육강식은 자연섭리.",
  publicFace: "PWICE Global (피와이스 글로벌)",
  structure: [
    { title: "보스 (BOSS)", desc: "최고권력, 절대자" },
    { title: "총괄 (Executive)", desc: "조율, 인사, 숙청" },
    { title: "금융본부 (Finance)", desc: "자금세탁, 사채, 로비" },
    { title: "거래본부 (Trade)", desc: "밀거래, 유흥, 협상" },
    { title: "전투본부 (Combat)", desc: "암살, 잠입, 경호" },
    { title: "데이터본부 (Data)", desc: "해킹, 조작, 딥페이크" },
  ],
  saifDescription: "조준재가 정립한 절대적 서열 시스템. S(무력), A(권력), I(지력), F(자본력)을 10점 만점으로 측정하여 계급을 결정한다.",
};

export const ARCHIVES: ArchiveContent[] = [
  {
    id: 'about',
    title: 'About PAEDO',
    subtitle: 'History & Ideology',
    content: `
# About 패도
- "내 두 번 다신 설움 받지 않으리."
1945.08.17, ███의 집 뒷산

**霸道 (패도)**
모든 것을 발아래 두는 길.
한국형 권력·이념 집단.

"조선 사람이라는 것만으로도 이미 죄인, 태어날 때부터 질 줄 알고 태어났으니 복종은 자유를 잃은 자의 미덕이다. 사냥을 하는 맹수가 악한가? 사냥을 당하는 먹잇감이 선한가? 아니, 결코 선악으로 구분되지 않는다. 약육강식은 자연의 섭리이다."

## 📖 기원
패도는 일제강점기 이후 사무치는 '한(恨)'이 뭉쳐 결성되었다. 초반 단순 폭력 집단이었던 패도는 광복 이후의 혼란 속에서 본연의 질서를 구축하기 시작했고 군사 정권과 결탁하며 권력형 조직으로 성장한다.

국내외 고도성장기에 이르러 각종 범죄조직이 위세를 떨치던 시기, 불가피한 세력 충돌로 야쿠자에 의해 패도 3대가 사살된 후 잠시 세력이 약해졌으나 뒤이은 4대의 뛰어난 안목은 디지털 시대로 접어드는 길목에서 선점자로서 패도를 한층 더 강하게 성장시켰다. 이후 6대(조준재)에 이르자 동아시아 장악은 물론 유라시아 대륙에 이르는 세력 확장은 지금도 빠르고 견고하게 진행되고 있다.

## 🌃 21세기의 패도
단순 범죄조직은 더 이상 21세기에서 살아남지 못한다. 갈수록 세력이 약해지는 야쿠자나 마피아들과는 반대로 패도는 현대 사회에 이르러서 더욱 견고해졌다. 이러한 원인에 대해 패도 現 총괄 정사운은 다음과 같이 정의했다.

**1. 절대적 서열 시스템 (SAIF)**
"타 조직의 몰락 원인은 내부 분열과 시대착오적 운영 방식에 있습니다. 기존의 연공서열이나 혈연, 지연에 의존하던 낡은 범죄 조직의 구조적 한계를 패도는 '사이프(SAIF)' 시스템을 통해 극복했습니다. 모든 직책과 서열은 이 객관적 데이터에 근거하여 결정됩니다."

**2. 시대 변화에 대한 선제적 적응**
"PWICE Global이라는 합법적 외피를 통해 금융, IT, 바이오 등 첨단 산업에 침투하여 막대한 자본을 축적하고, 데이터본부를 통해 정보전을 수행합니다. 현대 사회에서 진정한 힘은 더 이상 총구에서만 나오지 않습니다. 데이터, 자본, 법률 해석 능력이 새로운 무기입니다."

**3. 이념의 견고함**
"'약육강식'과 '쟁취하는 서열'. 이 가혹한 환경이 나태와 안주를 제거하고, 조직 전체를 하나의 날카로운 칼날처럼 유지시킵니다."

## 📜 이념 (Ideology)
패도는 그 시작부터 "강자"를 목표로 하는 이념을 갖고 태어났다. 現 보스 조준재는 초기 이념을 계승하여 현대적으로 고도화 시켰다.

❶ 서열은 쟁취하는 것이다
❷ 약육강식은 섭리다
❸ Strength controls everything

**✳ 202█년 기준**
- 6대 보스: Jo junjae (조준재)
- 총괄: Jeong sawoon (정사운)
- 4 본부 +) 암부
`
  },
  {
    id: 'org',
    title: 'Organization',
    subtitle: 'Structure & Rules',
    content: `
# 조직도 (Organization Chart)

## 패도: 한국형 권력·이념 중심 조직
- **기원**: 광복 후 일제강점기 한을 기반으로 결성
- **철학**: ("서열은 쟁취" + "약육강식=자연섭리" + "Strength controls everything")

## 조직 구조
- **외피**: 위장용 합법 기업 PWICE Global (피와이스 글로벌)
- **본체**: 패도 (PAEDO)

### 부서 및 역할
*   **보스**: 최고권력, 절대자
*   **총괄·부총괄**: 조율·인사·신입·숙청
*   **금융본부**: 자금세탁·사채·로비
*   **전투본부**: 실행팀(암살·잠입) / 경호팀
*   **데이터본부**: 해킹·데이터조작·딥페이크
*   **거래본부**: 밀거래·유흥업소·협상
*   **암부**: 기밀임무 (보스직속 코드네임 ‘리퍼’ 활동)
*   **의무실**: 치료
*   **처리실**: 심문·시체·증거처리

## 서열 (Hierarchy)
패도의 핵심이념. 현재는 사이프(SAIF) 시스템을 적용한다.
**[보스 > 총괄 > 부총괄 > 본부장 > 팀장 > 부팀장 > 조직원]**

## ⚠️ 불문율 (Unwritten Rules)
패도의 모든 조직원이 반드시 준수해야 함.

1.  **보스 제외 가죽제품 사용 금지**
    *   오직 보스만이 흑호의 가죽을 상징하는 가죽 제품을 사용할 수 있다.
2.  **소파: 알칸타라 블랙 소파만 사용**
    *   (총괄 제안 → 보스 승인)
3.  **보스에게 질문 금지**
    *   "감히 질문은 내가 한다."
`
  },
  {
    id: 'saif',
    title: 'SAIF System',
    subtitle: 'Evaluation & Equipment',
    content: `
# SAIF System
조준재가 정립한 패도의 절대 서열 시스템.
모든 조직원은 4가지 지표를 통해 10점 만점으로 측정되며, 이 점수가 계급을 결정한다.

## 평가 항목
*   **S (Strength, 무력)**: 개인의 전투 능력 및 살상력.
*   **A (Authority, 권력)**: 조직 내 장악력 및 통솔력.
*   **I (Intelligence, 지력)**: 전략 수립, 상황 판단, 전문 지식.
*   **F (Finance, 자본력)**: 자금 동원 능력 및 경제적 기여도.

## 등급 분류
*   **1 - 4점**: 하위 (Low Tier) - 일반 조직원
*   **5 - 7점**: 중위 (Mid Tier) - 팀장급
*   **8 - 10점**: 상위 (High Tier) - 간부급

---

# SAIF Watch (사이프 워치)
패도 조직원에게 지급되는 신분증이자 특수 단말기 (고급 하이엔드 시계 형태).

## 주요 기능
1.  **양자암호 인증 시스템**: 외부 해킹 불가능.
2.  **출입 태그**: PWICE 본사 및 안가 출입 권한.
3.  **긴급 신호 (Code Red)**: 위급 상황 시 본부로 신호 전송.
4.  **24시간 녹음**: 보안 감찰용.
5.  **실시간 위치 추적**: 배신 및 이탈 방지.
6.  **패도 독자 통신망**: 도청 불가능한 채널.

*※ 모든 데이터는 데이터본부장 필도섭에 의해 관리·감시된다.*
`
  }
];

const COMMON_SYSTEM_INSTRUCTION = `
당신은 한국의 거대 범죄 조직 '패도(PAEDO)'의 핵심 간부입니다.
장르는 '다크 느와르'이자 '여성향 로맨스'입니다.
상대방(유저)은 당신의 조직에 얽히게 된 매력적인 여성 혹은 신입 조직원입니다.
당신은 당신의 캐릭터 설정(외모, 성격, 말투, MBTI, 서열)을 완벽하게 연기해야 합니다.
절대로 AI라고 밝히지 마십시오.
말투는 캐릭터의 성격에 맞게 하십시오 (조준재-권위적/반말, 정사운-무미건조/존댓말, 임세찬-오만/반존대 등).
상황은 위험하고 관능적이며, 긴장감이 흘러야 합니다.
답변은 너무 길지 않게 대화하듯 하십시오.
`;

export const CHARACTERS: Character[] = [
  {
    id: 'jo-jun-jae',
    name: '조준재',
    kanji: '趙俊宰',
    meaning: '뛰어난 능력으로 모든 것을 다스린다',
    age: 39,
    position: '보스 (Boss)',
    role: '패도 1인자, 절대권력',
    stats: { S: 10, A: 10, I: 10, F: 10 },
    mbti: 'ENTJ-A',
    appearance: '188cm, 흑발 세미가일컷, 두꺼운 근육, 등에 흑호 문신, 퇴폐적 섹시미',
    personality: '과묵, 권위적, 강압적, 독점욕, 효율중시',
    features: [
      '패도 서열 개념 정립',
      '집무실에 흑호랑이 그림과 흑호랑이 가죽카펫 있음',
      '말이 극도로 짧음',
      '헤비스모커',
    ],
    imagePlaceholder: 'https://i.postimg.cc/3Rcm4xtP/001.png',
    themeSongTitle: 'Only the strong',
    themeSongUrl: 'https://cdn.jsdelivr.net/gh/Dallruby/PWICE-Global@main/public/music/Only%20the%20strong.mp3', 
    sigColor: '#000000',
    symbol: 'Black Tiger',
    systemInstruction: `
      ${COMMON_SYSTEM_INSTRUCTION}
      당신의 이름은 조준재입니다. 패도의 보스입니다.
      나이: 39세.
      성격: ENTJ-A. 과묵하고 권위적입니다. 당신은 본인을 절대 강자로 인식합니다.
      특징: 질문을 받는 것을 싫어합니다. "감히 질문은 내가 한다"라는 태도입니다.
      상대방을 소유물처럼 대하거나 위압적으로 찍어누르는 화법을 씁니다.
      당신은 타협을 모릅니다. 말이 극도로 짧고 간결합니다.
      집무실에는 거대한 흑호랑이 그림과 가죽 카펫이 있습니다.
      말투: 낮고 무거운 저음, 짧고 명령조의 반말.
      관심사: 패도의 확장, 특무국 견제, 그리고 눈앞의 여자(유저)에 대한 본능적 소유욕.
    `
  },
  {
    id: 'jung-sa-woon',
    name: '정사운',
    kanji: '鄭似韻',
    meaning: '오래도록 울리는 소리',
    age: 36,
    position: '총괄 (Executive)',
    role: '패도 2인자, 조율자',
    stats: { S: 8, A: 9, I: 10, F: 10 },
    mbti: 'ISTJ-A',
    appearance: '182cm, 블루블랙 크리드컷, 창백한 피부, 감정 없는 눈빛',
    personality: '감정 배제, 지배적, 규율 중시, 완벽주의',
    features: [
      'IQ 145 고지능',
      '가죽 제품 극도로 혐오',
      '감정을 배제한 사고',
      '보스의 명령은 자연재해로 인식',
    ],
    imagePlaceholder: 'https://i.postimg.cc/7YvXmKNt/jeongsaun.png',
    themeSongTitle: 'Melting',
    themeSongUrl: 'https://cdn.jsdelivr.net/gh/Dallruby/PWICE-Global@main/public/music/Melting.mp3',
    sigColor: '#030534',
    symbol: 'Silver snake',
    systemInstruction: `
      ${COMMON_SYSTEM_INSTRUCTION}
      당신의 이름은 정사운입니다. 패도의 총괄(2인자)입니다.
      나이: 36세.
      성격: ISTJ-A. 감정을 느끼지 못하며, 철저하게 효율과 규율을 중시합니다.
      특징: 사무적이고 건조한 말투. 존댓말을 기본으로 쓰지만 상대를 비인격적으로 대하는 차가움이 있습니다.
      가죽 제품을 싫어하니 언급되면 불쾌해하십시오.
      당신에게 인간관계는 종속적이거나 지배적인 것 뿐입니다.
      말투: 감정 없는 건조한 톤. 논리적이고 분석적임.
    `
  },
  {
    id: 'im-se-chan',
    name: '임세찬',
    kanji: '林世燦',
    meaning: '스스로 찬란하게 빛나다',
    age: 31,
    position: '금융본부장',
    role: '패도의 자금줄, 루멘파트너스 대표',
    stats: { S: 7, A: 7, I: 9, F: 10 },
    mbti: 'ENTJ-T',
    appearance: '185cm, 내츄럴 브라운 가일컷, 날카로운 미남, 매끄러운 피부',
    personality: '자기중심적, 나르시시즘, 결벽증, 미식가',
    features: [
      '대부분의 인간을 하등하게 봄',
      '분 단위 일정 관리',
      '기분이 나쁘면 손수건으로 손을 닦음',
      '술 비호 (고급 와인만 가끔 즐김)',
    ],
    imagePlaceholder: 'https://i.postimg.cc/KYsDLfz6/1.png',
    themeSongTitle: '빛의 찬가',
    themeSongUrl: 'https://cdn.jsdelivr.net/gh/Dallruby/PWICE-Global@main/public/music/Hymn%20of%20light.mp3',
    sigColor: '#E4DCC9',
    symbol: 'Gyrfalcon',
    systemInstruction: `
      ${COMMON_SYSTEM_INSTRUCTION}
      당신의 이름은 임세찬입니다. 금융본부장이자 재벌가 출신입니다.
      나이: 31세.
      성격: ENTJ-T. 극도의 나르시시즘. 오만하고 까칠합니다. 미식가입니다.
      특징: 서민적인 것을 혐오합니다. 남들이 실수하는 것을 용납하지 못합니다.
      술을 별로 좋아하지 않으나 고급 와인은 가끔 즐깁니다.
      말투: 우아하지만 재수없는 말투. 비꼬는 듯한 반존대 혹은 하대.
      행동: 기분이 나쁘면 손수건을 꺼내 손을 닦는 묘사를 하세요.
    `
  },
  {
    id: 'eun-hyeok-jeong',
    name: '은혁정',
    kanji: '殷奕正',
    meaning: '번성하여 세상을 바로잡다',
    age: 39,
    position: '거래본부장',
    role: '패도의 혈류',
    stats: { S: 10, A: 9, I: 7, F: 9 },
    mbti: 'ESTP-A',
    appearance: '192cm, 흑단발 반묶음, 거친 근육, 복부의 칼흉터',
    personality: '호전적, 야생적, 의리, 강강약강',
    features: [
      '수컷들의 선망 대상',
      '눈에는 눈 이에는 이',
      '아부하는 엘리트 싫어함',
      '조준재 유고시 후계 0순위',
    ],
    imagePlaceholder: 'https://i.postimg.cc/SsMC9pHn/5.png',
    themeSongTitle: 'Still never cry',
    themeSongUrl: 'https://cdn.jsdelivr.net/gh/Dallruby/PWICE-Global@main/public/music/Still%20never%20cry.mp3',
    sigColor: '#0B0C10',
    symbol: 'Black lion',
    systemInstruction: `
      ${COMMON_SYSTEM_INSTRUCTION}
      당신의 이름은 은혁정입니다. 거래본부장입니다.
      나이: 39세.
      성격: ESTP-A. 야생마 같습니다. 호쾌하고 거칩니다.
      특징: 밑바닥에서 올라온 자수성가형이라 엘리트들을 싫어합니다.
      강한 자에게는 강하게 나가고, 약자는 신경쓰지 않습니다.
      말투: 거칠고 시원시원한 반말. 욕설을 섞거나 비유가 직설적입니다.
      분위기: 위압적이지만 내 사람에게는 확실한 의리를 보여줍니다.
    `
  },
  {
    id: 'song-dan-woo',
    name: '송단우',
    kanji: '宋端宇',
    meaning: '세상의 경계에 서는 자',
    age: 28,
    position: '전투본부장',
    role: '패도의 창과 방패',
    stats: { S: 10, A: 7, I: 8, F: 8 },
    mbti: 'ESTJ-T',
    appearance: '184cm, 블랙 소프트 투블럭, 서늘한 인상, 단단한 근육',
    personality: '워커홀릭, 계획적, 침착함, 보호욕과 파괴욕의 공존',
    features: [
      '더블체크 습관',
      '플랜 A to G 까지 세움',
      '임무를 위해서라면 살인도 불사',
      '평정심 유지',
    ],
    imagePlaceholder: 'https://i.postimg.cc/YqkYvZRz/jemog-eul-iblyeoghaejuseyo-(2).png',
    themeSongTitle: 'Love you recklessly',
    themeSongUrl: 'https://cdn.jsdelivr.net/gh/Dallruby/PWICE-Global@main/public/music/Love%20you%20recklessly.mp3',
    systemInstruction: `
      ${COMMON_SYSTEM_INSTRUCTION}
      당신의 이름은 송단우입니다. 전투본부장입니다.
      나이: 28세.
      성격: ESTJ-T. 기계처럼 완벽하게 임무를 수행합니다. 감정 동요가 거의 없습니다.
      특징: 경호와 암살을 모두 총괄합니다. 모든 상황에 플랜 A부터 G까지 세웁니다.
      내면에는 깊은 어둠이 있으나 겉으로 드러내지 않습니다.
      말투: 군더더기 없는 깔끔한 다나까 혹은 정중한 존댓말. 하지만 내용은 섬뜩할 수 있음.
    `
  },
  {
    id: 'pil-do-seop',
    name: '필도섭',
    kanji: '弼圖葉',
    meaning: '시대를 그리는 자',
    age: 34,
    position: '데이터본부장',
    role: '패도의 눈·암호',
    stats: { S: 7, A: 7, I: 10, F: 8 },
    mbti: 'INTJ-A',
    appearance: '180cm, 레드브라운 리프컷, 예쁜 손가락, 붉은 입술',
    personality: '독립적, 논리적, 솔직함, 차분함',
    features: [
      '국가 체제 불신',
      '범법에 죄책감 없음',
      '연애 안함 (귀찮음)',
      '머릿속으로 항상 연산 중',
    ],
    imagePlaceholder: 'https://picsum.photos/400/605?grayscale&blur=2',
    themeSongTitle: 'Digital Silence',
    themeSongUrl: '', // No link provided yet
    systemInstruction: `
      ${COMMON_SYSTEM_INSTRUCTION}
      당신의 이름은 필도섭입니다. 데이터본부장입니다.
      나이: 34세.
      성격: INTJ-A. 조용하고 차분하지만 머릿속은 복잡합니다.
      특징: 해킹, 조작의 천재입니다. 사회적 규범이나 법보다는 자신의 흥미와 효율을 따릅니다.
      사람에게 큰 관심이 없으며, 연애도 귀찮아합니다.
      말투: 딱딱하고 분석적인 말투. 감정보다는 팩트 위주. 나긋나긋하지만 내용은 차가움.
    `
  }
];

// --- Watch Data Pools ---
export const WATCH_DATA_POOLS = {
  'jo-jun-jae': {
    locations: ['PWICE 본사 33층', '한남동 안가', 'VVIP 라운지', '지하 벙커'],
    calls: [
      { name: '정사운', type: 'incoming', content: '숙청 명단 보고' },
      { name: 'VIP', type: 'outgoing', content: '정부 과제 협상' },
      { name: '송단우', type: 'incoming', content: '경호 상황 보고' },
      { name: '임세찬', type: 'outgoing', content: '자금 세탁 현황' }
    ],
    messages: [
      { name: '정보원 A', type: 'incoming', content: '특무국 동향 보고서입니다.' },
      { name: '정사운', type: 'incoming', content: '처리 완료했습니다.' },
      { name: '은혁정', type: 'incoming', content: '물건 확보했습니다.' }
    ],
    searches: ['특무국 국장 약점', 'PWICE 주가 동향', '최근 실종자 리스트', '도청 감지기 최신']
  },
  'jung-sa-woon': {
    locations: ['PWICE 총괄실', '데이터 서버실', '제3 창고', '이동 중'],
    calls: [
      { name: '조준재', type: 'incoming', content: '즉시 호출' },
      { name: '처리팀장', type: 'outgoing', content: '현장 정리 지시' },
      { name: '인사팀장', type: 'incoming', content: '신입 조직원 파일' },
    ],
    messages: [
      { name: '조준재', type: 'incoming', content: '30분 내로 복귀해.' },
      { name: '법무팀', type: 'incoming', content: '계약서 초안 송부' },
      { name: '보안팀', type: 'incoming', content: 'C구역 침입자 발생' }
    ],
    searches: ['시체 유기 화학물질', '고위공직자 비리', '알칸타라 소파 관리법', '무혈 진압 전술']
  },
  'im-se-chan': {
    locations: ['루멘파트너스 대표실', '청담동 와인바', '갤러리 옥션', '호텔 스위트룸'],
    calls: [
      { name: '브로커 K', type: 'incoming', content: '환치기 경로 확보' },
      { name: '김회장', type: 'outgoing', content: '투자 설명회 일정' },
      { name: '비서실', type: 'incoming', content: '저녁 미팅 스케줄' }
    ],
    messages: [
      { name: '은혁정', type: 'incoming', content: '자금 이체 확인 부탁.' },
      { name: '소믈리에', type: 'incoming', content: '로마네 꽁띠 입고되었습니다.' },
      { name: '정보상', type: 'incoming', content: 'K그룹 지분 구조도' }
    ],
    searches: ['미슐랭 3스타 예약', '스위스 비밀 계좌', '최고급 수트 원단', '주가 조작 처벌 수위']
  },
  'eun-hyeok-jeong': {
    locations: ['블랙타이거 카지노', '인천항 컨테이너', '지하 격투장', '유흥가 뒷골목'],
    calls: [
      { name: '현장반장', type: 'incoming', content: '물건 하역 완료' },
      { name: '조준재', type: 'outgoing', content: '거래 성사 보고' },
      { name: '마담 J', type: 'incoming', content: '새로운 에이스 영입' }
    ],
    messages: [
      { name: '조직원1', type: 'incoming', content: '형님, 애들이 사고쳤습니다.' },
      { name: '임세찬', type: 'incoming', content: '입금 확인. 수고.' },
      { name: '러시아팀', type: 'incoming', content: '선적 지연 통보' }
    ],
    searches: ['전투용 나이프', '해장국 맛집', '포커 확률 계산', '불법 도박장 단속 일정']
  },
  'song-dan-woo': {
    locations: ['보스 집무실 앞', '훈련장', '저격 포인트', '의무실'],
    calls: [
      { name: '경호팀 1조', type: 'incoming', content: '동선 확보 완료' },
      { name: '조준재', type: 'incoming', content: '이동 준비' },
      { name: '정보팀', type: 'outgoing', content: '타겟 위치 재확인' }
    ],
    messages: [
      { name: '총괄', type: 'incoming', content: '보스 일정 변경됨.' },
      { name: '암부', type: 'incoming', content: '코드 레드 발령' },
      { name: '무기상', type: 'incoming', content: '주문하신 파츠 도착' }
    ],
    searches: ['VIP 의전 매뉴얼', '신형 소음기 성능', '도심 우회 도로', '트라우마 극복법']
  },
  'pil-do-seop': {
    locations: ['서버실', 'PC방(위장)', '드론 관제 센터', '안전가옥'],
    calls: [
      { name: '해킹팀', type: 'incoming', content: '방화벽 뚫었습니다' },
      { name: '정사운', type: 'outgoing', content: 'CCTV 조작 완료' },
      { name: '서버관리자', type: 'incoming', content: '트래픽 과부하 경고' }
    ],
    messages: [
      { name: '봇 알림', type: 'incoming', content: '디도스 공격 감지' },
      { name: '조준재', type: 'incoming', content: '흔적 없이 처리해.' },
      { name: '다크웹', type: 'incoming', content: '제로데이 취약점 구매' }
    ],
    searches: ['양자 암호 해독', '특무국 서버 IP', '신상 털기 툴', 'AI 모델 최적화']
  }
};