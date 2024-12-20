import promptSync from 'prompt-sync';

const prompt = promptSync();
const input = prompt('값을 입력해주세요: ');

const beanshell = '0x';
const answer = [];

const splitedWord = input.split(' ');
splitedWord.forEach((value, index) => {
  index === splitedWord.length - 1
    ? answer.push(beanshell.concat(value))
    : answer.push(beanshell.concat(value, ','));
});

console.log(...answer);
console.log('          ');
console.log('          ');
