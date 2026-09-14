import type { AnimalKey } from './data';
import dogImg from './assets/animals/dog.png';
import catImg from './assets/animals/cat.png';
import rabbitImg from './assets/animals/rabbit.png';
import foxImg from './assets/animals/fox.png';

// 실제 일러스트 (배경 제거 완료). 화면(AnimalCharacter)과 저장용 결과 카드(resultCard)가 같이 씀
export const ANIMAL_IMAGES: Record<AnimalKey, string> = {
  dog: dogImg,
  cat: catImg,
  rabbit: rabbitImg,
  fox: foxImg,
};
