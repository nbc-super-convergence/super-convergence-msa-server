export const calculateGoldByRank = (currentGold, rank) => {
  switch (rank) {
    case 1:
      return Number(currentGold) + 20;
    case 2:
      return Number(currentGold) + 10;
    case 3:
      return Number(currentGold) + 5;
    case 4:
      return Number(currentGold) + 1;
  }
};
