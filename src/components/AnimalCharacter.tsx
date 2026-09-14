import type { AnimalKey } from '../data';
import { ANIMAL_IMAGES as IMAGES } from '../animalImages';

// intrinsic box는 기존 CSS 아트와 동일하게 200x250 유지 —
// 그래서 App.tsx의 <AnimalCharacter kind={...} scale={...}> 쓰던 방식은 그대로 다 작동함.

export default function AnimalCharacter({
  kind,
  scale = 1,
}: {
  kind: AnimalKey;
  scale?: number;
}) {
  return (
    <span
      style={{
        display: 'block',
        width: 200 * scale,
        height: 250 * scale,
      }}
    >
      <img
        src={IMAGES[kind]}
        alt={kind}
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />
    </span>
  );
}
