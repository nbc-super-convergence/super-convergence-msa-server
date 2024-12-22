/**
 * 주사위를 굴려 랜덤값을 반환함
 * @param {Number} diceMaxValue 주사위의 최대값
 * @param {Number} diceCount 주사위의 갯수
 */
export const getRollDiceResult = (diceMaxValue, diceCount) => {
  let result = 0;

  for (let i = 0; i < diceCount; i++) {
    result += Math.floor(Math.random() * diceMaxValue) + 1;
  }

  return result;
};
